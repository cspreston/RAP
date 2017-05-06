(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('pricingImporter', {
        controller: PricingImporter,
        controllerAs: 'pi',
        templateUrl: '/AngularPartials/aws/pricingImporter.html',
        binding: {
        }
    });

    PricingImporter.$inject = ['$scope', '$timeout', '$http', '$window'];

    function PricingImporter($scope, $timeout, $http, $window) {

        let pi = this;

        pi.parent = $scope.$parent;
        pi.fileUrl = '';
        pi.step = 'choose';

        pi.$onInit = function () {
            pi.parent = $scope.$parent;
            console.log('Parent: ', pi.parent);
        };

        pi.urlsCallback = function (value) {
            pi.fileUrl = value.fileUrl;
            pi.fileUrl = pi.fileUrl.replace('http:', 'https:');
        };

        pi.importPricings = function () {

            pi.step = 'extract';

            extractPricings()
                .then(function (data) {

                    pi.step = 'save';

                    return saveContacts(data);
                })
                .then(function(newPricings) {

                    $timeout(function() {
                        $scope.$apply(function() {
                            newPricings.forEach(function (item) {
                                pi.parent.CurrentBuilding.PricingInfos.push(item);
                            });
                        });
                    }, 500);
                    
                    $('#import_building_pricing').modal('hide');

                    $scope.$broadcast('aws-uploader-init');
                })
                .catch(function (error) {
                    console.log(error);
                });
        };

        function extractPricings() {

		    return new Promise(function (resolve, reject) {

		        let sourceFile = pi.fileUrl;
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

            console.log('Pricing Data: ', data);
            return new Promise(function(resolve, reject) {

                var api = '/api/niv/AwsPricingInfo/Post';

                let infos = data.map(function(item) {
                    return {
                        BuildingId: pi.parent.BuildingId,
                        Name: item.name,
                        Description: item.description,
                        Units: item.units,
                        UnitPrice: item.unitPrice,
                        Quantity: item.qty
                    };
                });

                $http.post(api, infos).then(
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