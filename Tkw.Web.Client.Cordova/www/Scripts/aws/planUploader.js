(function () {

	let app = angular.module('CTR-RAP-AWS');

	app.component('planUploader', {
		controller: PlanUploader,
		controllerAs: 'uc',
		templateUrl: '/AngularPartials/aws/planUploader.html',
		binding: {
        }
	});

	PlanUploader.$inject = ['$scope', '$timeout', '$http', '$window'];

	function PlanUploader($scope, $timeout, $http, $window) {

		let uc = this;

        uc.parent = $scope.$parent;
		uc.planName = '';
	    uc.planDescription = '';
	    uc.fileUrl = '';
	    uc.thumbUrl = '';
	    uc.zoomUrl = '';

	    uc.$onInit = function() {
            uc.parent = $scope.$parent;

	        console.log('Parent: ', uc.parent);
	    };

	    uc.urlsCallback = function(value) {

	        console.log('Urls: ', value);

            uc.fileUrl = value.fileUrl;
            uc.thumbUrl = value.thumbUrl;
            uc.zoomUrl = value.zoomUrl;
	    };

	    uc.saveNewPlan = function () {

	        var api = '/api/niv/AwsBuildingPlan/Post';

	        var data = {
	            BuildingId: uc.parent.BuildingId,
	            BuildingName: uc.parent.CurrentBuilding.Name,
	            Name: uc.planName,
	            Description: uc.planDescription,
	            PlanFile: {
	                BuildingId: uc.parent.BuildingId,
	                FileName: uc.fileUrl.split('/').reverse()[0],
	                FileDescription: uc.parent.CurrentBuilding.Name + ' Plan File',
	                FileUrl: uc.fileUrl,
	                ThumbUrl: uc.thumbUrl,
	                ZoomUrl: uc.zoomUrl
	            },
	            PlanThumbnailFile: {
	                BuildingId: uc.parent.BuildingId,
	                FileName: uc.thumbUrl.split('/').reverse()[0],
	                FileDescription: uc.parent.CurrentBuilding.Name + ' Plan Thumb File',
	                FileUrl: uc.thumbUrl,
	                ThumbUrl: '',
	                ZoomUrl: ''
	            },
	            PlanZoomFile: {
	                BuildingId: uc.parent.BuildingId,
	                FileName: uc.zoomUrl.split('/').reverse()[0],
	                FileDescription: uc.parent.CurrentBuilding.Name + ' Plan Zoom File',
	                FileUrl: uc.zoomUrl,
	                ThumbUrl: '',
	                ZoomUrl: ''
	            }
	        };

	        $http.post(api, data).then(
                function(response) {
                    console.log(response);

                    var newPlan = response.data;

                    $window.location.href = '/plan?id=' + newPlan.Id;
                },
                function(error) {
                    console.log(error);
                }
            );
	    };

	}
})();