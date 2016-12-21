var RapApp;
(function (RapApp) {
    var AngularApp = (function () {
        function AngularApp() {
            // configure data store
            TKWApp.Data.Configure();
            // check if authenticated
            if (!TKWApp.Data.AuthenticationManager.isAuthenticated()) {
                // not authenticated, redirect to login
                TKWApp.HardRouting.ApplicationRoutes.redirect("Login");
            }
            // configure angular app
            this.App = angular.module("RAPApp", ['ngDragDrop', "kendo.directives", 'ui.sortable']).config(function ($sceDelegateProvider) {
                $sceDelegateProvider.resourceUrlWhitelist(['**']);
            });
            // register app directives
            this.registerDirectives();
            // register app services - for directives that need services - stupid directives
            this.registerServices();
            // register app controllers
            this.registerControllers();
        }
        AngularApp.prototype.registerDirectives = function () {
            // register angular directive for image fallback source
            this.App.directive('fallbackSrc', function () {
                var fallbackSrc = {
                    link: function postLink(scope, iElement, iAttrs) {
                        iElement.bind('error', function () {
                            angular.element(this).attr("src", iAttrs.fallbackSrc);
                        });
                    }
                };
                return fallbackSrc;
            });
            // register angular directive for image backgrounds on other elements
            this.App.directive('backgroundSrc', function () {
                var fallbackSrc = {
                    link: function postLink(scope, iElement, iAttrs) {
                        var bg = iAttrs.backgroundSrc;
                        var fbg = iAttrs.backgroundFallbackSrc;
                        var img = new Image();
                        img.onerror = function () {
                            jQuery(iElement).css({ "background-image": "url('" + fbg + "')" });
                        };
                        img.onload = function () {
                            jQuery(iElement).css({ "background-image": "url('" + bg + "')" });
                        };
                        img.src = bg;
                    }
                };
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
                            }
                            else {
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
                            }
                            else {
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
                    //template: '<div class="loading-bar indeterminate margin-top-10"></div>',
                    template: '<div style="position: fixed; left: 45%; top: 50%; display:none;z-index:999999999"><img src="Content/loaders/spinningwheel.gif"></img></div>',
                    link: function (scope, element, attr) {
                        scope.$watch('IsLoading', function (val) {
                            if (val)
                                $(element).show();
                            else
                                $(element).hide();
                        });
                    }
                };
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
                        var opts;
                        //convert options provided to opts
                        var initOpts = function () {
                            opts = {};
                            if (scope.options) {
                                if (scope.options.types) {
                                    opts.types = [];
                                    opts.types.push(scope.options.types);
                                }
                                if (scope.options.bounds) {
                                    opts.bounds = scope.options.bounds;
                                }
                                if (scope.options.country) {
                                    opts.componentRestrictions = {
                                        country: scope.options.country
                                    };
                                }
                            }
                        };
                        initOpts();
                        //create new autocomplete
                        //reinitializes on every change of the options provided
                        var newAutocomplete = function () {
                            scope.gPlace = new google.maps.places.Autocomplete(element[0], opts);
                            google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                                scope.$apply(function () {
                                    scope.details = scope.gPlace.getPlace();
                                    if (scope.details.geometry && scope.$parent && scope.$parent.EditBuilding) {
                                        var coord = Array();
                                        coord.push(scope.details.geometry.location.lat());
                                        coord.push(scope.details.geometry.location.lng());
                                        scope.$parent.EditBuilding.Geopoints = JSON.stringify(coord);
                                        scope.$parent.renderMap = !scope.$parent.renderMap;
                                    }
                                    scope.ngAutocomplete = element.val();
                                });
                            });
                        };
                        newAutocomplete();
                        //watch options provided to directive
                        scope.watchOptions = function () {
                            return scope.options;
                        };
                        scope.$watch(scope.watchOptions, function () {
                            initOpts();
                            newAutocomplete();
                            element.value = '';
                            scope.ngAutocomplete = element.val();
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
                            scope.longPress = true;
                            evt.preventDefault();
                            evt.stopPropagation();
                            var touched = document.getElementsByClassName("spot-touched");
                            for (var t = 0; t < touched.length; t++) {
                                $(touched[t]).removeClass("spot-touched");
                            }
                            // We'll set a timeout for 600 ms for a long press
                            $timeout(function () {
                                if (scope.longPress) {
                                    // If the touchend event hasn't fired,
                                    // apply the function given in on the element's on-long-press attribute
                                    $($attrs.$$element[0]).find('img').addClass("spot-touched");
                                    scope.$apply(function () {
                                        scope.$eval($attrs.onLongPress);
                                        $("#sitekey").hide();
                                        $("#sitekeyPoint").hide();
                                        $('#main').show();
                                    });
                                }
                            }, 600);
                        });
                        $elm.bind('touchend', function (evt) {
                            // Prevent the onLongPress event from firing
                            scope.longPress = false;
                            // If there is an on-touch-end function attached to this element, apply it
                            if ($attrs.onTouchEnd) {
                                scope.$apply(function () {
                                    scope.$eval($attrs.onTouchEnd);
                                });
                            }
                        });
                    }
                };
            });
            this.App.directive('map', function () {
                return {
                    restrict: 'E',
                    replace: true,
                    template: '<div></div>',
                    link: function ($scope, element, attrs) {
                        $scope.$watch('renderMap', function () {
                            var lat, lon = 0;
                            var gp = attrs.geopoints;
                            if (gp) {
                                lat = JSON.parse(gp)[0];
                                lon = JSON.parse(gp)[1];
                            }
                            var mapType = attrs.maptype;
                            var type = google.maps.MapTypeId[mapType];
                            if (!type) {
                                type = google.maps.MapTypeId.SATELLITE;
                            }
                            var center = new google.maps.LatLng(lat, lon);
                            var map_options = {
                                zoom: parseInt(attrs.zoom),
                                center: center,
                                mapTypeId: type
                            };
                            // create map
                            var map = new google.maps.Map(document.getElementById(attrs.id), map_options);
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
                };
            });
        };
        AngularApp.prototype.registerServices = function () {
            var context = window;
            var module = this.App;
            this.App.factory('SimpleSliderService', function () {
                'use strict';
                return typeof module != 'undefined' && module.exports ?
                    module.exports :
                    context.SimpleSlider;
            });
        };
        AngularApp.prototype.configureRoutes = function () {
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
        };
        AngularApp.prototype.registerControllers = function () {
            // register controllers used in the app
            this.App.controller("BuildingsController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.BuildingsController($scope);
            }]);

            this.App.controller("OfflineBuildingsController", ["$scope", function ($scope) {
                 return new RapApp.Controllers.OfflineBuildingsController($scope);
            }]);


            this.App.controller("OfflineBuildingController", ["$scope", function ($scope) {
                return new RapApp.Controllers.OfflineBuildingController($scope);
            }]);
                                                    
            this.App.controller("OfflinePlanController", ["$scope", function ($scope) {
                return new RapApp.Controllers.OfflinePlanController($scope);
            }]);

            this.App.controller("BuildingController", ["$scope", function ($scope) { return new RapApp.Controllers.BuildingController($scope); }]);

            this.App.controller("PricingInfosController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.PricingInfoController($scope, true, false);
                }]);
            this.App.controller("ContactInfosController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.ContactInfoController($scope, true, false);
                }]);
            this.App.controller("PlanController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.PlanController($scope);
                }]);
            this.App.controller("SearchController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.SearchController($scope);
                }]);
            this.App.controller("PlanEditController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.PlanEditController($scope);
                }]);
            this.App.controller("PlanBulkInsertController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.PlanBulkInsertController($scope);
                }]);
            this.App.controller("FileManagerController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.FileManagerController($scope);
                }]);
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
        };
        return AngularApp;
    })();
    RapApp.AngularApp = AngularApp;
    RapApp.App = new AngularApp();
})(RapApp || (RapApp = {}));
//# sourceMappingURL=angular-app-configuration.js.map