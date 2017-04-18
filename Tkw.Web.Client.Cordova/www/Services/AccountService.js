define(['application-configuration', 'ajaxService'], function (app) {
    app.register.service('accountService', ['ajaxService', function (ajaxService) {

        this.login = function (user, successFunction, errorFunction) {
            ajaxService.AjaxPostWithNoAuthenication(user, "/Token", successFunction, errorFunction);
        };

        this.logout = function (successFunction, errorFunction) {
            ajaxService.AjaxPost(null, "/api/niv/Account/Logout", successFunction, errorFunction);
        };

        this.changePassword = function (changePassword, successFunction, errorFunction) {
            ajaxService.AjaxPost(changePassword, "/api/niv/Account/ChangePassword", successFunction, errorFunction);
        };

        this.register = function (email, successFunction, errorFunction) {
            ajaxService.AjaxPost(email, "/api/niv/Account/RequestRegisterTenant", successFunction, errorFunction);
        };

        this.registerTenant = function (user, successFunction, errorFunction) {
            ajaxService.AjaxPost(user, "/api/niv/Account/RegisterTenant", successFunction, errorFunction);
        };

        this.requestResetPassword = function (forgotPassword, successFunction, errorFunction) {
            ajaxService.AjaxPostWithNoAuthenication(forgotPassword, "/api/niv/Account/RequestResetPassword", successFunction, errorFunction);
        };

        this.resetPassword = function (resetPassword, successFunction, errorFunction) {
            ajaxService.AjaxPostWithNoAuthenication(resetPassword, "/api/niv/Account/ResetPassword", successFunction, errorFunction);
        };
        
        this.getAllActorsTracking = function (successFunction, errorFunction) {
            ajaxService.AjaxGet("/api/niv/ActorTraking/GetAllActorTraking", successFunction, errorFunction);
        };
    }]);
});