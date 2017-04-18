(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('fileUploader', {
        controller: FileUploader,
        controllerAs: 'fu',
        templateUrl: '/AngularPartials/aws/fileUploader.html',
        binding: {
        }
    });

    FileUploader.$inject = ['$scope', '$timeout', '$http', '$window'];

    function FileUploader($scope, $timeout, $http, $window) {

        let fu = this;

        fu.parent = $scope.$parent;
        fu.fileTitle = '';
        fu.fileName = '';
        fu.fileDescription = '';
        fu.fileUrl = '';

        fu.$onInit = function () {
            fu.parent = $scope.$parent;

            console.log('Parent: ', fu.parent);
        };

        fu.urlsCallback = function (value) {

            console.log('Urls: ', value);

            fu.fileName = value.fileName;
            fu.fileUrl = value.fileUrl;
        };

        fu.saveNewFile = function () {

            var api = '/api/niv/AwsBuildingFile/Post';

            var data = {
                BuildingId: fu.parent.BuildingId,
                Title: fu.fileTitle || 'BuildingFile',
                Description: fu.fileDescription || 'Building File',
                File: {
                    FileName: fu.fileName,
                    FileDescription: fu.fileDescription,
                    FileUrl: fu.fileUrl
                }
            };

            $http.post(api, data).then(
                function (response) {
                    console.log(response);

                    var newFile = response.data;

                    fu.parent.CurrentBuilding.BuildingFiles.push(newFile);

                    fu.fileTitle = '';
                    fu.fileName = '';
                    fu.fileDescription = '';
                    fu.fileUrl = '';

                    $('#add_building_file').modal('hide');

                    $scope.$broadcast('aws-uploader-clear');
                },
                function (error) {
                    console.log(error);
                }
            );
        };

    }
})();