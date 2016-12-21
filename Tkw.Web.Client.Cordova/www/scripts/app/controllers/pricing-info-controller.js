var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var PricingInfoData = (function () {
            function PricingInfoData() {
            }
            PricingInfoData.Refresh = function (buildingId) {
                PricingInfoData.EditPricingInfo.Id = "";
                PricingInfoData.EditPricingInfo.BuildingId = buildingId;
                PricingInfoData.EditPricingInfo.Name = "";
                PricingInfoData.EditPricingInfo.Description = "";
                PricingInfoData.EditPricingInfo.UnitPrice = 0;
                PricingInfoData.EditPricingInfo.Quantity = 0;
                PricingInfoData.EditPricingInfo.Units = "";
            };
            PricingInfoData.EditPricingInfo = {
                Id: "",
                BuildingId: "",
                Name: "",
                Description: "",
                UnitPrice: 0,
                Quantity: 0,
                Units: ""
            };
            PricingInfoData.PricingInfos = new Array();
            return PricingInfoData;
        })();
        Controllers.PricingInfoData = PricingInfoData;
        var PricingInfoController = (function (_super) {
            __extends(PricingInfoController, _super);
            // initializes the controller
            function PricingInfoController($scope, loadAll, loadById) {
                this.$scope = $scope;
                _super.call(this);
                // initialize scope
                $scope.PricingInfos = null;
                $scope.createNew = this.createNew;
                $scope.insertPricingInfo = this.insertPricingInfo;
                $scope.removePricing = this.removePricing;
                var buildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                PricingInfoData.Refresh(buildingId);
                $scope.EditPricingInfo = PricingInfoData.EditPricingInfo;
                $scope.PricingInfos = PricingInfoData.PricingInfos;
                $scope.BuildingId = buildingId;
                if (loadAll)
                    this.loadPricingInfos(buildingId);
            }
            PricingInfoController.prototype.createNew = function () {
                var scope = this;
                PricingInfoData.Refresh(scope.BuildingId);
            };
            PricingInfoController.prototype.insertPricingInfo = function () {
                var scope = this;
                scope.EditPricingInfo = PricingInfoData.EditPricingInfo;
                TKWApp.Data.DataManager.Collections["PricingInfos"].create(scope.EditPricingInfo).then(function (data) {
                    // add the new item to the list
                    PricingInfoData.PricingInfos.push(data);
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#add_pricing_info").modal("hide");
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            PricingInfoController.prototype.removePricing = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["PricingInfos"].delete(item.Id).then(function (data) {
                    PricingInfoData.PricingInfos.splice(PricingInfoData.PricingInfos.indexOf(item), 1);
                    scope.$apply();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            // loads all images the current user has access to
            PricingInfoController.prototype.loadPricingInfos = function (buildingId) {
                var self = this;
                this.$scope.IsLoading = true;
                var query = new TKWApp.Data.Query();
                query.and().eq("BuildingId", buildingId).eq("BuildingId", buildingId);
                TKWApp.Data.DataManager.Collections["PricingInfos"].search(query).then(function (data) {
                    PricingInfoData.PricingInfos.splice(0, PricingInfoData.PricingInfos.length);
                    for (var i = 0; i < data.length; i++) {
                        PricingInfoData.PricingInfos.push(data[i]);
                    }
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                }, function (error) {
                    // display an error
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                });
            };
            return PricingInfoController;
        })(Controllers.BaseController);
        Controllers.PricingInfoController = PricingInfoController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=pricing-info-controller.js.map