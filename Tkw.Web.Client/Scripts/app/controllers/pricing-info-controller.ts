module RapApp.Controllers {
    export class PricingInfoData {
        public static EditPricingInfo: RapApp.Models.IPricingInfo = {
            Id: "",
            BuildingId: "",
            Name: "",
            Description: "",
            UnitPrice: 0,
            Quantity: 0,
            Units: "" 
        };
        public static PricingInfos: Array<RapApp.Models.IPricingInfo> = new Array<RapApp.Models.IPricingInfo>();
        public static Refresh(buildingId: string) {
            PricingInfoData.EditPricingInfo.Id = "";
            PricingInfoData.EditPricingInfo.BuildingId = buildingId;
            PricingInfoData.EditPricingInfo.Name = "";
            PricingInfoData.EditPricingInfo.Description = "";
            PricingInfoData.EditPricingInfo.UnitPrice = 0;
            PricingInfoData.EditPricingInfo.Quantity = 0;
            PricingInfoData.EditPricingInfo.Units = "";
        }
    }
    export class PricingInfoController extends BaseController {
        // initializes the controller
        constructor($scope: RapApp.Models.IPricingInfoList, loadAll: boolean, loadById: boolean) {

            this.$scope = $scope;
            super();
            // initialize scope
            $scope.PricingInfos = null;
            (<any>$scope).createNew = this.createNew;
            (<any>$scope).insertPricingInfo = this.insertPricingInfo;
            (<any>$scope).removePricing = this.removePricing;


            var buildingId: string = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            PricingInfoData.Refresh(buildingId);
            $scope.EditPricingInfo = PricingInfoData.EditPricingInfo;
            $scope.PricingInfos = PricingInfoData.PricingInfos;

            $scope.BuildingId = buildingId;
            if (loadAll)
                this.loadPricingInfos(buildingId);
        }

        createNew() {
            var scope: RapApp.Models.IPricingInfoList = <RapApp.Models.IPricingInfoList><any>this;
            PricingInfoData.Refresh(scope.BuildingId);

        }

        insertPricingInfo() {
            var scope: RapApp.Models.IPricingInfoList = <RapApp.Models.IPricingInfoList><any>this;
            scope.EditPricingInfo = PricingInfoData.EditPricingInfo;
            TKWApp.Data.DataManager.Collections["PricingInfos"].create(scope.EditPricingInfo).then(function (data) {
                // add the new item to the list
                PricingInfoData.PricingInfos.push(data);
                scope.$apply();
                
                // close the modal dialog
                (<any>jQuery("#add_pricing_info")).modal("hide");
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });
        }
        removePricing(item) {
            var scope: RapApp.Models.IPricingInfoList = <RapApp.Models.IPricingInfoList><any>this;

            TKWApp.Data.DataManager.Collections["PricingInfos"].delete(item.Id).then(function (data) {
                PricingInfoData.PricingInfos.splice(PricingInfoData.PricingInfos.indexOf(item), 1);
                scope.$apply();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });

        }

        // loads all images the current user has access to
        loadPricingInfos(buildingId: string) {

            var self = this;
            this.$scope.IsLoading = true;
            var query = new TKWApp.Data.Query();
            query.and().eq("BuildingId", buildingId).eq("BuildingId", buildingId);

            TKWApp.Data.DataManager.Collections["PricingInfos"].search(query).then((data) => {
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
        }

    }
} 