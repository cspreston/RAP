(function () {

	let app = angular.module('CTR-RAP-AWS');

	app.component('planUploader', {
		controller: PlanUploader,
		controllerAs: 'uc',
		templateUrl: '/AngularPartials/aws/planUploader.html',
        binding: {
            building: '<'
        }
	});

	PlanUploader.$inject = ['$timeout', '$http', '$state', 'Upload'];

	function PlanUploader($timeout, $http, $state, Upload) {

	    console.log('PlanUploader');

		let uc = this;

		uc.file = null;
		uc.progress = 0;
		uc.processing = false;
		uc.thumb = false;
		uc.zoom = false;
		uc.finished = false;
		uc.planName = '';
	    uc.planDescription = '';
	    uc.fileUrl = '';
		uc.thumbUrl = '';
		uc.dziUrl = '';

		uc.change = function () {
			console.log('File: ', uc.file);
		};

		uc.upload = function (file) {

			let newName = file.name.replace(/ /g, '-');

			file = Upload.rename(file, newName);

			$http.post('http://localhost:3000/s3/presign', {
				path: '/process',
				fileName: newName,
				contentType: file.type,
				timeout: 30000
			})
				.then(function (response) {

					var config = {
						url: response.data.url,
						headers: {
							"Content-Type": file.type
						},
						method: 'PUT',
						data: file
					};

					Upload.http(config).progress(function (evt) {

						uc.progress = parseInt(100.0 * evt.loaded / evt.total);

					}).success(function (data, status, headers, config) {

						$timeout(function() {
							processUpload(newName);
						}, 1000);

					}).error(function (data, status, headers, config) {

						console.warn(data, status);

					});
				})
				.catch(function (error) {
					console.log('Error: ', error);
				});
		};

		uc.remove = function () {
			uc.file = null;
		};

		uc.editPlan = function() {

			$state.go('edit', { dzi: uc.dziUrl });
		};

		function processUpload(fileName) {

			uc.processing = true;

			createThumbnail(fileName)
				.then(function(response) {
					console.log('Thumb Response: ', response.data);

					uc.thumbUrl = response.data.Location;

					return createDeepZoom(fileName);
				})
				.then(function(response) {
					console.log('Zoom Response: ', response.data);

					let dziImage = response.data.find(function(item) {
						return item.Location.endsWith('.dzi');
					});

					uc.dziUrl = dziImage.Location;

			        return saveFileInfo();
			    })
                .then(function(response) {
			        
					uc.finished = true;
			    })
				.catch(function(error) {
					console.log('Error: ', error);
				});
		}

		function createThumbnail(fileName) {

			let targetFile = 'thumbs/' + fileName.split('.')[0] + '-thumb.png';

			uc.thumb = true;

			return $http.post('http://localhost:3000/lambda/create/thumb', {
				sourceFile: 'process/' + fileName,
				targetFile: targetFile,
				thumbWidth: 200
			});
		}

		function createDeepZoom(fileName) {

			uc.thumb = false;
			uc.zoom = true;

			return $http.post('http://localhost:3000/lambda/create/zoom', {
				sourceFile: 'process/' + fileName,
				targetFolder: 'zoom'
			});
		}

        function saveFileInfo() {

            uc.zoom = false;
            uc.save = true;

            return $http.post('/api/niv/AwsPlan/AddPlan', {
                buildingId: uc.building.Id,
                name: uc.planName,
                description: uc.planDescription,
                thumbUrl: uc.thumbUrl,
                dziUrl: uc.dziUrl
            });
        }

	}
})();