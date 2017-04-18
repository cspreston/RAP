(function() {

    let app = angular.module('CTR-RAP-AWS');

	app.component('awsUploader', {
		controller: AwsUploader,
		controllerAs: 'au',
		templateUrl: '/AngularPartials/aws/awsUploader.html',
		bindings: {
            building: '<',
            accept: '@',
            folder: '@',
            thumb: '<',
            zoom: '<',
            done: '&'
        }
	});

	AwsUploader.$inject = ['$scope', '$timeout', '$http', '$state', 'Upload'];

    function AwsUploader($scope, $timeout, $http, $state, Upload) {

        var au = this;

        init();

        $scope.$on('aws-uploader-clear', function(event, data) {
            init();
        });

        function init() {
            au.file = null;
            au.progress = 0;
            au.processing = false;
            au.finished = false;
            au.fileName = '';
            au.fileUrl = '';
            au.awsUrl = '';
            au.thumbUrl = '';
            au.zoomUrl = '';
        }

        au.$onInit = function () {
		    au.folder = au.folder || 'files';
		};

		au.change = function () {
		    au.fileUrl = buildTargetPath(au.file.name, au.folder);
		};

		au.upload = function () {

		    let file = au.file;
		    let newName = au.fileUrl.split('/').reverse()[0];
		    let path = au.fileUrl.replace(newName, '');

		    file = Upload.rename(file, newName);

		    au.fileName = newName;

		    $http.post('http://localhost:3000/s3/presign', {
		        path: path,
		        fileName: newName,
		        contentType: file.type,
		        timeout: 30000
		    })
				.then(function (response) {

				    au.awsUrl = response.data.url.split('?')[0];

				    var config = {
				        url: response.data.url,
				        headers: {
				            "Content-Type": file.type
				        },
				        method: 'PUT',
				        data: file
				    };

				    Upload.http(config).progress(function (evt) {

				        au.progress = parseInt(100.0 * evt.loaded / evt.total);

				    }).success(function (data, status, headers, config) {

				        $timeout(function () {
				            processUpload();
				        }, 1000);

				    }).error(function (data, status, headers, config) {
				        au.processing = false;
				        au.finished = true;
				        console.warn(data, status);
				    });
				})
				.catch(function (error) {
				    au.processing = false;
				    au.finished = true;
				    console.log('Error: ', error);
				});
		};

		au.remove = function () {
		    au.file = null;
		};

		function processUpload() {

		    var steps = [];

			au.processing = true;

            if (au.thumb) {
                steps.push(createThumbnail());
            }

            if (au.zoom) {
                steps.push(createDeepZoom());
            }

            Promise.all(steps)
                .then(function (results) {
                    $scope.$applyAsync(function () {
                        au.processing = false;
                        au.finished = true;

                        au.done({
                            value: {
                                fileName: au.fileName,
                                fileUrl: au.awsUrl,
                                thumbUrl: au.thumbUrl,
                                zoomUrl: au.zoomUrl
                            }
                        });
                    });
                });
		}

		function createThumbnail() {

		    return new Promise(function (resolve, reject) {

		        let targetFile = au.fileUrl.replace(au.folder, 'thumbs');

		        return $http.post('http://localhost:3000/lambda/create/thumb', {
		            sourceFile: au.fileUrl,
		            targetFile: targetFile,
		            thumbWidth: 200
		        })
                    .then(function (response) {

		                au.thumbUrl = response.data.Location;

		                resolve(true);
                    })
		            .catch(function (error) {
		                console.log('Error: ', error);
		                reject(error);
		            });
		    });

		}

		function createDeepZoom() {

		    return new Promise(function (resolve, reject) {

		        let fileName = au.fileUrl.split('/').reverse()[0];
		        let targetFolder = au.fileUrl.replace('/' + fileName, '');

		        return $http.post('http://localhost:3000/lambda/create/zoom', {
		            sourceFile: au.fileUrl,
		            targetFolder: targetFolder
		        })
                    .then(function (response) {

		                console.log(response);
		                let dziImage = response.data.find(function (item) {
		                    return item.Location.endsWith('.dzi');
		                });

		                au.zoomUrl = dziImage.Location;

		                resolve(true);
                    })
		            .catch(function (error) {
		                console.log('Error: ', error);
		                reject(error);
		            });
		    });
		}

		function buildTargetPath(fileName, folder) {

		    var extension = fileName.split('.').reverse()[0];

		    var client = kebabCase(au.building.ActorName);
		    var building = kebabCase(au.building.Name);
		    var file = kebabCase(fileName.replace('.' + extension, ''));

		    return client + '/' + building + '/' + folder + '/' + file + '.' + extension;
		}

		function kebabCase(value) {

		    var result = value;

		    // Remove non-alphanumeric characters
		    result = result.replace(/[^A-Za-z0-9]+/g, ' ');

		    // Collapse whitespaces 
		    result = result.replace(/\s+/g, ' ');

		    // Replace whitespaces 
		    result = result.replace(/\s+/g, '-');

		    // Convert camelCase capitals to kebab-case.
		    result = result.replace(/([a-z][A-Z])/g, function (match) {
		        return match.substr(0, 1) + '-' + match.substr(1, 1).toLowerCase();
		    });

		    // Convert non-camelCase capitals to lowercase.
		    result = result.toLowerCase();

		    // Remove hyphens from both ends
		    result = result.replace(/^-+/, '').replace(/-$/, '');

		    return result;
		}
    }
})();