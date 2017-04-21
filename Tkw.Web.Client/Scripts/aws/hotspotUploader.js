(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('hotspotUploader', {
        controller: HotspotUploader,
        controllerAs: 'hu',
        templateUrl: '/AngularPartials/aws/hotspotUploader.html',
        binding: {
        }
    });

    HotspotUploader.$inject = ['$scope', '$timeout', '$http', '$window'];

    function HotspotUploader($scope, $timeout, $http, $window) {

        let hu = this;

        hu.parent = $scope.$parent;
        hu.fileTitle = '';
        hu.fileName = '';
        hu.fileDescription = '';
        hu.fileUrl = '';
        hu.thumbUrl = '';

        hu.$onInit = function () {
            hu.parent = $scope.$parent.vc;

            $scope.$watch('hu.parent.SelectedHotspot', function (newValue, oldValue) {
                hu.hotspot = newValue;
                console.log('Selected Hotpsot: ', hu.hotspot);
            });
        };


        hu.urlsCallback = function (value) {

            console.log('Urls: ', value);

            hu.imageName = value.fileName;
            hu.fileUrl = value.fileUrl;
            hu.thumbUrl = value.thumbUrl;
        };

        hu.saveNewAttachment = function () {

            var api = '/api/niv/AwsHotspotAttachment/Post';

            var data = {
                Id: hu.hotspot.Dto.Id,
                BuildingId: hu.hotspot.Dto.BuildingId,
                BuildingPlanId: hu.hotspot.Dto.BuildingPlanId,
                Files: [
                    {
                        FileName: hu.fileName,
                        FileDescription: hu.fileDescription,
                        FileUrl: hu.fileUrl,
                        ThumbUrl: hu.thumbUrl
                    }
                ]
            };

            $http.post(api, data).then(
                function (response) {

                    var newImage = response.data;

                    hu.hotspot.Dto.Files.push(newImage);

                    hu.fileName = '';
                    hu.fileDescription = '';

                    $('#addHotspotAttachmentModal').modal('hide');
                    $scope.$broadcast('aws-uploader-init');
                },
                function (error) {
                    console.log(error);
                }
            );
        };

    }
})();