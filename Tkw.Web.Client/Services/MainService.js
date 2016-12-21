define(['application-configuration', 'ajaxService'], function (app) {
    app.register.service('mainService', ['ajaxService', function (ajaxService) {
        this.initializeApplication = function (successFunction, errorFunction) {
            ajaxService.AjaxGet("/api/niv/Home/InitializeApplication", successFunction, errorFunction);
        };
    }]);
});