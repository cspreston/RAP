var RapApp;
(function (RapApp) {
    var AngularAdminApp = (function () {
        function AngularAdminApp() {
            // configure data store
            TKWApp.Data.Configure();
            // check if authenticated
            if (!TKWApp.Data.AuthenticationManager.isAuthenticated()) {
                // not authenticated, redirect to login
                TKWApp.HardRouting.ApplicationRoutes.redirect("Login");
            }
            // configure angular app
            this.App = angular.module("RAPAdminApp", ["kendo.directives"]);
            this.registerDirectives();
            // register app services - for directives that need services - stupid directives
            this.registerServices();
            // register app controllers
            this.registerControllers();
        }
        AngularAdminApp.prototype.registerDirectives = function () {
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
                };
            });
            //register directives for compare two values
            this.App.directive('equals', function () {
                return {
                    restrict: 'A',
                    require: '?ngModel',
                    link: function (scope, elem, attrs, ngModel) {
                        if (!ngModel)
                            return; // do nothing if no ng-model
                        // watch own value and re-validate on change
                        scope.$watch(attrs.ngModel, function () {
                            validate();
                        });
                        // observe the other value and re-validate on change
                        attrs.$observe('equals', function (val) {
                            validate();
                        });
                        var validate = function () {
                            // values
                            var val1 = ngModel.$viewValue;
                            var val2 = attrs.equals;
                            // set validity
                            ngModel.$setValidity('equals', !val1 || !val2 || val1 === val2);
                        };
                    }
                };
            });
        };
        AngularAdminApp.prototype.registerServices = function () {
        };
        AngularAdminApp.prototype.configureRoutes = function () {
        };
        AngularAdminApp.prototype.registerControllers = function () {
            this.App.controller("TenantController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.TenantController($scope);
                }]);
            this.App.controller("RoleController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.RoleController($scope);
                }]);
            this.App.controller("TenantClientController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.TenantClientController($scope);
                }]);
            this.App.controller("TenantUserController", ["$scope", function ($scope) {
                    return new RapApp.Controllers.TenantUserController($scope);
                }]);
        };
        return AngularAdminApp;
    })();
    RapApp.AngularAdminApp = AngularAdminApp;
    RapApp.RAPAdminApp = new AngularAdminApp();
})(RapApp || (RapApp = {}));
//# sourceMappingURL=angular-app-configuration.js.map