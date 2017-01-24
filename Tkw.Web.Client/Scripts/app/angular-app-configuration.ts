module RapApp {
    export class AngularApp {
        public App : ng.IModule
        constructor() {
            // configure data store
            TKWApp.Data.Configure();
            // check if authenticated
            if (!TKWApp.Data.AuthenticationManager.isAuthenticated()) {
                // not authenticated, redirect to login
                TKWApp.HardRouting.ApplicationRoutes.redirect("Login");
            }

            // configure angular app
            this.App = angular.module("RAPApp", ['ngMap', 'ngDragDrop', "kendo.directives", 'ui.sortable', 'CTR-RAP-AWS']);
            // register app directives
            this.registerDirectives();
            // register app services - for directives that need services - stupid directives
            this.registerServices();
            // register app controllers
            this.registerControllers();
        }

        registerDirectives() {
            // register angular directive for image fallback source
            this.App.directive('fallbackSrc', () => {
                var fallbackSrc = {
                    link: function postLink(scope, iElement, iAttrs) {
                        iElement.bind('error', function () {
                            angular.element(this).attr("src", iAttrs.fallbackSrc);
                        });
                    }
                }
                return fallbackSrc;
            });
            // register angular directive for image backgrounds on other elements
            this.App.directive('backgroundSrc', () => {

                var fallbackSrc = {
                    link: function postLink(scope, iElement, iAttrs) {
                        var bg = iAttrs.backgroundSrc;
                        var fbg = iAttrs.backgroundFallbackSrc;
                        var img = new Image();
                        img.onerror = () => {
                            jQuery(iElement).css({ "background-image": "url('" + fbg + "')" });
                        };
                        img.onload = () => {
                            jQuery(iElement).css({ "background-image": "url('" + bg + "')" });
                        }
                        img.src = bg;
                    }
                }
                return fallbackSrc;
            });
            // register directive for image carousel
            this.App.directive('simpleSlider', ['SimpleSliderService', '$timeout', function (SimpleSliderService, $timeout) {

                'use strict';

                return {

                    restrict: 'AE',
                    scope: {
                        onChange: '&',
                        current: '=?currentSlide',
                        slider: '=?sliderInstance'
                    },

                    link: function postLink(scope, element, attrs) {

                        var options = attrs, disposeWatcher;

                        if (attrs.onChange) {
                            options.onChange = scope.onChange;
                        } else {
                            options.onChange = function (prev, next) {
                                if (parseInt(scope.current) !== next) {
                                    $timeout(function () {
                                        scope.$apply(function () {
                                            scope.current = next;
                                        });
                                    });
                                }
                            };
                        }

                        if (element[0].children.length === 0) {
                            disposeWatcher = scope.$watch(function () {
                                return element[0].children.length > 0;
                            }, function (hasChildren) {
                                if (hasChildren) {
                                    scope.slider = new SimpleSliderService(element[0], options);
                                    disposeWatcher();
                                }
                            });
                        } else {
                            scope.slider = new SimpleSliderService(element[0], options);
                        }

                        scope.$watch('current', function (next, prev) {
                            if (next && next !== prev) {
                                scope.slider.change(parseInt(next));
                            }
                        });

                    }
                };
            }]);

            // register loading directive
            this.App.directive('loading', function () {
                return {
                    restrict: 'E',
                    replace: true,
                    template: '<div class="loading-bar indeterminate margin-top-10"></div>',
                    link: function (scope, element, attr) {
                        scope.$watch('IsLoading', function (val) {
                            if (val)
                                $(element).show();
                            else
                                $(element).hide();
                        });
                    }
                }
            });

            this.App.directive('ngAutocomplete', function ($parse) {
                return {
                    scope: {
                        details: '=',
                        ngAutocomplete: '=',
                        options: '=',
                    },

                    link: function (scope, element, attrs, model) {
                        //options for autocomplete
                        var opts
                        //convert options provided to opts
                        var initOpts = function () {
                            opts = {}
                            if ((<any>scope).options) {
                                if ((<any>scope).options.types) {
                                    opts.types = []
                                    opts.types.push((<any>scope).options.types)
                                }
                                if ((<any>scope).options.bounds) {
                                    opts.bounds = (<any>scope).options.bounds
                                }
                                if ((<any>scope).options.country) {
                                    opts.componentRestrictions = {
                                        country: (<any>scope).options.country
                                    }
                                }
                            }
                        }
                        initOpts()

                        //create new autocomplete
                        //reinitializes on every change of the options provided
                        var newAutocomplete = function () {

                            (<any>scope).gPlace = new google.maps.places.Autocomplete((<any>element)[0], opts);
                            google.maps.event.addListener((<any>scope).gPlace, 'place_changed', function () {
                                scope.$apply(function () {
                                    (<any>scope).details = (<any>scope).gPlace.getPlace();
                                    if ((<any>scope).details.geometry && (<any>scope).$parent && (<any>scope).$parent.EditBuilding)  {
                                        var coord = Array<Number>();
                                        coord.push((<any>scope).details.geometry.location.lat());
                                        coord.push((<any>scope).details.geometry.location.lng());

                                        (<any>scope).$parent.EditBuilding.Geopoints = JSON.stringify(coord);
                                        (<any>scope).$parent.renderMap = !(<any>scope).$parent.renderMap;
                                    }
                                    (<any>scope).ngAutocomplete = element.val();
                                });
                            })
                        }
                        newAutocomplete();

                        //watch options provided to directive
                        (<any>scope).watchOptions = function () {
                            return (<any>scope).options
                        };
                        scope.$watch((<any>scope).watchOptions, function () {
                            initOpts()
                            newAutocomplete();
                            (<any>element).value = '';
                            (<any>scope).ngAutocomplete = element.val();
                        }, true);
                    }
                };
            });
            this.App.directive('onLongPress', function ($timeout) {
                return {
                    restrict: 'A',
                    link: function (scope, $elm, $attrs) {
                        $elm.bind('touchstart', function (evt) {
                            // Locally scoped variable that will keep track of the long press
                            (<any>scope).longPress = true;
                            evt.preventDefault();
                            evt.stopPropagation();
                            var touched = document.getElementsByClassName("spot-touched");
                            for (var t = 0; t < touched.length; t++) {
                                $(touched[t]).removeClass("spot-touched");
                            }
                            // We'll set a timeout for 600 ms for a long press
                            $timeout(function () {
                              
                                if ((<any>scope).longPress) {
                                    // If the touchend event hasn't fired,
                                    // apply the function given in on the element's on-long-press attribute
                                    $((<any>$attrs).$$element[0]).find('img').addClass("spot-touched");
                                    (<any>scope).$apply(function () {
                                        (<any>scope).$eval((<any>$attrs).onLongPress)
                                    });
                                }
                            }, 600);
                        });

                        $elm.bind('touchend', function (evt) {
                            // Prevent the onLongPress event from firing
                            (<any>scope).longPress = false;
                            // If there is an on-touch-end function attached to this element, apply it
                            if ((<any>$attrs).onTouchEnd) {
                                (<any>scope).$apply(function () {
                                    (<any>scope).$eval((<any>$attrs).onTouchEnd)
                                });
                            }
                        });
                    }
                };
            })

            this.App.directive('map', function () {
                return {
                    restrict: 'E',
                    replace: true,
                    template: '<div></div>',
                    link: function ($scope, element, attrs) {
                        $scope.$watch('renderMap', function () {
                            var lat, lon = 0;
                            var gp = (<any>attrs).geopoints;
                            if (gp) {
                                lat = JSON.parse(gp)[0];
                                lon = JSON.parse(gp)[1];
                            }
                            var mapType = <string>(<any>attrs).maptype;
                            var type: google.maps.MapTypeId = <google.maps.MapTypeId>google.maps.MapTypeId[mapType];
                            if (!type) {
                                type = google.maps.MapTypeId.SATELLITE;
                            }
                            var center = new google.maps.LatLng(lat, lon);
                            var map_options = {
                                zoom: parseInt((<any>attrs).zoom),
                                center: center,
                                mapTypeId: type
                            };
                            // create map
                            var map = new google.maps.Map(document.getElementById((<any>attrs).id), map_options);
                            // configure marker
                            var marker_options = {
                                map: map,
                                position: center
                            };
                            // create marker
                            var marker = new google.maps.Marker(marker_options);
                            window.setTimeout(function () {
                                google.maps.event.trigger(map, 'resize');
                            }, 500);
                        });
                    }
                }
            });
        }
       
        registerServices() { 
            var context = window;
            var module = this.App;
            this.App.factory('SimpleSliderService', function () {

                    'use strict';

                    return typeof module != 'undefined' && (<any>module).exports ? // jshint ignore:line
                        (<any>module).exports :
                        (<any>context).SimpleSlider;
                })
        }
        configureRoutes() {
            //this.App.config(['$routeProvider',
            //    function routes($routeProvider: ng.route.IRouteProvider) { 
            //        // *** $routeProvider is typed with ng.route.IRouteProvider ***
            //        $routeProvider
            //            .when('/', {
            //                templateUrl: 'views/MyView.html',
            //                controller: 'app.controllers.MyController'
            //            })
            //            .otherwise({
            //                redirectTo: '/'
            //            });
            //    }
            //]);

        }

        registerControllers() {
            // register controllers used in the app
            this.App.controller("BuildingsController", ["$scope", ($scope) =>
                new RapApp.Controllers.BuildingsController($scope)]);
            this.App.controller("BuildingController", ["$scope", ($scope) =>new RapApp.Controllers.BuildingController($scope)]);

            this.App.controller("PricingInfosController", ["$scope", ($scope) =>
                new RapApp.Controllers.PricingInfoController($scope, true, false)]);

            this.App.controller("ContactInfosController", ["$scope", ($scope) =>
                new RapApp.Controllers.ContactInfoController($scope, true, false)]);

            this.App.controller("PlanController", ["$scope", ($scope) =>
                new RapApp.Controllers.PlanController($scope)]);

            this.App.controller("SearchController", ["$scope", ($scope) =>
                new RapApp.Controllers.SearchController($scope)]);

            this.App.controller("PlanEditController", ["$scope", ($scope) =>
                new RapApp.Controllers.PlanEditController($scope)]);

            this.App.controller("PlanBulkInsertController", ["$scope", ($scope) =>
                new RapApp.Controllers.PlanBulkInsertController($scope)]);

            this.App.controller("FileManagerController", ["$scope", ($scope) =>
                new RapApp.Controllers.FileManagerController($scope)]);


             //this.App.controller("BuildingsController", ["$scope", "all", ($scope) => {
            //    var controller: RapApp.Controllers.BuildingsController = new RapApp.Controllers.BuildingsController($scope);
            //    controller.loadBuildings();
            //    return controller;
            //}
            //]);
            //this.App.controller("BuildingController", ["$scope", "all", ($scope) => {
            //    var controller: RapApp.Controllers.BuildingsController = new RapApp.Controllers.BuildingsController($scope);
            //    controller.loadBuilding(TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"]);
            //    return controller;
            //}
            //]);
        }
      
    }
    export var App = new AngularApp();
}