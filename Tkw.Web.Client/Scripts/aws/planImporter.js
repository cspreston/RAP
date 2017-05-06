(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('planImporter', {
        controller: PlanImporter,
        controllerAs: 'pi',
        templateUrl: '/AngularPartials/aws/planImporter.html',
        binding: {
        }
    });

    PlanImporter.$inject = ['$scope', '$timeout', '$http', '$window'];

    function PlanImporter($scope, $timeout, $http, $window) {

        let pi = this;

        pi.parent = $scope.$parent;
        pi.fileUrl = '';
        pi.pages = 1;
        pi.plans = {};
        pi.step = 'choose';

        pi.$onInit = function () {
            pi.parent = $scope.$parent;
            console.log('Parent: ', pi.parent);
        };

        pi.urlsCallback = function (value) {
            pi.fileUrl = value.fileUrl;
        };

        pi.importPlans = function () {

            pi.step = 'pages';

            getPages()
                .then(function(pages) {
                    pi.pages = pages;

                    pi.step = 'extract';

                    return extractImages();
                })
                .then(function (imageUrls) {

                    imageUrls.forEach(function (item) {

                        let id = item.split('/').reverse()[0].replace('.jpg', '');

                        pi.plans[id] = {
                            image: item,
                            thumb: '',
                            zoom: ''
                        };
                    });

                    pi.step = 'thumbs';

                    return createThumbnails(imageUrls);
                })
                .then(function (thumbUrls) {

                    thumbUrls.forEach(function (item) {

                        let id = item.split('/').reverse()[0].replace('.jpg', '');

                        pi.plans[id].thumb = item;
                    });

                    pi.step = 'zooms';

                    return createZoomImages();
                })
                .then(function (zoomUrls) {

                    zoomUrls.forEach(function (item) {

                        let id = item.split('/').reverse()[0].replace('.dzi', '');

                        pi.plans[id].zoom = item;
                    });

                    pi.step = 'save';

                    return savePlans();
                })
                .then(function(newPlans) {

                    $timeout(function() {
                        $scope.$apply(function() {
                            newPlans.forEach(function(item) {
                                pi.parent.CurrentBuilding.BuildingPlans.push(item);
                            });
                        });
                    }, 500);
                    
                    $('#import_building_plans').modal('hide');

                    $scope.$broadcast('aws-uploader-init');
                })
                .catch(function (error) {
                    console.log(error);
                });
        };

        function getPages() {

            return new Promise(function(resolve, reject) {
                
                PDFJS.getDocument(pi.fileUrl)
                    .then(function(pdf) {
                        resolve(pdf.numPages);
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            });
        }

        function extractImages() {

		    return new Promise(function (resolve, reject) {

		        let fileUrl = pi.fileUrl.replace('http://', '');
		        let segments = fileUrl.split('/');

		        segments.shift();

		        let sourceFile = segments.join('/');
		        let targetFile = sourceFile.replace('.pdf', '.jpg');
                let requestUrl = 'http://' + window.location.hostname + ':3000/lambda/extract/plans';

                return $http.post(requestUrl, {
		            sourceFile: sourceFile,
		            targetFile: targetFile,
		            pages: pi.pages
		        })
                    .then(function (response) {
		                resolve(response.data.Locations || []);
                    })
		            .catch(function (error) {
		                reject(error);
		            });
		    });

		}

        function createThumbnails(imageUrls) {

            let params = {
                sourceFolder: 'plans',
                targetFolder: 'thumbs',
                thumbWidth: 200,
                locations: imageUrls
            };

            return new Promise(function(resolve, reject) {
                
                let requestUrl = 'http://' + window.location.hostname + ':3000/lambda/create/thumbs';

                return $http.post(requestUrl, params)
                    .then(function (response) {

                        let thumbUrls = response.data.map(function(item) {
                            return item.Location;
                        });

                        resolve(thumbUrls || []);
                    })
		            .catch(function (error) {
		                reject(error);
		            });
            });
        }

        function createZoomImages() {

            let imageUrls = [];

            for (var key in pi.plans) {
                imageUrls.push(pi.plans[key].image);
            }

            let urlSegments = imageUrls[0].split().reverse();
            let client = urlSegments[3];
            let building = urlSegments[2];

            let params = {
                targetFolder: client + '/' + building + '/plans/',
                locations: imageUrls
            };

            return new Promise(function (resolve, reject) {
                
                let requestUrl = 'http://' + window.location.hostname + ':3000/lambda/create/zooms';

                return $http.post(requestUrl, params)
                    .then(function (response) {

                        let zoomUrls = response.data.map(function (files) {

                            let dzi = files.find(function(item) {
                                return item.Location.endsWith('.dzi');
                            });

                            return dzi.Location;
                        });

                        resolve(zoomUrls || []);
                    })
		            .catch(function (error) {
		                reject(error);
		            });
            });
        }

        function savePlans() {

            return new Promise(function(resolve, reject) {

                let promises = [];

                for (var key in pi.plans) {
                    promises.push(savePlan(key, pi.plans[key]));
                }

                Promise.all(promises)
                    .then(function(results) {
                        resolve(results);
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            });
        }
    
        function savePlan(name, plan) {

            return new Promise(function(resolve, reject) {
                
                var api = '/api/niv/AwsBuildingPlan/Post';

                var data = {
                    BuildingId: pi.parent.BuildingId,
                    BuildingName: pi.parent.CurrentBuilding.Name,
                    Name: name,
                    Description: '',
                    PlanFile: {
                        BuildingId: pi.parent.BuildingId,
                        FileName: name + '.jpg',
                        FileDescription: pi.parent.CurrentBuilding.Name + ' Plan File',
                        FileUrl: plan.image,
                        ThumbUrl: plan.thumb,
                        ZoomUrl: plan.zoom
                    },
                    PlanThumbnailFile: {
                        BuildingId: pi.parent.BuildingId,
                        FileName: name + '.jpg',
                        FileDescription: pi.parent.CurrentBuilding.Name + ' Plan Thumb File',
                        FileUrl: plan.thumb,
                        ThumbUrl: '',
                        ZoomUrl: ''
                    },
                    PlanZoomFile: {
                        BuildingId: pi.parent.BuildingId,
                        FileName: name + '.dzi',
                        FileDescription: pi.parent.CurrentBuilding.Name + ' Plan Zoom File',
                        FileUrl: plan.zoom,
                        ThumbUrl: '',
                        ZoomUrl: ''
                    }
                };

                $http.post(api, data).then(
                    function (response) {
                        var newPlan = response.data;
                        resolve(newPlan);
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