var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var BuildingsController = (function (_super) {
            __extends(BuildingsController, _super);
            // initializes the controller
            function BuildingsController($scope) {
                _super.call(this);
                this.$scope = $scope;
                // initialize scope
                $scope.Controller = this;
                $scope.UserName = TKWApp.Data.AuthenticationManager.AuthenticationToken.getUserName();
                $scope.Tenant = "";
                if (TKWApp.Data.AuthenticationManager.AuthenticationToken.getUserType() === "Root") {
                    $scope.Tenant = " / Company: " + TKWApp.Data.AuthenticationManager.AuthenticationToken.getTenant();
                }
                $scope.isInRole = true;
                if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                    $scope.isInRole = false;
                }
                $scope.isCompanyAdmin = false;
                if (TKWApp.Data.AuthenticationManager.isInRole("Root") ||
                    TKWApp.Data.AuthenticationManager.isInRole("Company Admin")) {
                    $scope.isCompanyAdmin = true;
                }
                $scope.result1 = '';
                $scope.options1 = null;
                $scope.details1 = '';
                $scope.DefaultBuildingImage = "./Content/Images/default-building.png";
                $scope.DefaultPlanImage = "./Content/Images/default-plan.jpg";
                $scope.Buildings = null;
                $scope.TotalCount = 0;
                // add methods to the scope
                $scope.getFeaturedImage = this.getFeaturedImage;
                $scope.getBuildingImage = this.getBuildingImage;
                $scope.createNewSite = this.createNewSite;
                $scope.insertNewSite = this.insertNewSite;
                $scope.loadMore = this.loadMore;
                $scope.getBuildingUrl = this.getBuildingUrl;
                $scope.loadUsers = function (value) {
                    var dropdownlist = $("#select-clients").data("kendoDropDownList");
                    value = dropdownlist.value();
                    $scope.selectOptions = {
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
                    };
                };
                $scope.onChangeTenant = function (e) {
                    var value = '';
                    if (e) {
                        var dropdownlist = $("#select-clients").data("kendoDropDownList");
                        value = dropdownlist.value();
                    }
                    else {
                        value = $scope.EditBuilding.ActorId;
                    }
                    $scope.loadUsers(value);
                    $scope.$apply();
                };
                this.loadBuildings();
                $scope.SelectedBlds = [];
                $scope.selectBuilding = this.selectBuilding;
                $scope.clearSelections = this.clearSelections;
                $scope.createFileInfo = this.createFileInfo;
                $scope.insertPricingInfo = this.insertPricingInfo;
            }
            BuildingsController.prototype.selectBuilding = function (bld) {
                var scope = this;
                if ($("#" + bld).is(":checked")) {
                    scope.SelectedBlds.push(bld);
                }
                else {
                    scope.SelectedBlds.splice(scope.SelectedBlds.indexOf(bld), 1);
                }
            };
            BuildingsController.prototype.clearSelections = function () {
                debugger;
                var scope = this;
                scope.SelectedBlds = [];
                $('input:checkbox').removeAttr('checked');
            };
            BuildingsController.prototype.createFileInfo = function (type) {
                var scope = this;
                scope.AddPriceInfoInfoModel = new RapApp.Models.BuildFileUploadModel(document.getElementById("fuPricingInfo"), document.getElementById("fuPricingInfoPreview"));
                scope.AddPriceInfoInfoModel.Uploader.clearImagePreview(document.getElementById("fuPricingInfo"), document.getElementById("fuPricingInfoPreview"));
                scope.UploadFileInfoType = type;
            };
            BuildingsController.prototype.insertPricingInfo = function (type) {
                var scope = this;
                scope.IsSaving = true;
                scope.IsLoading = true;
                if (scope.AddPriceInfoInfoModel.Uploader.files.length > 0) {
                    var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Building/PostFile";
                    var progress = scope.AddPriceInfoInfoModel.Uploader.uploadFile(scope.AddPriceInfoInfoModel.Uploader.files[0], uploadUrl, {
                        Name: scope.AddPriceInfoInfoModel.Uploader.files[0].name,
                        BuildingIds: scope.SelectedBlds,
                        Type: type
                    });
                    progress.finished(function (response) {
                        // close the modal
                        scope.IsSaving = false;
                        scope.IsLoading = false;
                        jQuery("#add_pricing_info").modal("hide");
                        scope.$apply();
                    });
                    progress.error(function (err) {
                        scope.IsSaving = false;
                        scope.IsLoading = false;
                        alert("Error on import!");
                    });
                }
                else {
                    scope.IsSaving = false;
                    scope.IsLoading = false;
                    alert("You must select a file.");
                }
            };
            //add building
            BuildingsController.prototype.createNewSite = function () {
                var scope = this;
                scope.EditBuilding = {
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
                scope.options1 = null;
                scope.details1 = '';
                scope.EditBuilding.Actor = "";
                var dropdownlist = $("#select-clients").data("kendoDropDownList");
                if (dropdownlist) {
                    dropdownlist.text("");
                }
                self.loadUsers();
            };
            // insert a new pricing info
            BuildingsController.prototype.insertNewSite = function () {
                var scope = this;
                if (!scope.EditBuilding.Actor) {
                    alert("Please select building client");
                    return;
                }
                scope.IsSaving = true;
                scope.EditBuilding.ActorId = scope.EditBuilding.Actor.Id;
                if (scope.$$childHead.details && scope.$$childHead.details.geometry && scope.$$childHead.details.geometry.location) {
                    var coord = Array();
                    coord.push(scope.$$childHead.details.geometry.location.lat());
                    coord.push(scope.$$childHead.details.geometry.location.lng());
                    scope.EditBuilding.Geopoints = JSON.stringify(coord);
                }
                TKWApp.Data.DataManager.Collections["Buildings"].create(scope.EditBuilding).then(function (data) {
                    // add the new item to the list
                    scope.Controller.loadBuildings().then(function (data) {
                        jQuery("#add_new_site").modal("hide");
                    });
                    scope.IsSaving = false;
                }, function (error) {
                    scope.IsSaving = false;
                    alert(JSON.stringify(error));
                    scope.$apply();
                });
            };
            BuildingsController.prototype.loadClients = function () {
                var self = this;
                TKWApp.Data.DataManager.Collections["Clients"].search(null).then(function (data) {
                    self.$scope.Clients = data;
                    self.$scope.$apply();
                }, function (error) {
                    this.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    alert(JSON.stringify(error));
                });
            };
            // loads all images the current user has access to
            BuildingsController.prototype.loadBuildings = function () {
                var self = this;
                this.$scope.IsLoading = true;
                var url = "GetAll?$orderby=UpdateDate desc&$top=9&$skip=0";
                return TKWApp.Data.DataManager.Collections["Buildings"].getFromUrl(url).then(function (data) {
                    self.$scope.Buildings = data.Items;
                    self.$scope.IsLoading = false;
                    self.$scope.TotalCount = data.Count;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                    // after loading the buildings the pleasure theme clickable carts are lost
                    // we need to reload them to have them working
                    window.Pleasure.listenClickableCards();
                    self.loadClients();
                }, function (error) {
                    // display an error
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                });
            };
            BuildingsController.prototype.loadMore = function () {
                var self = this;
                self.IsLoading = true;
                var url = "GetAll?$orderby=UpdateDate desc&$top=9&$skip=" + self.Buildings.length;
                return TKWApp.Data.DataManager.Collections["Buildings"].getFromUrl(url).then(function (data) {
                    for (var t = 0; t < data.Items.length; t++) {
                        self.Buildings.push(data.Items[t]);
                    }
                    self.IsLoading = false;
                    self.$apply();
                    window.Pleasure.listenClickableCards();
                }, function (error) {
                    self.IsLoading = false;
                    self.$apply();
                }, function (error) {
                    self.IsLoading = false;
                    self.$apply();
                });
            };
            // returns the url for the building's featured image
            BuildingsController.prototype.getFeaturedImage = function (b) {
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
            }; // returns the url for the building's featured image
            BuildingsController.prototype.getBuildingImage = function (bi) {
                return RapApp.FileUtils.getImageUrl(bi.BucketPath, bi.BucketName, bi.FileName);
            };
            BuildingsController.prototype.getBuildingUrl = function (buildingId) {
                var url = TKWApp.HardRouting.ApplicationRoutes.Routes["Site"];
                url += "?id=" + buildingId;
                return url;
            };
            return BuildingsController;
        }(Controllers.BaseController));
        Controllers.BuildingsController = BuildingsController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
