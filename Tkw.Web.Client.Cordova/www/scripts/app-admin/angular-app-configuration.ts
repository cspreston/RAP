module RapApp {
    export class AngularAdminApp {
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
            this.App = angular.module("RAPAdminApp", ["kendo.directives"]);

            this.registerDirectives();
            // register app services - for directives that need services - stupid directives
            this.registerServices();
            // register app controllers
            this.registerControllers();
        }

        registerDirectives() {
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

            //register directives for compare two values
            this.App.directive('equals', function () {
                return {
                    restrict: 'A', // only activate on element attribute
                    require: '?ngModel', // get a hold of NgModelController
                    link: function (scope, elem, attrs, ngModel) {
                        if (!ngModel) return; // do nothing if no ng-model

                        // watch own value and re-validate on change
                        scope.$watch((<any>attrs).ngModel, function () {
                            validate();
                        });

                        // observe the other value and re-validate on change
                        attrs.$observe('equals', function (val) {
                            validate();
                        });

                        var validate = function () {
                            // values
                            var val1 = (<any>ngModel).$viewValue;
                            var val2 = (<any>attrs).equals;
                            // set validity
                            (<any>ngModel).$setValidity('equals', !val1 || !val2 || val1 === val2);
                        };
                    }
                };
            });
        }
        registerServices() { 
           
        }
        configureRoutes() {
        }

        registerControllers() {
            this.App.controller("TenantController", ["$scope", ($scope) =>
                new RapApp.Controllers.TenantController($scope)]);

            this.App.controller("RoleController", ["$scope", ($scope) =>
                new RapApp.Controllers.RoleController($scope)]);

            this.App.controller("TenantClientController", ["$scope", ($scope) =>
                new RapApp.Controllers.TenantClientController($scope)]);

            this.App.controller("TenantUserController", ["$scope", ($scope) =>
                new RapApp.Controllers.TenantUserController($scope)]);
        }
    }

    export var RAPAdminApp = new AngularAdminApp();
}