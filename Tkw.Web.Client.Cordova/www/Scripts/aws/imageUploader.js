(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('imageUploader', {
        controller: ImageUploader,
        controllerAs: 'iu',
        templateUrl: '/AngularPartials/aws/imageUploader.html',
        binding: {
        }
    });

    ImageUploader.$inject = ['$scope', '$timeout', '$http', '$window'];

    function ImageUploader($scope, $timeout, $http, $window) {

        let iu = this;

        iu.parent = $scope.$parent;
        iu.imageName = '';
        iu.imageDescription = '';
        iu.fileUrl = '';
        iu.thumbUrl = '';

        iu.$onInit = function () {
            iu.parent = $scope.$parent;

            console.log('Parent: ', iu.parent);
        };

        iu.urlsCallback = function (value) {

            console.log('Urls: ', value);

            iu.imageName = value.fileName;
            iu.fileUrl = value.fileUrl;
            iu.thumbUrl = value.thumbUrl;
        };

        iu.saveNewImage = function () {

            var api = '/api/niv/AwsBuildingImage/Post';

            var data = {
                BuildingId: iu.parent.BuildingId,
                FileName: iu.imageName || 'BuildingImage',
                FileDescription: iu.imageDescription || 'Building Image',
                Url: iu.fileUrl,
                ThumbUrl: iu.thumbUrl
            };

            $http.post(api, data).then(
                function (response) {
                    console.log(response);

                    var newImage = response.data;

                    iu.parent.CurrentBuilding.BuildingImages.push(newImage);
                    $('#add_building_image').modal('hide');
                },
                function (error) {
                    console.log(error);
                }
            );
        };

    }
})();