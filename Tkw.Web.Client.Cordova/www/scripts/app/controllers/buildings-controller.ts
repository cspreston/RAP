module RapApp.Controllers {
    declare function FileManager(): any;

    export class BuildingsController extends BaseController {
        // initializes the controller
        constructor($scope: RapApp.Models.IBuildingsList) {

            this.$scope = $scope;
            super();
            TKWApp.Configuration.ConfigurationManager.WorkMode = TKWApp.Configuration.WorkMode.ONLINE;
            // initialize scope
            (<any>$scope).Controller = this;
            (<any>$scope).GoOffline = false;
            (<any>$scope).UserName = TKWApp.Data.AuthenticationManager.AuthenticationToken.getUserName();
            (<any>$scope).Tenant = "";
            if (TKWApp.Data.AuthenticationManager.AuthenticationToken.getUserType() === "Root") {
                (<any>$scope).Tenant = " / Company: " + TKWApp.Data.AuthenticationManager.AuthenticationToken.getTenant();
            }
            (<any>$scope).isInRole = true;
            if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                (<any>$scope).isInRole = false;
            }

            (<any>$scope).result1 = '';
            (<any>$scope).options1 = null;
            (<any>$scope).details1 = '';

            $scope.DefaultBuildingImage = "./Content/Images/default-building.png";
            $scope.DefaultPlanImage = "./Content/Images/default-plan.jpg";
            $scope.Buildings = null;
            (<any>$scope).TotalCount = 0;
            // add methods to the scope
            (<any>$scope).getFeaturedImage = this.getFeaturedImage;
            (<any>$scope).getBuildingImage = this.getBuildingImage;
            (<any>$scope).createNewSite = this.createNewSite;
            (<any>$scope).insertNewSite = this.insertNewSite;
            (<any>$scope).loadMore = this.loadMore;
            (<any>$scope).getBuildingUrl = this.getBuildingUrl;
            (<any>$scope).goOfflineClick = this.goOfflineClick;

            (<any>$scope).loadUsers = (value) => {
                var dropdownlist = $("#select-clients").data("kendoDropDownList");
                value = dropdownlist.value();
                (<any>$scope).selectOptions = {
                    placeholder: "Select users access",
                    dataTextField: "UserName",
                    dataValueField: "Id",
                    valuePrimitive: true,
                    autoBind: false,
                    dataSource: {
                        serverFiltering: true,
                        transport: {
                            read: {
                                url: TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/User/GetAllByClient/?clientId=" + value,
                                beforeSend: function (req) {
                                    req.setRequestHeader('Authorization', "Bearer " + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token);
                                },
                                dataType: "json"
                            }
                        }
                    }
                }
            }
            (<any>$scope).onChangeTenant = function (e) {
                var value = '';
                if (e) {
                    var dropdownlist = $("#select-clients").data("kendoDropDownList");
                    value = dropdownlist.value();
                }
                else {
                    value = (<any>$scope).EditBuilding.ActorId;
                }
                (<any>$scope).loadUsers(value);
                $scope.$apply();
            }
            this.loadBuildings();
        }

        goOfflineClick() {
            var self = this;
            (<any>self).IsLoading = true;
            var results = [];
            for (var i = 0; i < window.localStorage.length; i++) {
                var key = window.localStorage.key(i);
                if (key.slice(0, 3) === "OB_") {
                    results.push(window.localStorage.getItem(key));
                }
            }
            window.localStorage.removeItem("HotspotDisplayTypes");
            TKWApp.Data.DataManager.Collections["HotspotDisplayTypes"].search(null).then((data) => {
                $.each(data, function (i, item) {
                    TKWApp.Data.DataManager.Collections["OfflineHotspotDisplayTypes"].create(item).then(function (v) { }, function (success) { });
                });
            }, (error) => {
                alert(JSON.stringify(error));
            });

            window.localStorage.removeItem("HotspotActionTypes");
            setTimeout(TKWApp.Data.DataManager.Collections["HotspotActionTypes"].search(null).then((data) => {
                $.each(data, function (i, item) {
                    TKWApp.Data.DataManager.Collections["OfflineHotspotActionTypes"].create(item).then(function (v) { }, function (success) { });
                });
            }, (error) => {
                alert(JSON.stringify(error));
            }), 500);

            TKWApp.Data.DataManager.Collections["Buildings"].edit({ "": JSON.stringify(results) }, "TakeOffLine").then(function (data) {
                var fileA: any = new FileManager();
                for (var i = 0; i < data.length; i++) {
                    TKWApp.Data.DataManager.Collections["OfflineBuildings"].delete(data[i].Id).then(function (v) {
                        TKWApp.Data.DataManager.Collections["OfflineBuildings"].create(data[i]).then(function (v) {
                            for (var t = 0; t < data[i].BuildingImages.length; t++) {
                                var image = data[i].BuildingImages[t];
                                setTimeout(fileA.download_file(FileUtils.getImageUrl(image.BucketPath, image.BucketName, image.FileName), image.BucketPath + "/" + image.BucketName, image.FileName, function (theFile) { }), 500);
                            }
                            for (var t = 0; t < data[i].BuildingPlans.length; t++) {
                                var plan = data[i].BuildingPlans[t].PlanFile;
                                setTimeout(fileA.download_file(FileUtils.getImageUrl(plan.BucketPath, plan.BucketName, plan.FileName), plan.BucketPath + "/" + plan.BucketName, plan.FileName, function (theFile) { }), 500);
                            }
                        }, function (success) { });
                    }, function (success) {
                        if (success.Code == 180) {
                            TKWApp.Data.DataManager.Collections["OfflineBuildings"].create(data[i]).then(function (v) {
                                for (var t = 0; t < data[i].BuildingImages.length; t++) {
                                    var image = data[i].BuildingImages[t];
                                    setTimeout(fileA.download_file(FileUtils.getImageUrl(image.BucketPath, image.BucketName, image.FileName), image.BucketPath + "/" + image.BucketName, image.FileName, function (theFile) { }), 500);
                                }
                                for (var t = 0; t < data[i].BuildingPlans.length; t++) {
                                    var plan = data[i].BuildingPlans[t].PlanFile;
                                    setTimeout(fileA.download_file(FileUtils.getImageUrl(plan.BucketPath, plan.BucketName, plan.FileName), plan.BucketPath + "/" + plan.BucketName, plan.FileName, function (theFile) { }), 500);
                                }
                            }, function (success) { });
                        }
                    });
                }
                (<any>self).IsLoading = false;
                setTimeout(self.navigateUrl("OfflineDashboard", ""), 2000);
            }, function (success) {
                // on success we reload from server
                // this can be done in this method, but we want to keep as simple as possible
                if (success.status == 200) {
                    (<any>self).IsLoading = false;
                }
                else {
                    (<any>self).IsLoading = false;
                }
            }, function (error) {
                (<any>self).IsLoading = false;
                // show bootstrap modal error
                // for now we show a simple alert
            });
        }
        //add building
        createNewSite() {
            var scope: RapApp.Models.IBuildingsList = <RapApp.Models.IBuildingsList><any>this;
            scope.EditBuilding = <RapApp.Models.IBuilding><any>{
                Name: "",
                Id: "",
                Description: "",
                Address: "",
                ActorId: "",
                EmergencyPhone: "",
                EmergencyEmail: "",
                BuildingType: "",
                ConstructionType: "",
                BuildingsNo: 0,
                UserIds: "",
                ShowPricing: true,
                ShowContact: true,
                ShowFiles: true,
                ShowDisaster: true,
                ShowFolders: true,
                Geopoints: ""
            };
            var self = this;
            // (<any>scope).result1 = '';
            (<any>scope).options1 = null;
            (<any>scope).details1 = '';
            (<any>scope).EditBuilding.Actor = "";
            var dropdownlist = $("#select-clients").data("kendoDropDownList")
            if (dropdownlist) {
                dropdownlist.text("");
            }
            (<any>self).loadUsers();
        }
        // insert a new pricing info
        insertNewSite() {
            var scope: RapApp.Models.IBuildingsList = <RapApp.Models.IBuildingsList><any>this;
            if (!(<any>scope).EditBuilding.Actor) {
                alert("Please select building client");
                return;
            }
            scope.IsSaving = true;
            scope.EditBuilding.ActorId = (<any>scope.EditBuilding.Actor).Id;

            if ((<any>scope).$$childHead.details && (<any>scope).$$childHead.details.geometry && (<any>scope).$$childHead.details.geometry.location) {
                var coord = Array<Number>();
                coord.push((<any>scope).$$childHead.details.geometry.location.lat());
                coord.push((<any>scope).$$childHead.details.geometry.location.lng());
                (<any>scope).EditBuilding.Geopoints = JSON.stringify(coord);
            }



            TKWApp.Data.DataManager.Collections["Buildings"].create(scope.EditBuilding).then(function (data) {
                // add the new item to the list
                (<any>scope).Controller.loadBuildings().then((data) => {
                    (<any>jQuery("#add_new_site")).modal("hide");
                });
                scope.IsSaving = false;
            }, function (error) {
                scope.IsSaving = false;
                alert(JSON.stringify(error));
                scope.$apply();
            });
        }

        loadClients() {
            var self = this;
            TKWApp.Data.DataManager.Collections["Clients"].search(null).then((data) => {
                (<any>self).$scope.Clients = data;
                self.$scope.$apply();
            }, function (error) {
                this.$scope.IsLoading = false;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                alert(JSON.stringify(error));
            });
        }

        // loads all images the current user has access to
        loadBuildings(): TKWApp.Data.IPromiss {
            var self = this;
            this.$scope.IsLoading = true;
            var url = "GetAll?$orderby=UpdateDate desc&$top=9&$skip=0";
            return TKWApp.Data.DataManager.Collections["Buildings"].getFromUrl(url).then((data) => {
                (<any>self).$scope.Buildings = data.Items;
                self.$scope.IsLoading = false;
                (<any>self).$scope.TotalCount = data.Count;
                for (var i = 0; i < self.$scope.Buildings.length; i++) {
                    if (window.localStorage.getItem("OB_" + self.$scope.Buildings[i].Id)) {
                        self.$scope.GoOffline = true;
                        self.$scope.Buildings[i].IsOffline = true;
                    }
                }
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.$scope.$apply();
                // after loading the buildings the pleasure theme clickable carts are lost
                // we need to reload them to have them working
                (<any>window).Pleasure.listenClickableCards();
                self.loadClients();

            }, function (error) {
                // display an error
                self.$scope.IsLoading = false;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.$scope.$apply();
            });
        }

        loadMore(): TKWApp.Data.IPromiss {
            var self = this;
            (<any>self).IsLoading = true;
            var url = "GetAll?$orderby=UpdateDate desc&$top=9&$skip=" + (<any>self).Buildings.length;

            return TKWApp.Data.DataManager.Collections["Buildings"].getFromUrl(url).then((data) => {
                for (var t = 0; t < data.Items.length; t++) {
                    (<any>self).Buildings.push(data.Items[t]);
                }
                (<any>self).IsLoading = false;
                (<any>self).$apply();
                (<any>window).Pleasure.listenClickableCards();

            }, function (error) {
                (<any>self).IsLoading = false;
                (<any>self).$apply();
            }, function (error) {
                (<any>self).IsLoading = false;
                (<any>self).$apply();
            });
        }
      
        // returns the url for the building's featured image
        getFeaturedImage(b: any) {
            // find featured image
            var featured = b.FeaturedImageId;
            // find featured image
            var url = null;
            for (var i = 0; i < b.BuildingImages.length; i++) {
                if (b.BuildingImages[i].Id === featured) {
                    url = RapApp.FileUtils.getImageUrl(b.BuildingImages[i].BucketPath, b.BuildingImages[i].BucketName, b.BuildingImages[i].FileName);
                }
            }
            if (!url && b.BuildingImages.length > 0) {
                // featured image is not in the list
                // normally this should never happen, but just in case
                // we consider the first image as featured
                url = RapApp.FileUtils.getImageUrl(b.BuildingImages[0].BucketPath, b.BuildingImages[0].BucketName, b.BuildingImages[0].FileName);
            }
            return url;
        }    // returns the url for the building's featured image
        getBuildingImage(bi: any) {
            return RapApp.FileUtils.getImageUrl(bi.BucketPath, bi.BucketName, bi.FileName);
        }

        getBuildingUrl(buildingId: string) {
            var url = TKWApp.HardRouting.ApplicationRoutes.Routes["Site"];
            url += "?id=" + buildingId;
            return url;
        }
    }
}