define(['application-configuration'], function (app) {

    app.register.service('ajaxService', ['$http', 'blockUI', function ($http, blockUI) {

        this.AjaxPost = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            setTimeout(function () {
                $http.post(route, data).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response, status) {
                    blockUI.stop();
                    if (status == 401) {
                        window.location = "#/Accounts/Logout";
                    };
                    errorFunction(response, status);
                });
            }, 50);
        }

        this.AjaxPostWithNoAuthenication = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            setTimeout(function () {
                $http.post(route, data).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response) {
                    blockUI.stop();                 
                    errorFunction(response);
                });
            }, 50);
        }

        this.AjaxGet = function (route, successFunction, errorFunction) {            
            blockUI.start();
            setTimeout(function () {
                $http({ method: 'GET', url: route }).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response, status) {
                    blockUI.stop();
                    if (status == 401) {
                        window.location = "#/Accounts/Logout";
                    };
                   errorFunction(response, status);
                });
            }, 50);
        }

        this.AjaxGetWithData = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            setTimeout(function () {
                $http({ method: 'GET', url: route, params: data }).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response, status) {
                    blockUI.stop();
                    if (status == 401) {
                        window.location = "#/Accounts/Logout";
                    };
                    errorFunction(response);
                });
            }, 50);
        }

        this.AjaxGetWithNoBlock = function (route, successFunction, errorFunction) {
            setTimeout(function () {
                $http({ method: 'GET', url: route }).success(function (response, status, headers, config) {
                    successFunction(response, status);
                }).error(function (response, status) {
                    if (status == 401) {
                        window.location = "#/Accounts/Logout";
                    };
                });
            }, 0);
        }

        this.AjaxGetWithDataNoBlock = function (data, route, successFunction, errorFunction) {
            setTimeout(function () {
                $http({ method: 'GET', url: route, params: data }).success(function (response, status, headers, config) {
                    successFunction(response, status);
                }).error(function (response, status) {
                    if (status == 401) {
                        window.location = "#/Accounts/Logout";
                    };
                });
            }, 0);
        }
    }]);
});


