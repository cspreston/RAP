(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('contactsImporter', {
        controller: ContactsImporter,
        controllerAs: 'ci',
        templateUrl: '/AngularPartials/aws/contactsImporter.html',
        binding: {
        }
    });

    ContactsImporter.$inject = ['$scope', '$timeout', '$http', '$window'];

    function ContactsImporter($scope, $timeout, $http, $window) {

        let ci = this;

        ci.parent = $scope.$parent;
        ci.fileUrl = '';
        ci.step = 'choose';

        ci.$onInit = function () {
            ci.parent = $scope.$parent;
            console.log('Parent: ', ci.parent);
        };

        ci.urlsCallback = function (value) {
            ci.fileUrl = value.fileUrl;
            ci.fileUrl = ci.fileUrl.replace('http:', 'https:');
        };

        ci.importContacts = function () {

            ci.step = 'extract';

            extractContacts()
                .then(function (data) {

                    ci.step = 'save';

                    return saveContacts(data);
                })
                .then(function(newContacts) {

                    $timeout(function() {
                        $scope.$apply(function() {
                            newContacts.forEach(function(item) {
                                ci.parent.CurrentBuilding.ContactInfos.push(item);
                            });
                        });
                    }, 500);
                    
                    $('#import_building_contacts').modal('hide');

                    $scope.$broadcast('aws-uploader-init');
                })
                .catch(function (error) {
                    console.log(error);
                });
        };

        function extractContacts() {

		    return new Promise(function (resolve, reject) {

		        let sourceFile = ci.fileUrl;
                let requestUrl = 'http://' + window.location.hostname + ':3000/excel/extract/data';

                return $http.post(requestUrl, {
		            sourceFile: sourceFile
		        })
                    .then(function (response) {

                        let data = [];

                        response.data.forEach(function(sheet) {
                            data = data.concat(sheet.data);
                        });

		                resolve(data);
                    })
		            .catch(function (error) {
		                reject(error);
		            });
		    });

		}

        function saveContacts(data) {

            return new Promise(function(resolve, reject) {

                var api = '/api/niv/AwsContactInfo/Post';

                let contacts = data.map(function(item) {
                    return {
                        BuildingId: ci.parent.BuildingId,
                        Title: item.title,
                        FirstName: item.firstName,
                        LastName: item.lastName,
                        Address: item.address,
                        SecondAddress: item.address2,
                        City: item.city,
                        State: item.state,
                        Zip: item.zip,
                        Role: item.role,
                        EmailAddress: item.email,
                        Phone: item.phone,
                        MobilePhone: item.mobile
                    };
                });

                $http.post(api, contacts).then(
                    function (response) {
                        var newContacts = response.data;
                        resolve(newContacts);
                    },
                    function (error) {
                        console.log(error);
                        reject(error);
                    }
                );
            });
        }    
    }
})();