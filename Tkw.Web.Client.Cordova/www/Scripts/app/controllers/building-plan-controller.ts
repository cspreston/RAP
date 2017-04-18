module RapApp.Controllers {
    export class BuildingPlanData {
        public static EditBuildingPlan: RapApp.Models.IBuildingPlan = {
            Id: "",
            BuildingId: "",
            Description: "",
            Name: "",
            PlanThumbnailFileId: "",
            PlanFileId: "",
        };
        public static BuildingPlans: Array<RapApp.Models.IBuildingPlan> = new Array<RapApp.Models.IBuildingPlan>();
        public static Refresh(buildingId: string) {
            BuildingPlanData.EditBuildingPlan.Id = "";
            BuildingPlanData.EditBuildingPlan.BuildingId = buildingId;
            BuildingPlanData.EditBuildingPlan.Description = "";
            BuildingPlanData.EditBuildingPlan.Name = "";
            BuildingPlanData.EditBuildingPlan.PlanThumbnailFileId = "";
            BuildingPlanData.EditBuildingPlan.PlanFileId = "";
        }

    }
    export class BuildingPlanController extends BaseController {
        // initializes the controller
        constructor($scope: RapApp.Models.IBuildingPlanList, loadAll: boolean, loadById: boolean) {

            this.$scope = $scope;
            super();
            // initialize scope
            $scope.BuildingPlans = null;
            (<any>$scope).createNew = this.createNew;
            (<any>$scope).insertBuildingPlan = this.insertBuildingPlan;
            (<any>$scope).removePlan = this.removePlan;

            var buildingId: string = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            BuildingPlanData.Refresh(buildingId);
            $scope.EditBuildingPlan = BuildingPlanData.EditBuildingPlan;
            $scope.BuildingPlans = BuildingPlanData.BuildingPlans;


            $scope.BuildingId = buildingId;
            if (loadAll)
                this.loadBuildingPlans(buildingId);
        }

        createNew() {
            debugger;
            var scope: RapApp.Models.IBuildingPlanList = <RapApp.Models.IBuildingPlanList><any>this;
            BuildingPlanData.Refresh(scope.BuildingId);
        }

        removePlan(item) {
            var scope: RapApp.Models.IBuildingPlanList = <RapApp.Models.IBuildingPlanList><any>this;

            TKWApp.Data.DataManager.Collections["BuildingPlans"].delete(item.Id).then(function (data) {
                BuildingPlanData.BuildingPlans.splice(BuildingPlanData.BuildingPlans.indexOf(item), 1);
                scope.$apply();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });

        }

        insertBuildingPlan() {
            var scope: RapApp.Models.IBuildingPlanList = <RapApp.Models.IBuildingPlanList><any>this;
            scope.EditBuildingPlan = BuildingPlanData.EditBuildingPlan;
            TKWApp.Data.DataManager.Collections["BuildingPlans"].create(scope.EditBuildingPlan).then(function (data) {
                // add the new item to the list
                BuildingPlanData.BuildingPlans.push(data);
                scope.$apply();
                
                // close the modal dialog
                (<any>jQuery("#add_contact_info")).modal("hide");
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });
        }

        // loads all images the current user has access to
        loadBuildingPlans(buildingId: string) {

            var self = this;
            this.$scope.IsLoading = true;
            var query = new TKWApp.Data.Query();
            query.and().eq("BuildingId", buildingId).eq("BuildingId", buildingId);

            TKWApp.Data.DataManager.Collections["BuildingPlans"].search(query).then((data) => {
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
        }

    }
}
