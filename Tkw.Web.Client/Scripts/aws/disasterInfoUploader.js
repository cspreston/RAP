(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('disasterInfoUploader', {
        controller: DisasterInfoUploader,
        controllerAs: 'iu',
        templateUrl: '/AngularPartials/aws/disasterInfoUploader.html',
        binding: {
        }
    });

    DisasterInfoUploader.$inject = ['$scope', '$timeout', '$http', '$window'];

    function DisasterInfoUploader($scope, $timeout, $http, $window) {

        let iu = this;

        iu.parent = $scope.$parent;
        iu.fileTitle = '';
        iu.fileName = '';
        iu.fileDescription = '';
        iu.fileUrl = '';

        iu.$onInit = function () {
            iu.parent = $scope.$parent;

            console.log('Parent: ', iu.parent);
        };

        iu.urlsCallback = function (value) {

            console.log('Urls: ', value);

            iu.fileName = value.fileName;
            iu.fileUrl = value.fileUrl;
        };

        iu.saveNewFile = function () {

            var api = '/api/niv/AwsBuildingDisasterInfo/Post';

            var data = {
                BuildingId: iu.parent.BuildingId,
                Title: iu.fileTitle || 'DisasterInfoFile',
                Description: iu.fileDescription || 'Disaster Info File',
                File: {
                    FileName: iu.fileName,
                    FileDescription: iu.fileDescription,
                    FileUrl: iu.fileUrl
                }
            };

            $http.post(api, data).then(
                function (response) {
                    console.log(response);

                    var newFile = response.data;

                    iu.parent.CurrentBuilding.BuildingDisasterInfos.push(newFile);

                    iu.fileTitle = '';
                    iu.fileName = '';
                    iu.fileDescription = '';
                    iu.fileUrl = '';

                    $('#add_building_disaster_info').modal('hide');

                    $scope.$broadcast('aws-uploader-init');
                },
                function (error) {
                    console.log(error);
                }
            );
        };

    }
})();