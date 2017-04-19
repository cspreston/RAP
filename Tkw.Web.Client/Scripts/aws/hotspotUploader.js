(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('hotspotUploader', {
        controller: HotspotUploader,
        controllerAs: 'hu',
        templateUrl: '/AngularPartials/aws/hotspotUploader.html',
        binding: {
            hotspot: '<'
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
            hu.parent = $scope.$parent;
            console.log('Parent: ', hu.parent);
            console.log('Hotspot: ', hu.hotspot);
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
                HotspotId: hu.hotspot.Id,
                FileName: hu.imageName || 'HotspotAttachment',
                FileDescription: hu.imageDescription || 'Hotspot Attachment',
                Url: hu.fileUrl,
                ThumbUrl: hu.thumbUrl
            };

            $http.post(api, data).then(
                function (response) {
                    console.log(response);

                    var newImage = response.data;

                    hu.hotspot.Dto.Files.push(newImage);

                    $scope.$broadcast('aws-uploader-init');
                },
                function (error) {
                    console.log(error);
                }
            );
        };

    }
})();