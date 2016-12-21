var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var BuildingPlanData = (function () {
            function BuildingPlanData() {
            }
            BuildingPlanData.Refresh = function (buildingId) {
                BuildingPlanData.EditBuildingPlan.Id = "";
                BuildingPlanData.EditBuildingPlan.BuildingId = buildingId;
                BuildingPlanData.EditBuildingPlan.Description = "";
                BuildingPlanData.EditBuildingPlan.Name = "";
                BuildingPlanData.EditBuildingPlan.PlanThumbnailFileId = "";
                BuildingPlanData.EditBuildingPlan.PlanFileId = "";
            };
            BuildingPlanData.EditBuildingPlan = {
                Id: "",
                BuildingId: "",
                Description: "",
                Name: "",
                PlanThumbnailFileId: "",
                PlanFileId: "",
            };
            BuildingPlanData.BuildingPlans = new Array();
            return BuildingPlanData;
        })();
        Controllers.BuildingPlanData = BuildingPlanData;
        var BuildingPlanController = (function (_super) {
            __extends(BuildingPlanController, _super);
            // initializes the controller
            function BuildingPlanController($scope, loadAll, loadById) {
                this.$scope = $scope;
                _super.call(this);
                // initialize scope
                $scope.BuildingPlans = null;
                $scope.createNew = this.createNew;
                $scope.insertBuildingPlan = this.insertBuildingPlan;
                $scope.removePlan = this.removePlan;
                var buildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                BuildingPlanData.Refresh(buildingId);
                $scope.EditBuildingPlan = BuildingPlanData.EditBuildingPlan;
                $scope.BuildingPlans = BuildingPlanData.BuildingPlans;
                $scope.BuildingId = buildingId;
                if (loadAll)
                    this.loadBuildingPlans(buildingId);
            }
            BuildingPlanController.prototype.createNew = function () {
                debugger;
                var scope = this;
                BuildingPlanData.Refresh(scope.BuildingId);
            };
            BuildingPlanController.prototype.removePlan = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].delete(item.Id).then(function (data) {
                    BuildingPlanData.BuildingPlans.splice(BuildingPlanData.BuildingPlans.indexOf(item), 1);
                    scope.$apply();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            BuildingPlanController.prototype.insertBuildingPlan = function () {
                var scope = this;
                scope.EditBuildingPlan = BuildingPlanData.EditBuildingPlan;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].create(scope.EditBuildingPlan).then(function (data) {
                    // add the new item to the list
                    BuildingPlanData.BuildingPlans.push(data);
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#add_contact_info").modal("hide");
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            // loads all images the current user has access to
            BuildingPlanController.prototype.loadBuildingPlans = function (buildingId) {
                var self = this;
                this.$scope.IsLoading = true;
                var query = new TKWApp.Data.Query();
                query.and().eq("BuildingId", buildingId).eq("BuildingId", buildingId);
                TKWApp.Data.DataManager.Collections["BuildingPlans"].search(query).then(function (data) {
                    BuildingPlanData.BuildingPlans.splice(0, BuildingPlanData.BuildingPlans.length);
                    for (var i = 0; i < data.length; i++) {
                        BuildingPlanData.BuildingPlans.push(data[i]);
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
            return BuildingPlanController;
        })(Controllers.BaseController);
        Controllers.BuildingPlanController = BuildingPlanController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
