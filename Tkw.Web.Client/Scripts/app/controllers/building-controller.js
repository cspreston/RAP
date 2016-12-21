/// <reference path="../../typings/kendo/kendo-ui.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var BuildingController = (function (_super) {
            __extends(BuildingController, _super);
            // initializes the controller
            function BuildingController($scope) {
                var _this = this;
                _super.call(this);
                this.$scope = $scope;
                var headerTab = $(".header-tabs.scrollable-tabs.sticky");
                var userIcon = $(".nav-user");
                var userIconA = $(".modal-dialog");
                $(".fa-trash, div[class*='delete'][style*='display: block'],div[class*='delete'][data-target], .fa-times").on("click", function () {
                    headerTab.css('zIndex', '0');
                    userIcon.css('zIndex', '0');
                    userIconA.css('zIndex', '0');
                });
                $("button, .modal").on("click", function () {
                    headerTab.css('zIndex', '1');
                    userIcon.css('zIndex', '1');
                    userIconA.css('zIndex', '1');
                });
                this.isLoadingFromFile = false;
                // initialize scope
                $scope.Controller = this;
                $scope.FolderName = "";
                $scope.OriginalSize = false;
                $scope.CustomSize = true;
                this.Uploader = new TKWApp.Services.FileUploader();
                $scope.isInRole = true;
                $scope.options1 = null;
                $scope.details1 = '';
                $scope.FileType = null;
                if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Client Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Site Admin")) {
                    $scope.isInRole = false;
                }
                $scope.isCompanyAdmin = false;
                if (TKWApp.Data.AuthenticationManager.isInRole("Root") ||
                    TKWApp.Data.AuthenticationManager.isInRole("Company Admin")) {
                    $scope.isCompanyAdmin = true;
                }
                $scope.isSiteAdmin = false;
                if (TKWApp.Data.AuthenticationManager.isInRole("Root") ||
                    TKWApp.Data.AuthenticationManager.isInRole("Site Admin")) {
                    $scope.isSiteAdmin = true;
                }
                $scope.isClientAdmin = false;
                if (TKWApp.Data.AuthenticationManager.isInRole("Root") ||
                    TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                    $scope.isClientAdmin = true;
                }
                $scope.DefaultBuildingImage = "./Content/Images/default-building.png";
                $scope.DefaultPlanImage = "./Content/Images/default-plan.jpg";
                // add methods to the scope
                $scope.getBuildingImage = this.getBuildingImage;
                $scope.getPlanThumbnail = this.getPlanThumbnail;
                $scope.getFileLink = this.getFileLink;
                $scope.removeBuildingImage = this.removeBuildingImage;
                $scope.setMainBuildingImage = this.setMainBuildingImage;
                $scope.edit = this.edit;
                $scope.update = this.update;
                $scope.createNewContactInfo = this.createNewContactInfo;
                $scope.removeContactInfo = this.removeContactInfo;
                $scope.insertContactInfo = this.insertContactInfo;
                $scope.saveContactInfo = this.saveContactInfo;
                $scope.updateContactInfo = function (item) {
                    $scope.EditContactInfo = item;
                    jQuery("#edit_contact_info").modal("show");
                };
                $scope.createNewPricingInfo = this.createNewPricingInfo;
                $scope.savePricingInfo = this.savePricingInfo;
                $scope.removePricingInfo = this.removePricingInfo;
                $scope.insertPricingInfo = this.insertPricingInfo;
                $scope.updatePricingInfo = function (item) {
                    $scope.EditPricingInfo = item;
                    jQuery("#edit-pricing").modal("show");
                };
                $scope.createNewBuildingImage = this.createNewBuildingImage;
                $scope.saveNewBuildingImage = this.saveNewBuildingImage;
                $scope.createNewPlan = this.createNewPlan;
                $scope.saveNewPlan = this.saveNewPlan;
                $scope.createNewFile = this.createNewFile;
                $scope.saveNewFile = this.saveNewFile;
                $scope.removeFile = this.removeFile;
                $scope.createNewDisasterInfo = this.createNewDisasterInfo;
                $scope.saveNewDisasterInfo = this.saveNewDisasterInfo;
                $scope.removeDisasterInfo = this.removeDisasterInfo;
                $scope.getFeaturedImage = this.getFeaturedImage;
                $scope.deleteCurrentSite = this.deleteCurrentSite;
                $scope.getPlanUrl = this.getPlanUrl;
                $scope.onChangeClient = this.onChangeClient;
                $scope.removePlan = this.removePlan;
                $scope.checkFileBox = this.checkFileBox;
                $scope.isFileCheckBoxSelected = this.isFileCheckBoxSelected;
                $scope.loadUsers = function () {
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
                                    url: TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/User/GetAllByClient?clientId=" + $scope.EditBuilding.ActorId,
                                    beforeSend: function (req) {
                                        req.setRequestHeader('Authorization', "Bearer " + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token);
                                    },
                                    dataType: "json"
                                }
                            }
                        }
                    };
                };
                $scope.importPlansFromPDF = function () {
                    TKWApp.HardRouting.ApplicationRoutes.redirect("ImportPlan", _this.$scope.BuildingId);
                };
                // get the current building id and load it
                this.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                $scope.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                $scope.copy = this.copy;
                $scope.checkImageInClone = this.checkImageInClone;
                $scope.checkPlanInClone = this.checkPlanInClone;
                $scope.checkPriceInClone = this.checkPriceInClone;
                $scope.checkContactInClone = this.checkContactInClone;
                $scope.checkFilesInClone = this.checkFilesInClone;
                $scope.checkDisasterInfoInClone = this.checkDisasterInfoInClone;
                $scope.treeData = new kendo.data.HierarchicalDataSource();
                $scope.bindFolderViewFiles = this.bindFolderViewFiles;
                $scope.clickFile = function (item) {
                    $scope.SelectedFile = item;
                    $("div[id^='file_act_']").hide();
                    $("div[id^='fold_act_']").hide();
                    if (item.type == 0 && !item.IsBucket) {
                        $("#fold_act_" + item.id).show();
                    }
                    if (item.type == 2) {
                        $("#file_act_" + item.id).show();
                    }
                };
                $scope.foldActAdd = this.foldActAdd;
                $scope.createFolder = this.createFolder;
                $scope.getFileFolderLink = this.getFileFolderLink;
                $scope.foldActAddFile = this.foldActAddFile;
                $scope.createFile = this.createFile;
                $scope.removeFileFolder = this.removeFileFolder;
                $scope.removeFolder = this.removeFolder;
                $scope.renderMap = false;
                $scope.showMap = this.showMap;
                $scope.updateBuildingDisasterInfo = function (item) {
                    $scope.EditMetaDataFile = item;
                    jQuery("#edit_building_disaster_info").modal("show");
                };
                $scope.editDisasterInfo = this.editDisasterInfo;
                $scope.updateBuildingFile = function (item) {
                    $scope.EditMetaDataFile = item;
                    jQuery("#edit_building_file").modal("show");
                };
                $scope.editBuildingFile = this.editBuildingFile;
                $scope.sortableViews = {
                    stop: function (e, ui) {
                        var items = $scope.CurrentBuilding.BuildingPlans;
                        TKWApp.Data.DataManager.getFunction("PerformSortBuildingPlan").execute({ "": items }).then(function (data) {
                        }, function (error) {
                        });
                    }
                };
                $scope.sortableImages = {
                    stop: function (e, ui) {
                        var items = $scope.CurrentBuilding.BuildingImages;
                        TKWApp.Data.DataManager.getFunction("PerformSortBuildingImage").execute({ "": items }).then(function (data) {
                        }, function (error) {
                        });
                    }
                };
                $scope.updateImageNameOnEnter = this.updateImageNameOnEnter;
                $scope.updateImageName = this.updateImageName;
                $scope.updatePlanNameOnEnter = this.updatePlanNameOnEnter;
                $scope.updatePlanName = this.updatePlanName;
                $scope.updatePlanDetail = function (item) {
                    $scope.updatePlanInfo = jQuery.extend(true, {}, item);
                    jQuery("#edit-plan-info").modal("show");
                };
                $scope.editPlanDetail = function () {
                    var self = _this;
                    self.IsSaving = true;
                    TKWApp.Data.DataManager.Collections["BuildingPlans"].edit(self.$scope.updatePlanInfo, "EditDetails").then(function (data) {
                    }, function (success) {
                        if (success.status == 200) {
                            for (var i = 0; i < self.$scope.CurrentBuilding.BuildingPlans.length; i++) {
                                if (self.$scope.CurrentBuilding.BuildingPlans[i].Id == self.$scope.updatePlanInfo.Id) {
                                    self.$scope.CurrentBuilding.BuildingPlans[i].Name = self.$scope.updatePlanInfo.Name;
                                    self.$scope.CurrentBuilding.BuildingPlans[i].Description = self.$scope.updatePlanInfo.Description;
                                    break;
                                }
                            }
                            self.IsSaving = false;
                            jQuery("#edit-plan-info").modal("hide");
                            self.$scope.$apply();
                        }
                        else {
                            self.IsSaving = false;
                            jQuery("#edit-plan-info").modal("hide");
                            jQuery("#saveSiteFailure").click();
                        }
                    }, function (error) {
                        self.IsSaving = false;
                        alert(JSON.stringify(error));
                        jQuery("#saveSiteFailure").click();
                    });
                };
                $scope.hasPricingFiles = false;
                $scope.hasContactFiles = false;
                this.loadBuilding(this.BuildingId);
                $scope.selectPlanSize = this.selectPlanSize;
                $scope.openSendEmergencyEmail = function () {
                    jQuery("#emergency-email").val('');
                    jQuery("#send-emergency-email").modal("show");
                };
                $scope.sendEmergencyEmail = this.sendEmergencyEmail;
                $scope.zipSite = this.zipSite;
            }
            ;
            //downlaod all files for selected building
            BuildingController.prototype.zipSite = function () {
                var scope = this;
                scope.IsSaving = true;
                var url = "DownloadBuildingFiles?Id=" + scope.CurrentBuilding.Id;
                return TKWApp.Data.DataManager.Collections["Buildings"].getFromUrl(url).then(function (data) {
                    scope.IsSaving = false;
                    if (data) {
                        window.open(data, '_blank', '');
                    }
                    else {
                        alert(JSON.stringify(data.responseText));
                    }
                    jQuery("#send-emergency-email").modal("hide");
                }, function (error) {
                    scope.IsSaving = false;
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                }, function (error) {
                    // display an error
                    scope.IsSaving = false;
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            BuildingController.prototype.selectPlanSize = function (value) {
                var scope = this;
                scope.OriginalSize = value;
                scope.CustomSize = !scope.OriginalSize;
                if (value) {
                    scope.AddPlanModel.Height = 0;
                    scope.AddPlanModel.Width = 0;
                }
                else {
                    scope.AddPlanModel.Height = 600;
                    scope.AddPlanModel.Width = 900;
                }
            };
            BuildingController.prototype.updateImageNameOnEnter = function (e, item) {
                if (e.keyCode == 13) {
                    var scope = this;
                    var items = scope.CurrentBuilding.BuildingImages;
                    for (var i = 0; i < items.length; i++) {
                        if (item.id == items[i].id && item.FileDescription != item.FileDescription) {
                            TKWApp.Data.DataManager.Collections["BuildingImages"].update(item).then(function (data) {
                            }, function (error) {
                            });
                            break;
                        }
                    }
                }
            };
            BuildingController.prototype.updateImageName = function (e, item) {
                var scope = this;
                var items = scope.CurrentBuilding.BuildingImages;
                for (var i = 0; i < items.length; i++) {
                    if (item.id == items[i].id && item.FileDescription != item.FileDescription) {
                        TKWApp.Data.DataManager.Collections["BuildingImages"].update(item).then(function (data) {
                        }, function (error) {
                        });
                        break;
                    }
                }
            };
            BuildingController.prototype.updatePlanNameOnEnter = function (e, item) {
                if (e.keyCode == 13) {
                    var scope = this;
                    TKWApp.Data.DataManager.Collections["BuildingPlans"].update(item).then(function (data) {
                    }, function (error) {
                    });
                }
            };
            BuildingController.prototype.updatePlanName = function (e, item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].update(item).then(function (data) {
                }, function (error) {
                });
            };
            BuildingController.prototype.loadBuilding = function (id) {
                var _this = this;
                var self = this;
                this.$scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["Buildings"].find(id).then(function (response) {
                    self.$scope.CurrentBuilding = response;
                    for (var i = 0; i < response.BuildingFiles.length; i++) {
                        if (response.BuildingFiles[i].Type == 1) {
                            self.$scope.hasPricingFiles = true;
                        }
                        else if (response.BuildingFiles[i].Type == 2) {
                            self.$scope.hasContactFiles = true;
                        }
                        if (self.$scope.hasPricingFiles && self.$scope.hasContactFiles)
                            break;
                    }
                    var url = window.URL;
                    if (window.location.href.indexOf("copy-site") >= 0) {
                        self.$scope.SiteClone = jQuery.extend(true, {}, self.$scope.CurrentBuilding);
                        self.$scope.SiteClone.Name = self.$scope.CurrentBuilding.Name + " Clone";
                    }
                    _this.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.bindFolderViewFiles(response, "");
                    self.loadClients();
                    var src = self.getFeaturedImage(self.$scope.CurrentBuilding);
                    if (src == null)
                        src = self.$scope.DefaultBuildingImage;
                    jQuery("#FeaturedImage").css('background-image', 'url(\'' + src + '\')');
                    self.$scope.$apply();
                }, function (error) {
                    this.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                });
            };
            BuildingController.prototype.loadClients = function () {
                var self = this;
                TKWApp.Data.DataManager.Collections["Clients"].search(null).then(function (data) {
                    self.$scope.Clients = data;
                    // this forces it to do so
                    self.$scope.$apply();
                }, function (error) {
                    this.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    alert(JSON.stringify(error));
                });
            };
            BuildingController.prototype.edit = function () {
                var scope = this;
                // on edit we copy the current building into a new one... to allow to easily cancel
                if (scope.CurrentBuilding) {
                    scope.EditBuilding = jQuery.extend(true, {}, scope.CurrentBuilding);
                    var self = this;
                    self.renderMap = !self.renderMap;
                    self.loadUsers();
                    if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        scope.$apply();
                    }
                    //edit-site-modal
                    jQuery("#edit-site-modal").modal("show");
                }
            };
            BuildingController.prototype.sendEmergencyEmail = function () {
                var scope = this;
                var url = "SendEmergencyEmail?Id=" + scope.CurrentBuilding.Id + "&message=" + jQuery("#emergency-email").val();
                TKWApp.Data.DataManager.Collections["Buildings"].edit(null, url).then(function (data) {
                }, function (success) {
                    scope.IsSaving = false;
                    if (success.status == 200) {
                        alert("Notification was sent successfully!");
                    }
                    else {
                        alert(JSON.stringify(success.responseText));
                    }
                    jQuery("#send-emergency-email").modal("hide");
                }, function (error) {
                    scope.IsSaving = false;
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            BuildingController.prototype.showMap = function () {
                var self = this;
                self.renderMap = !self.renderMap;
            };
            BuildingController.prototype.onChangeClient = function () {
                var scope = this;
                scope = scope.$angular_scope;
                scope.EditBuilding.UserIds = "";
                scope.loadUsers();
                scope.$apply();
            };
            BuildingController.prototype.update = function () {
                var scope = this;
                scope.IsSaving = true;
                if (scope.EditBuilding.Actor) {
                    scope.EditBuilding.ActorId = scope.EditBuilding.Actor.Id;
                    scope.EditBuilding.ActorName = scope.EditBuilding.Actor.FirstName;
                }
                if (scope.$$childHead.details && scope.$$childHead.details.geometry && scope.$$childHead.details.geometry.location) {
                    var coord = Array();
                    coord.push(scope.$$childHead.details.geometry.location.lat());
                    coord.push(scope.$$childHead.details.geometry.location.lng());
                    scope.EditBuilding.Geopoints = JSON.stringify(coord);
                }
                TKWApp.Data.DataManager.Collections["Buildings"].update(scope.EditBuilding).then(function (data) {
                    // we need to reload the current building
                    scope.CurrentBuilding = data;
                    scope.IsSaving = false;
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#edit-site-modal").modal("hide");
                    jQuery("#saveSiteSuccess").click();
                }, function (error) {
                    scope.IsSaving = false;
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            // returns the url for the building's featured image
            BuildingController.prototype.getFeaturedImage = function (b) {
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
            BuildingController.prototype.getBuildingImage = function (bi) {
                return RapApp.FileUtils.getImageUrl(bi.BucketPath, bi.BucketName, bi.FileName);
            };
            BuildingController.prototype.getFileLink = function (fi) {
                var fileLink = RapApp.FileUtils.getImageUrl(fi.File.BucketPath, fi.File.BucketName, fi.File.FileName);
                return fileLink;
            };
            BuildingController.prototype.getPlanThumbnail = function (plan) {
                var fileLink = RapApp.FileUtils.getImageUrl(plan.PlanThumbnailFile.BucketPath, plan.PlanThumbnailFile.BucketName, plan.PlanThumbnailFile.FileName);
                return fileLink;
            };
            BuildingController.prototype.createNewBuildingImage = function () {
                var scope = this;
                scope.AddBuildingImageModel = new RapApp.Models.BuildimgImageUploadModel(document.getElementById("fuBuildingImage"), document.getElementById("fuBuildingImagePreview"));
                scope.AddBuildingImageModel.Height = 300;
                scope.AddBuildingImageModel.Width = 300;
                scope.AddBuildingImageModel.Description = "Building image";
                scope.AddBuildingImageModel.BuildingId = scope.CurrentBuilding.Id;
                scope.AddBuildingImageModel.KeepAspectRatio = false;
                scope.AddBuildingImageModel.Uploader.clearImagePreview(document.getElementById("fuBuildingImage"), document.getElementById("fuBuildingImagePreview"));
            };
            BuildingController.prototype.saveNewBuildingImage = function () {
                var scope = this;
                scope.IsSaving = true;
                scope.IsLoading = true;
                if (scope.AddBuildingImageModel.Uploader.files.length > 0) {
                    var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingImage/Post";
                    var files = scope.AddBuildingImageModel.Uploader.files;
                    for (var i = 0; i < files.length; i++) {
                        var knt = 0;
                        var progress = scope.AddBuildingImageModel.Uploader.uploadFile(scope.AddBuildingImageModel.Uploader.files[i], uploadUrl, {
                            Name: scope.AddBuildingImageModel.Uploader.files[i].name,
                            Width: scope.AddBuildingImageModel.Width,
                            Height: scope.AddBuildingImageModel.Height,
                            KeepAspectRatio: scope.AddBuildingImageModel.KeepAspectRatio,
                            Description: scope.AddBuildingImageModel.Description,
                            BuildingId: scope.AddBuildingImageModel.BuildingId
                        });
                        progress.progress(function (args) {
                        });
                        progress.finished(function () {
                            knt++;
                            // reload building
                            if (knt == files.length) {
                                scope.IsSaving = false;
                                scope.IsLoading = false;
                                scope.Controller.loadBuilding(scope.CurrentBuilding.Id);
                                // close the modal
                                jQuery("#add_building_image").modal("hide");
                                jQuery("#saveSiteSuccess").click();
                            }
                        });
                        progress.error(function (err) {
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                            jQuery("#saveSiteFailure").click();
                        });
                    }
                }
                else {
                    scope.IsSaving = false;
                    scope.IsLoading = false;
                    alert("You must select an image.");
                }
            };
            BuildingController.prototype.removeBuildingImage = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["BuildingImages"].delete(item.Id).then(function (data) { }, function (success) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    if (success.status == 200) {
                        if (scope.CurrentBuilding) {
                            var images = scope.CurrentBuilding.BuildingImages;
                            var isMainImg = false;
                            if (scope.CurrentBuilding.FeaturedImageId == item.Id) {
                                isMainImg = true;
                                scope.CurrentBuilding.FeaturedImageId = null;
                            }
                            if (images) {
                                for (var i = 0; i < images.length; i++) {
                                    var img = images[i];
                                    if (isMainImg && scope.CurrentBuilding.FeaturedImageId == null && img.Id != item.Id) {
                                        scope.CurrentBuilding.FeaturedImageId = img.Id;
                                    }
                                    if (img.Id === item.Id) {
                                        scope.CurrentBuilding.BuildingImages.splice(i, 1);
                                        if (scope.CurrentBuilding.FeaturedImageId != null && scope.CurrentBuilding.BuildingImages[0] != null) {
                                            var imgH = scope.CurrentBuilding.BuildingImages[0];
                                            var src = RapApp.FileUtils.getImageUrl(imgH.BucketPath, imgH.BucketName, imgH.FileName);
                                            if (src != null) {
                                                jQuery("#FeaturedImage").css('background-image', 'url(\'' + src + '\')');
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            scope.bindFolderViewFiles(scope.CurrentBuilding, "Images");
                            if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                scope.$apply();
                            }
                        }
                    }
                    else {
                        alert(JSON.stringify(success.statusText));
                    }
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            BuildingController.prototype.setMainBuildingImage = function (item) {
                var scope = this;
                scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["BuildingImages"].edit(null, "SetMainImage?id=" + item.Id).then(function (data) { }, function (success) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    if (success.status == 200) {
                        scope.CurrentBuilding.FeaturedImageId = item.Id;
                        var src = RapApp.FileUtils.getImageUrl(item.BucketPath, item.BucketName, item.FileName);
                        if (src != null) {
                            jQuery("#FeaturedImage").css('background-image', 'url(\'' + src + '\')');
                        }
                        if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                            scope.$apply();
                        }
                        scope.IsLoading = false;
                    }
                    else {
                        scope.IsLoading = false;
                        alert(JSON.stringify(success.statusText));
                    }
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    scope.IsLoading = false;
                    alert(JSON.stringify(error));
                });
            };
            // Contact info management methods
            // initiate create new contact
            BuildingController.prototype.createNewContactInfo = function () {
                var scope = this;
                scope.EditContactInfo = {
                    Id: "",
                    BuildingId: scope.BuildingId,
                    Title: "",
                    FirstName: "",
                    LastName: "",
                    Role: "",
                    EmailAddress: "",
                    Phone: "",
                    MobilePhone: "",
                    Address: "",
                    SecondAddress: "",
                    City: "",
                    State: "",
                    ZIP: ""
                };
                scope.AddPriceInfoInfoModel = new RapApp.Models.BuildFileUploadModel(document.getElementById("ciPricingInfo"), document.getElementById("ciPricingInfoPreview"));
                scope.AddPriceInfoInfoModel.Description = "file description";
                scope.AddPriceInfoInfoModel.BuildingId = scope.CurrentBuilding.Id;
                scope.AddPriceInfoInfoModel.FileName = "";
                scope.AddPriceInfoInfoModel.FileDescription = "";
                scope.AddPriceInfoInfoModel.Uploader.clearImagePreview(document.getElementById("ciPricingInfo"), document.getElementById("ciPricingInfoPreview"));
                this.isLoadingFromFile = false;
            };
            // delete existing contact info and refresh the building
            BuildingController.prototype.removeContactInfo = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["ContactInfos"].delete(item.Id).then(function (data) { }, function (success) {
                    scope.CurrentBuilding.ContactInfos.splice(scope.CurrentBuilding.ContactInfos.indexOf(item), 1);
                    scope.$apply();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            // insert a new contact info and refresh the building
            BuildingController.prototype.insertContactInfo = function () {
                if (this.isLoadingFromFile) {
                    var scope = this;
                    scope.IsSaving = true;
                    if (scope.AddPriceInfoInfoModel.Uploader.files.length > 0) {
                        var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/ContactInfo/PostFile";
                        var progress = scope.AddPriceInfoInfoModel.Uploader.uploadFile(scope.AddPriceInfoInfoModel.Uploader.files[0], uploadUrl, {
                            Name: scope.AddPriceInfoInfoModel.Uploader.files[0].name,
                            BuildingId: scope.AddPriceInfoInfoModel.BuildingId,
                        });
                        progress.finished(function (response) {
                            scope.IsSaving = false;
                            var cnts = JSON.parse(response);
                            $.each(cnts, function (i, item) {
                                scope.CurrentBuilding.ContactInfos.push(item);
                            });
                            jQuery("#add_contact_info").modal("hide");
                            jQuery("#saveSiteSuccess").click();
                            scope.IsSaving = false;
                            scope.$apply();
                        });
                        progress.error(function (err) {
                            scope.IsSaving = false;
                            jQuery("#saveSiteFailure").click();
                        });
                    }
                    else {
                        scope.IsSaving = false;
                        alert("You must select a file.");
                    }
                }
                else {
                    var scope = this;
                    scope.IsSaving = true;
                    TKWApp.Data.DataManager.Collections["ContactInfos"].create(scope.EditContactInfo).then(function (data) {
                        // add the new item to the list
                        scope.CurrentBuilding.ContactInfos.push(data);
                        scope.IsSaving = false;
                        scope.$apply();
                        // close the modal dialog
                        jQuery("#add_contact_info").modal("hide");
                        jQuery("#saveSiteSuccess").click();
                    }, function (error) {
                        scope.IsSaving = false;
                        // show bootstrap modal error
                        // for now we show a simple alert
                        alert(JSON.stringify(error));
                        jQuery("#saveSiteFailure").click();
                    });
                }
            };
            BuildingController.prototype.saveContactInfo = function () {
                var scope = this;
                scope.IsSaving = true;
                TKWApp.Data.DataManager.Collections["ContactInfos"].update(scope.EditContactInfo).then(function (data) {
                    // add the new item to the list
                    scope.IsSaving = false;
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#edit_contact_info").modal("hide");
                    jQuery("#saveSiteSuccess").click();
                }, function (error) {
                    scope.IsSaving = false;
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            // Pricing info management methods
            // initialize a new pricing info
            BuildingController.prototype.createNewPricingInfo = function () {
                var scope = this;
                scope.EditPricingInfo = {
                    Id: "",
                    BuildingId: scope.BuildingId,
                    Name: "",
                    Description: "",
                    UnitPrice: 0,
                    Quantity: 0,
                    Units: "",
                };
                scope.AddPriceInfoInfoModel = new RapApp.Models.BuildFileUploadModel(document.getElementById("fuPricingInfo"), document.getElementById("fuPricingInfoPreview"));
                scope.AddPriceInfoInfoModel.Description = "file description";
                scope.AddPriceInfoInfoModel.BuildingId = scope.CurrentBuilding.Id;
                scope.AddPriceInfoInfoModel.FileName = "";
                scope.AddPriceInfoInfoModel.FileDescription = "";
                scope.AddPriceInfoInfoModel.Uploader.clearImagePreview(document.getElementById("fuPricingInfo"), document.getElementById("fuPricingInfoPreview"));
                this.isLoadingFromFile = false;
            };
            BuildingController.prototype.savePricingInfo = function () {
                var scope = this;
                scope.IsSaving = true;
                TKWApp.Data.DataManager.Collections["PricingInfos"].update(scope.EditPricingInfo).then(function (data) {
                    // add the new item to the list
                    scope.IsSaving = false;
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#edit-pricing").modal("hide");
                    jQuery("#saveSiteSuccess").click();
                }, function (error) {
                    scope.IsSaving = false;
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            // insert a new pricing info
            BuildingController.prototype.insertPricingInfo = function () {
                if (!this.isLoadingFromFile) {
                    var scope = this;
                    scope.IsSaving = true;
                    TKWApp.Data.DataManager.Collections["PricingInfos"].create(scope.EditPricingInfo).then(function (data) {
                        // add the new item to the list
                        scope.CurrentBuilding.PricingInfos.push(data);
                        scope.IsSaving = false;
                        scope.$apply();
                        // close the modal dialog
                        jQuery("#add_pricing_info").modal("hide");
                        jQuery("#saveSiteSuccess").click();
                    }, function (error) {
                        scope.IsSaving = false;
                        // show bootstrap modal error
                        // for now we show a simple alert
                        alert(JSON.stringify(error));
                        jQuery("#saveSiteFailure").click();
                    });
                }
                else {
                    var scope = this;
                    scope.IsSaving = true;
                    if (scope.AddPriceInfoInfoModel.Uploader.files.length > 0) {
                        var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/PricingInfo/PostFile";
                        var progress = scope.AddPriceInfoInfoModel.Uploader.uploadFile(scope.AddPriceInfoInfoModel.Uploader.files[0], uploadUrl, {
                            Name: scope.AddPriceInfoInfoModel.Uploader.files[0].name,
                            BuildingId: scope.AddPriceInfoInfoModel.BuildingId,
                        });
                        progress.finished(function (response) {
                            // close the modal
                            scope.IsSaving = false;
                            var cnts = JSON.parse(response);
                            $.each(cnts, function (i, item) {
                                scope.CurrentBuilding.PricingInfos.push(item);
                            });
                            jQuery("#add_pricing_info").modal("hide");
                            jQuery("#saveSiteSuccess").click();
                            scope.$apply();
                        });
                        progress.error(function (err) {
                            scope.IsSaving = false;
                            jQuery("#saveSiteFailure").click();
                        });
                    }
                    else {
                        scope.IsSaving = false;
                        alert("You must select a file.");
                    }
                }
            };
            // delete an existing pricing info
            BuildingController.prototype.removePricingInfo = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["PricingInfos"].delete(item.Id).then(function (data) {
                }, function (success) {
                    scope.CurrentBuilding.PricingInfos.splice(scope.CurrentBuilding.PricingInfos.indexOf(item), 1);
                    scope.$apply();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            BuildingController.prototype.deleteCurrentSite = function () {
                var scope = this;
                TKWApp.Data.DataManager.Collections["Buildings"].delete(scope.CurrentBuilding.Id).then(function (data) {
                    TKWApp.HardRouting.ApplicationRoutes.redirect("Dashboard");
                }, function (succes) {
                    if (succes.status === 200) {
                        window.location.href = "dashboard";
                    }
                    else {
                        alert(JSON.stringify(succes));
                    }
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            BuildingController.prototype.createNewFile = function (type) {
                if (type === void 0) { type = null; }
                var scope = this;
                scope.IsSaving = false;
                scope.FileType = type;
                scope.AddFileModel = new RapApp.Models.BuildFileUploadModel(document.getElementById("fuFile"), document.getElementById("fuFilePreview"));
                scope.AddFileModel.Description = "file description";
                scope.AddFileModel.BuildingId = scope.CurrentBuilding.Id;
                scope.AddFileModel.FileName = "";
                scope.AddFileModel.FileDescription = "";
                scope.AddFileModel.Uploader.clearImagePreview(document.getElementById("fuFile"), document.getElementById("fuFilePreview"));
            };
            BuildingController.prototype.removeFile = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["BuildingFiles"].delete(item.Id).then(function (data) {
                    scope.CurrentBuilding.BuildingFiles.splice(scope.CurrentBuilding.BuildingFiles.indexOf(item), 1);
                    scope.bindFolderViewFiles(scope.CurrentBuilding, "Files");
                    scope.$parent.hasContactFiles = false;
                    scope.$parent.hasPricingFiles = false;
                    for (var i = 0; i < scope.CurrentBuilding.BuildingFiles.length; i++) {
                        if (scope.CurrentBuilding.BuildingFiles[i].Type == 1) {
                            scope.$parent.hasPricingFiles = true;
                        }
                        else if (scope.CurrentBuilding.BuildingFiles[i].Type == 2) {
                            scope.$parent.hasContactFiles = true;
                        }
                        if (scope.$parent.hasPricingFiles && scope.$parent.hasContactFiles)
                            break;
                    }
                    scope.$apply();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            BuildingController.prototype.saveNewFile = function () {
                var scope = this;
                scope.IsSaving = true;
                if (scope.AddFileModel.Uploader && scope.AddFileModel.Uploader.files.length > 0) {
                    var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingFile/Post";
                    var files = scope.AddFileModel.Uploader.files;
                    for (var i = 0; i < files.length; i++) {
                        var progress = scope.AddFileModel.Uploader.uploadFile(scope.AddFileModel.Uploader.files[i], uploadUrl, {
                            Name: scope.AddFileModel.Uploader.files[i].name,
                            Description: scope.AddFileModel.Description,
                            BuildingId: scope.AddFileModel.BuildingId,
                            Title: scope.AddFileModel.FileName,
                            BuildingFileDescription: scope.AddFileModel.FileDescription,
                            Type: scope.FileType
                        });
                        progress.progress(function (args) {
                        });
                        progress.finished(function () {
                            scope.IsSaving = false;
                            // reload building
                            scope.Controller.loadBuilding(scope.CurrentBuilding.Id);
                            // close the modal
                            jQuery("#add_building_file").modal("hide");
                            jQuery("#saveSiteSuccess").click();
                        });
                        progress.error(function (err) {
                            scope.IsSaving = false;
                            jQuery("#saveSiteFailure").click();
                        });
                    }
                }
                else {
                    scope.IsSaving = false;
                    alert("You must select a file.");
                }
            };
            BuildingController.prototype.editBuildingFile = function () {
                var scope = this;
                scope.IsSaving = true;
                TKWApp.Data.DataManager.Collections["BuildingFiles"].update(scope.EditMetaDataFile).then(function (data) {
                    // add the new item to the list
                    scope.IsSaving = false;
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#edit_building_file").modal("hide");
                    jQuery("#saveSiteSuccess").click();
                }, function (error) {
                    scope.IsSaving = false;
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            BuildingController.prototype.createNewPlan = function () {
                var scope = this;
                scope.AddPlanModel = new RapApp.Models.BuildimgPlanUploadModel(document.getElementById("fuPlanImage"), document.getElementById("fuPlanImagePreview"));
                scope.AddPlanModel.Description = "Floor plan";
                scope.AddPlanModel.BuildingId = scope.CurrentBuilding.Id;
                scope.AddPlanModel.PlanName = "";
                scope.AddPlanModel.Height = 600;
                scope.AddPlanModel.Width = 900;
                scope.AddPlanModel.PlanDescription = "";
                scope.AddPlanModel.KeepAspectRatio = false;
                scope.AddPlanModel.Uploader.clearImagePreview(document.getElementById("fuPlanImage"), document.getElementById("fuPlanImagePreview"));
            };
            BuildingController.prototype.saveNewPlan = function () {
                var scope = this;
                scope.IsSaving = true;
                scope.IsLoading = true;
                if (scope.AddPlanModel.Uploader.files.length > 0) {
                    var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/Post";
                    var files = scope.AddPlanModel.Uploader.files;
                    for (var i = 0; i < files.length; i++) {
                        scope.IsSaving = true;
                        var knt = 0;
                        var progress = scope.AddPlanModel.Uploader.uploadFile(scope.AddPlanModel.Uploader.files[i], uploadUrl, {
                            Name: scope.AddPlanModel.Uploader.files[i].name,
                            Description: scope.AddPlanModel.Description,
                            BuildingId: scope.AddPlanModel.BuildingId,
                            PlanName: scope.AddPlanModel.PlanName,
                            PlanDescription: scope.AddPlanModel.PlanDescription,
                            Width: scope.AddPlanModel.Width,
                            Height: scope.AddPlanModel.Height,
                            KeepAspectRatio: scope.AddPlanModel.KeepAspectRatio
                        });
                        progress.progress(function (args) {
                        });
                        progress.finished(function () {
                            knt++;
                            // reload building
                            if (knt == files.length) {
                                scope.Controller.loadBuilding(scope.CurrentBuilding.Id);
                                scope.IsSaving = false;
                                scope.IsLoading = false;
                                // close the modal
                                jQuery("#add_building_plan").modal("hide");
                                jQuery("#saveSiteSuccess").click();
                            }
                        });
                        progress.error(function (err) {
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                            jQuery("#saveSiteFailure").click();
                        });
                    }
                }
                else {
                    scope.IsSaving = false;
                    scope.IsLoading = false;
                    alert("You must select an image.");
                }
            };
            BuildingController.prototype.removePlan = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].delete(item.Id).then(function (data) {
                }, function (succes) {
                    if (succes.status === 200) {
                        scope.CurrentBuilding.BuildingPlans.splice(scope.CurrentBuilding.BuildingPlans.indexOf(item), 1);
                        scope.bindFolderViewFiles(scope.CurrentBuilding, "Views");
                        scope.$apply();
                    }
                    else {
                        alert(JSON.stringify(succes));
                    }
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            BuildingController.prototype.createNewDisasterInfo = function () {
                var scope = this;
                scope.IsSaving = false;
                scope.AddDisasterInfoModel = new RapApp.Models.BuildDisasterInfoUploadModel(document.getElementById("fuDisasterInfo"), document.getElementById("fuDisasterInfoPreview"));
                scope.AddDisasterInfoModel.Description = "Disaster Info description";
                scope.AddDisasterInfoModel.BuildingId = scope.CurrentBuilding.Id;
                scope.AddDisasterInfoModel.DisasterInfoName = "";
                scope.AddDisasterInfoModel.DisasterInfoDescription = "";
                scope.AddDisasterInfoModel.Uploader.clearImagePreview(document.getElementById("fuDisasterInfo"), document.getElementById("fuDisasterInfoPreview"));
            };
            BuildingController.prototype.removeDisasterInfo = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["BuildingDisasterInfos"].delete(item.Id).then(function (data) {
                }, function (success) {
                    scope.CurrentBuilding.BuildingDisasterInfos.splice(scope.CurrentBuilding.BuildingDisasterInfos.indexOf(item), 1);
                    scope.bindFolderViewFiles(scope.CurrentBuilding, "Disaster Infos");
                    scope.$apply();
                    jQuery("#deleteSiteSuccess").click();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            BuildingController.prototype.saveNewDisasterInfo = function () {
                var scope = this;
                scope.IsSaving = true;
                if (scope.AddDisasterInfoModel.Uploader.files.length > 0) {
                    var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingDisasterInfo/Post";
                    var files = scope.AddDisasterInfoModel.Uploader.files;
                    for (var i = 0; i < files.length; i++) {
                        var progress = scope.AddDisasterInfoModel.Uploader.uploadFile(scope.AddDisasterInfoModel.Uploader.files[i], uploadUrl, {
                            Name: scope.AddDisasterInfoModel.Uploader.files[i].name,
                            Description: scope.AddDisasterInfoModel.Description,
                            BuildingId: scope.AddDisasterInfoModel.BuildingId,
                            Title: scope.AddDisasterInfoModel.DisasterInfoName,
                            DisasterInfoDescription: scope.AddDisasterInfoModel.DisasterInfoDescription
                        });
                        progress.progress(function (args) {
                        });
                        progress.finished(function () {
                            scope.IsSaving = false;
                            // reload building
                            scope.Controller.loadBuilding(scope.CurrentBuilding.Id);
                            // close the modal
                            jQuery("#add_building_disaster_info").modal("hide");
                            jQuery("#saveSiteSuccess").click();
                        });
                        progress.error(function (err) {
                            scope.IsSaving = false;
                            jQuery("#saveSiteFailure").click();
                        });
                    }
                }
                else {
                    scope.IsSaving = false;
                    alert("You must select a disaster information file.");
                }
            };
            BuildingController.prototype.editDisasterInfo = function () {
                var scope = this;
                scope.IsSaving = true;
                TKWApp.Data.DataManager.Collections["BuildingDisasterInfos"].update(scope.EditMetaDataFile).then(function (data) {
                    // add the new item to the list
                    scope.IsSaving = false;
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#edit_building_disaster_info").modal("hide");
                    jQuery("#saveSiteSuccess").click();
                }, function (error) {
                    scope.IsSaving = false;
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            BuildingController.prototype.getPlanUrl = function (planId) {
                var url = TKWApp.HardRouting.ApplicationRoutes.Routes["Plan"];
                url += "?id=" + planId;
                return url;
            };
            //START COPY SITE METHODS
            BuildingController.prototype.copy = function () {
                var scope = this;
                scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["Buildings"].edit(scope.SiteClone, "Clone").then(function (data) {
                    window.location.href = "site?id=" + data.Id;
                }, function (error) {
                    scope.IsSaving = false;
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            BuildingController.prototype.checkImageInClone = function (item) {
                var scope = this;
                if (scope.SiteClone) {
                    var orgFiles = scope.CurrentBuilding.BuildingImages;
                    var clonFiles = scope.SiteClone.BuildingImages;
                    //parse all images to check if was already added into clone ( checked)
                    for (var i = 0; i < clonFiles.length; i++) {
                        if (item.Id == clonFiles[i].Id) {
                            scope.SiteClone.BuildingImages.splice(scope.CurrentBuilding.BuildingImages.indexOf(item), 1);
                            return;
                        }
                    }
                    scope.SiteClone.BuildingImages.push(item);
                }
            };
            BuildingController.prototype.checkPlanInClone = function (item) {
                var scope = this;
                if (scope.SiteClone) {
                    var orgFiles = scope.CurrentBuilding.BuildingPlans;
                    var clonFiles = scope.SiteClone.BuildingPlans;
                    //parse all images to check if was already added into clone ( checked)
                    for (var i = 0; i < clonFiles.length; i++) {
                        if (item.Id == clonFiles[i].Id) {
                            scope.SiteClone.BuildingPlans.splice(scope.CurrentBuilding.BuildingPlans.indexOf(item), 1);
                            return;
                        }
                    }
                    scope.SiteClone.BuildingPlans.push(item);
                }
            };
            BuildingController.prototype.checkPriceInClone = function (item) {
                var scope = this;
                if (scope.SiteClone) {
                    var orgFiles = scope.CurrentBuilding.PricingInfos;
                    var clonFiles = scope.SiteClone.PricingInfos;
                    //parse all images to check if was already added into clone ( checked)
                    for (var i = 0; i < clonFiles.length; i++) {
                        if (item.Id == clonFiles[i].Id) {
                            scope.SiteClone.PricingInfos.splice(scope.CurrentBuilding.PricingInfos.indexOf(item), 1);
                            return;
                        }
                    }
                    scope.SiteClone.PricingInfos.push(item);
                }
            };
            BuildingController.prototype.checkContactInClone = function (item) {
                var scope = this;
                if (scope.SiteClone) {
                    var orgFiles = scope.CurrentBuilding.ContactInfos;
                    var clonFiles = scope.SiteClone.ContactInfos;
                    //parse all images to check if was already added into clone ( checked)
                    for (var i = 0; i < clonFiles.length; i++) {
                        if (item.Id == clonFiles[i].Id) {
                            scope.SiteClone.ContactInfos.splice(scope.CurrentBuilding.ContactInfos.indexOf(item), 1);
                            return;
                        }
                    }
                    scope.SiteClone.ContactInfos.push(item);
                }
            };
            BuildingController.prototype.checkFilesInClone = function (item) {
                var scope = this;
                if (scope.SiteClone) {
                    var orgFiles = scope.CurrentBuilding.BuildingFiles;
                    var clonFiles = scope.SiteClone.BuildingFiles;
                    //parse all images to check if was already added into clone ( checked)
                    for (var i = 0; i < clonFiles.length; i++) {
                        if (item.Id == clonFiles[i].Id) {
                            scope.SiteClone.BuildingFiles.splice(scope.CurrentBuilding.BuildingFiles.indexOf(item), 1);
                            return;
                        }
                    }
                    scope.SiteClone.BuildingFiles.push(item);
                }
            };
            BuildingController.prototype.checkDisasterInfoInClone = function (item) {
                var scope = this;
                if (scope.SiteClone) {
                    var orgFiles = scope.CurrentBuilding.BuildingDisasterInfos;
                    var clonFiles = scope.SiteClone.BuildingDisasterInfos;
                    //parse all images to check if was already added into clone ( checked)
                    for (var i = 0; i < clonFiles.length; i++) {
                        if (item.Id == clonFiles[i].Id) {
                            scope.SiteClone.BuildingDisasterInfos.splice(scope.CurrentBuilding.BuildingDisasterInfos.indexOf(item), 1);
                            return;
                        }
                    }
                    scope.SiteClone.BuildingDisasterInfos.push(item);
                }
            };
            BuildingController.prototype.checkFileBox = function () {
                if (this.isLoadingFromFile)
                    this.isLoadingFromFile = false;
                else
                    this.isLoadingFromFile = true;
            };
            BuildingController.prototype.isFileCheckBoxSelected = function () {
                return this.isLoadingFromFile;
            };
            //START FOLDER VIEW
            BuildingController.prototype.bindFolderViewFiles = function (builing, expandedName) {
                var self = this;
                var data = builing;
                var dt = [];
                var it = {
                    BuildingId: data.Id,
                    ContentPath: "",
                    id: "root",
                    type: 0,
                    ParentName: "",
                    Name: "Building Folders",
                    spriteCssClass: "rootfolder",
                    items: [],
                    expanded: true,
                };
                for (var i = 0; i < data.BuildingFolders.length; i++) {
                    if (data.BuildingFolders[i].Name == expandedName) {
                        data.BuildingFolders[i].expanded = true;
                    }
                    it.items.push(data.BuildingFolders[i]);
                }
                dt.push(it);
                if (self.$scope) {
                    self.$scope.treeData = new kendo.data.HierarchicalDataSource({ data: dt });
                }
                else {
                    self.treeData = new kendo.data.HierarchicalDataSource({ data: dt });
                }
            };
            BuildingController.prototype.getFileFolderLink = function (fi) {
                if (fi.type == 2) {
                    var fileLink = fi.ContentPath;
                    return fileLink;
                }
                else
                    return "";
            };
            BuildingController.prototype.foldActAdd = function () {
                var self = this;
                self.$parent.FolderName = "";
                var item = this.SelectedFile;
                if (item.type == 0) {
                    jQuery("#tree_info_add_folder").modal("show");
                }
            };
            BuildingController.prototype.createFolder = function () {
                var self = this;
                var item = this.SelectedFile;
                var url = "/CreateFolder";
                url = url + "?buildingId=" + item.BuildingId;
                url = url + "&rootFolder=" + item.ContentPath;
                url = url + "&folderName=" + self.FolderName;
                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then(function (data) {
                    // success
                    if (self.SelectedFile.id != "root") {
                        var bFolders = self.CurrentBuilding.BuildingFolders;
                        for (var i = 0; i < bFolders.length; i++) {
                            var folder = getFolder(bFolders[i], self.SelectedFile.id);
                            if (folder) {
                                folder.items.push(data);
                                self.bindFolderViewFiles(self.CurrentBuilding, folder.Name);
                                break;
                            }
                        }
                    }
                    else {
                        self.CurrentBuilding.BuildingFolders.push(data);
                        self.bindFolderViewFiles(self.CurrentBuilding);
                    }
                    self.$apply();
                }, function (error) {
                    alert(JSON.stringify(error));
                });
            };
            BuildingController.prototype.foldActAddFile = function () {
                var self = this;
                self.Controller.Uploader = new TKWApp.Services.FileUploader();
                self.Controller.Uploader.registerUploader(document.getElementById("fuFolderFile"));
                self.Controller.Uploader.clearImagePreview(document.getElementById("fuFolderFile"), document.getElementById("fuFolderFile"));
                jQuery("#tree_info_add_file").modal("show");
            };
            BuildingController.prototype.createFile = function () {
                var self = this;
                self.IsSaving = true;
                var item = self.SelectedFile;
                if (self.Controller.Uploader.files && self.Controller.Uploader.files.length == 1) {
                    // upload the pdf
                    var url = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/FileManager/AddFileToFolder";
                    var operationProgress = self.Controller.Uploader.uploadFile(self.Controller.Uploader.files[0], url, {
                        "rootPath": item.ContentPath,
                        "fileName": self.Controller.Uploader.files[0].name,
                    });
                    operationProgress.finished(function (response) {
                        var bFolders = self.CurrentBuilding.BuildingFolders;
                        for (var i = 0; i < bFolders.length; i++) {
                            var folder = getFolder(bFolders[i], self.SelectedFile.id);
                            if (folder) {
                                folder.items.push(JSON.parse(response));
                                self.bindFolderViewFiles(self.CurrentBuilding, folder.Name);
                                break;
                            }
                        }
                        self.$apply();
                    });
                    operationProgress.error(function () {
                    });
                }
                else {
                    alert("You must select a PDF file to be uploaded.");
                }
            };
            BuildingController.prototype.removeFileFolder = function (fi) {
                if (confirm("Confirm action?")) {
                    var self = this;
                    var data = self.$parent.CurrentBuilding;
                    if (fi.ContentPath.indexOf("DisasterInfos") != -1) {
                        var fInfos = data.BuildingDisasterInfos;
                        for (var t = 0; t < fInfos.length; t++) {
                            if (fInfos[t].File.FileName == fi.Name) {
                                var item = fInfos[t];
                                self.$parent.removeDisasterInfo(item);
                                break;
                            }
                        }
                    }
                    else if (fi.ContentPath.indexOf("Images") != -1) {
                        var fInfos = data.BuildingImages;
                        for (var t = 0; t < fInfos.length; t++) {
                            if (fInfos[t].FileName == fi.Name) {
                                var item = fInfos[t];
                                self.$parent.removeBuildingImage(item);
                                break;
                            }
                        }
                    }
                    else if (fi.ContentPath.indexOf("Plans") != -1) {
                        var fInfos = data.BuildingFiles;
                        for (var t = 0; t < fInfos.length; t++) {
                            if (fInfos[t].PlanFile.FileName == fi.Name) {
                                var item = fInfos[t];
                                self.$parent.removeFile(item);
                                break;
                            }
                        }
                    }
                    else if (fi.ContentPath.substring(5, fi.ContentPath.length).indexOf("Files") != -1) {
                        var fInfos = data.BuildingPlans;
                        for (var t = 0; t < fInfos.length; t++) {
                            if (fInfos[t].File.FileName == fi.Name) {
                                var item = fInfos[t];
                                self.$parent.removePlan(item);
                                break;
                            }
                        }
                    }
                    else {
                        var url = "/RemoveFile";
                        url = url + "?path=" + fi.ContentPath;
                        url = url + "&id=" + data.Id;
                        TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then(function (success) {
                            var itm = fi;
                            var fInfos = data.BuildingFolders;
                            for (var i = 0; i < fInfos.length; i++) {
                                var folder = getFolderbyPath(fInfos[i], success);
                                if (folder) {
                                    for (var t = 0; t <= folder.items.length; t++) {
                                        if (folder.items[t].id == fi.id) {
                                            folder.items.splice(t, 1);
                                            break;
                                        }
                                    }
                                    self.$parent.bindFolderViewFiles(data, folder.Name);
                                    break;
                                }
                            }
                            self.$apply();
                        }, function (error) {
                            alert(JSON.stringify(error));
                        });
                    }
                }
            };
            BuildingController.prototype.removeFolder = function (fi) {
                if (confirm("Confirm action?")) {
                    var self = this;
                    var data = self.$parent.CurrentBuilding;
                    var url = "/RemoveDirectory";
                    url = url + "?path=" + fi.ContentPath;
                    url = url + "&id=" + data.Id;
                    TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then(function (success) {
                        var itm = fi;
                        if (success == "root") {
                            for (var i = 0; i < data.BuildingFolders.length; i++) {
                                if (data.BuildingFolders[i].id == itm.id) {
                                    data.BuildingFolders.splice(i, 1);
                                    self.$parent.bindFolderViewFiles(data);
                                    break;
                                }
                            }
                            ;
                        }
                        else {
                            for (var i = 0; i < data.BuildingFolders.length; i++) {
                                var folder = getFolderbyPath(data.BuildingFolders[i], success);
                                if (folder) {
                                    for (var t = 0; t <= folder.items.length; t++) {
                                        if (folder.items[t].id == fi.id) {
                                            folder.items.splice(t, 1);
                                            break;
                                        }
                                    }
                                    self.$parent.bindFolderViewFiles(data, folder.Name);
                                    break;
                                }
                            }
                        }
                        self.$apply();
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                }
            };
            return BuildingController;
        }(Controllers.BaseController));
        Controllers.BuildingController = BuildingController;
        function getFolder(item, id) {
            if (item.type != 2) {
                if (item.id == id) {
                    return item;
                }
                else {
                    var sIts = item.items;
                    if (sIts) {
                        for (var i = 0; i < sIts.length; i++) {
                            var t = getFolder(sIts[i], id);
                            if (t)
                                return t;
                        }
                    }
                }
            }
        }
        function getFolderbyPath(item, contentPath) {
            if (item.type != 2) {
                if (item.ContentPath == contentPath) {
                    return item;
                }
                else {
                    var sIts = item.items;
                    if (sIts) {
                        for (var i = 0; i < sIts.length; i++) {
                            var t = getFolderbyPath(sIts[i], contentPath);
                            if (t)
                                return t;
                        }
                    }
                }
            }
        }
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
