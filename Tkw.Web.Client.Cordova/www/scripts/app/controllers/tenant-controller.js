var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var TenantController = (function (_super) {
            __extends(TenantController, _super);
            // initializes the controller
            function TenantController($scope) {
                this.$scope = $scope;
                _super.call(this);
                $scope.EditTenant = {
                    UserName: "",
                    Email: "",
                    CompanyName: ""
                };
                // attach functions
                this.$scope.registerTenant = this.registerTenant;
            }
            TenantController.prototype.registerTenant = function () {
                var scope = this;
            };
            return TenantController;
        })(Controllers.BaseController);
        Controllers.TenantController = TenantController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
