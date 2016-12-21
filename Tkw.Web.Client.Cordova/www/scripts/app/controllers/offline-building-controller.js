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
        var images = [];
        var imageId;
        var OfflineBuildingController = (function (_super) {
            __extends(OfflineBuildingController, _super);
            // initializes the controller
            function OfflineBuildingController($scope) {
                var _this = this;
                this.$scope = $scope;
                TKWApp.Configuration.ConfigurationManager.WorkMode = TKWApp.Configuration.WorkMode.OFFLINE;
                _super.call(this);
                this.isLoadingFromFile = false;
                // initialize scope
                $scope.Controller = this;
                $scope.FolderName = "";
                $scope.OriginalSize = false;
                $scope.CustomSize = true;
                this.Uploader = new TKWApp.Services.FileUploader();
                $scope.isInRole = true;
                $scope.OnlineMode = false;
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
                $scope.createNewBuildingImage = this.createNewBuildingImage;
                $scope.saveNewBuildingImage = this.saveNewBuildingImage;
                $scope.createNewPlan = this.createNewPlan;
                $scope.saveNewPlan = this.saveNewPlan;
                $scope.getFeaturedImage = this.getFeaturedImage;
                $scope.getPlanUrl = this.getPlanUrl;
                $scope.removePlan = this.removePlan;
                // get the current building id and load it
                this.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                $scope.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                $scope.sortableViews = {
                    stop: function (e, ui) {
                        var items = $scope.CurrentBuilding.BuildingPlans;
                        TKWApp.Data.DataManager.getFunction("PerformSortBuildingPlan").execute({ "": items }).then(function (data) {
                        }, function (error) {
                        });
                    }
                };
                $scope.hasPricingFiles = false;
                $scope.hasContactFiles = false;
                this.loadBuilding(this.BuildingId);
                //offline methods
                $scope.getPhoto = this.getPhoto;
                $scope.getPlanPhoto = this.getPlanPhoto;
                $scope.sync = this.sync;
                $scope.removeFromOffline = this.removeFromOffline;

                $scope.updatePlanDetail = function (item) {
                    $scope.updatePlanInfo = jQuery.extend(true, {}, item);
                    jQuery("#edit-plan-info").modal("show");
                };
                $scope.editPlanDetail = function () {
                    var self = _this;
                    self.IsSaving = true;
                    for (var i = 0; i < self.$scope.CurrentBuilding.BuildingPlans.length; i++) {
                        if (self.$scope.CurrentBuilding.BuildingPlans[i].Id == self.$scope.updatePlanInfo.Id) {
                            self.$scope.CurrentBuilding.BuildingPlans[i].Name = self.$scope.updatePlanInfo.Name;
                            self.$scope.CurrentBuilding.BuildingPlans[i].Description = self.$scope.updatePlanInfo.Description;
                            break;
                        }
                    }

                    TKWApp.Data.DataManager.Collections["OfflineBuildings"].update(self.$scope.CurrentBuilding).then(function (data) {
                        self.IsSaving = false;
                        jQuery("#edit-plan-info").modal("hide");
                        self.$scope.$apply();
                    }, function (success) {
                        self.IsSaving = false;
                        jQuery("#edit-plan-info").modal("hide");
                        self.$scope.$apply();

                    }, function (error) {
                        self.IsSaving = false;
                        alert(JSON.stringify(error));
                        jQuery("#saveSiteFailure").click();
                    });
                }
            }


            OfflineBuildingController.prototype.loadBuilding = function (id) {
                var _this = this;
                var self = this;
                this.$scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["OfflineBuildings"].find(id).then(function (response) {
                    self.$scope.CurrentBuilding = response;
                    var query = new TKWApp.Data.Query();
                    query.and().eq("BuildingId", response.Id);
                    TKWApp.Data.DataManager.Collections["OfflineBuildingPlans"].search(query).then(function (dataBuildingPlans) {
                        if (dataBuildingPlans.length > 0) {
                            self.$scope.CurrentBuilding.BuildingPlans = dataBuildingPlans;
                            for (var t = 0; t < self.$scope.CurrentBuilding.BuildingPlans.length; t++) {
                                var plan = response.BuildingPlans[t];
                                if (plan) {
                                    response.BuildingPlans[t].HotspotsCount = 0;

                                    for (var j = 0; j < plan.Hotspots.length; j++) {
                                        var hp = plan.Hotspots[j];
                                        if (hp) {
                                            if (hp.Name.indexOf("Circle") == -1 && hp.Name.indexOf("Line") == -1) {
                                                response.BuildingPlans[t].HotspotsCount = response.BuildingPlans[t].HotspotsCount + 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
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
                    _this.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    var src = self.getFeaturedImage(self.$scope.CurrentBuilding);
                    if (src == null)
                        src = self.$scope.DefaultBuildingImage;
                    jQuery("#FeaturedImage").css('background-image', 'url(\'' + src + '\')');
                }, function (error) {
                    this.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                });
            };
            OfflineBuildingController.prototype.edit = function () {
                var scope = this;
                // on edit we copy the current building into a new one... to allow to easily cancel
                if (scope.CurrentBuilding) {
                    scope.EditBuilding = jQuery.extend(true, {}, scope.CurrentBuilding);
                    var self = this;
                    if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        scope.$apply();
                    }
                    //edit-site-modal
                    jQuery("#edit-site-modal").modal("show");
                }
            };
            OfflineBuildingController.prototype.update = function () {
                var scope = this;
                scope.IsSaving = true;
                if (scope.EditBuilding.Actor) {
                    scope.EditBuilding.ActorId = scope.EditBuilding.Actor.Id;
                    scope.EditBuilding.ActorName = scope.EditBuilding.Actor.FirstName;
                }
                TKWApp.Data.DataManager.Collections["OfflineBuildings"].update(scope.EditBuilding).then(function (data) {
                    // we need to reload the current building
                    scope.CurrentBuilding = data;
                    scope.IsSaving = false;
                    //scope.$apply();
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

            OfflineBuildingController.prototype.sync = function () {
                var scope = this;
                scope.IsSaving = true;
                scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["OfflineBuildings"].find(scope.CurrentBuilding.Id).then(function (response) {
                    //here we have to build for syn online
                    //response is the building, we need to take offline plans
                    var query = new TKWApp.Data.Query();
                    query.and().eq("BuildingId", response.Id);
                    TKWApp.Data.DataManager.Collections["OfflineBuildingPlans"].search(query).then(function (dataBuildingPlans) {
                        if (dataBuildingPlans.length > 0) {
                            response.BuildingPlans = dataBuildingPlans;
                        }
                        TKWApp.Data.DataManager.Collections["Buildings"].edit(response, "SyncFromOffLine").then(function (data) { }, function (success) {
                            if (success.status == 200) {
                                var ft = new FileTransfer();
                               
                                for (var t = 0; t < response.BuildingImages.length; t++) {
                                    var image = response.BuildingImages[t];
                                    if (image && image.Id.indexOf("new_") != -1) {
                                        uploadImage(response.Id, ft, image);
                                    }
                                };
                                
                                for (var t = 0; t < response.BuildingPlans.length; t++) {
                                    var planFile = response.BuildingPlans[t].PlanFile;
                                    if (planFile && planFile.Id.indexOf("planImg_") != -1) {
                                        uploadImage(response.Id, ft, planFile);
                                    };
                                    for (var h = 0; h < response.BuildingPlans[t].Hotspots.length; h++) {
                                        var hpFile = response.BuildingPlans[t].Hotspots[h];
                                        if (hpFile && hpFile.Files) {
                                            for (var f = 0; f < hpFile.Files.length; f++) {
                                                if (hpFile.Files[f] && hpFile.Files[f].Id.indexOf("hpFile_") != -1) {
                                                    uploadImage(response.Id, ft, hpFile.Files[f]);
                                                };
                                            }
                                        }
                                    }
                                }

                                if (dataBuildingPlans.length > 0) {
                                    for (var db = 0; db < dataBuildingPlans.length; db++) {
                                        TKWApp.Data.DataManager.Collections["OfflineBuildingPlans"].delete(dataBuildingPlans[db].Id);
                                    }
                                }
                                if (window.localStorage.getItem("OB_" + response.Id)) {
                                    window.localStorage.removeItem("OB_" + response.Id);
                                }
                                TKWApp.Data.DataManager.Collections["OfflineBuildings"].delete(response.Id).then(function (success) {
                                    debugger
                                    //var filesPath = TKWApp.Configuration.ConfigurationManager.LocalUri + "/" + response.ActorName.replace(" ", "");
                                    //ClearDirectory(filesPath);
                                    setTimeout(function () { window.location.href = "dashboard-offline.html"; }, 5000);
                                });
                                scope.IsLoading = false;
                                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                    scope.$apply();
                                }
                            }
                            else {
                                alert(JSON.stringify(success));
                                scope.IsLoading = false;
                                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                    scope.$apply();
                                }
                            }
                        }, function (error) {
                            scope.IsLoading = false;
                            if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                scope.$apply();
                            }
                        });

                    }, function (success) {
                        debugger
                    }, function (error) {
                        alert(JSON.stringify(error));
                        scope.IsLoading = false;
                        if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                            scope.$apply();
                        }
                    });

                }, function (error) {
                    this.$scope.IsLoading = false;
                    self.$scope.$apply();
                });
            };
            OfflineBuildingController.prototype.removeFromOffline = function () {
                var scope = this;
                scope.IsSaving = true;
                if (confirm("Remove from offline?")) {
                    TKWApp.Data.DataManager.Collections["OfflineBuildings"].find(scope.CurrentBuilding.Id).then(function (response) {
                        var query = new TKWApp.Data.Query();
                        query.and().eq("BuildingId", response.Id);
                        TKWApp.Data.DataManager.Collections["OfflineBuildingPlans"].search(query).then(function (dataBuildingPlans) {
                            if (dataBuildingPlans.length > 0) {
                                for (var db = 0; db < dataBuildingPlans.length; db++) {
                                    TKWApp.Data.DataManager.Collections["OfflineBuildingPlans"].delete(dataBuildingPlans[db].Id);
                                }
                            }

                            TKWApp.Data.DataManager.Collections["OfflineBuildings"].delete(response.Id).then(function (success) {
                                if (window.localStorage.getItem("OB_" + response.Id)) {
                                    window.localStorage.removeItem("OB_" + response.Id);
                                }
                                window.location.href = "dashboard-offline.html";
                            });
                        }, function (success) {
                            scope.IsLoading = false;
                            self.$scope.$apply();
                        }, function (error) {
                            scope.IsLoading = false;
                            self.$scope.$apply();
                        });
                    }, function (error) {
                        scope.IsLoading = false;
                        scope.$apply();
                    });
                }
            };

            OfflineBuildingController.prototype.getPlanThumbnail = function (plan) {
                var fileLink = RapApp.FileUtils.getImageUrl(plan.PlanThumbnailFile.BucketPath, plan.PlanThumbnailFile.BucketName, plan.PlanThumbnailFile.FileName);
                return fileLink;
            };
            OfflineBuildingController.prototype.createNewBuildingImage = function () {
                var scope = this;
                scope.AddBuildingImageModel = new RapApp.Models.BuildimgImageUploadModel(document.getElementById("fuBuildingImage"), document.getElementById("fuBuildingImagePreview"));
                scope.AddBuildingImageModel.Height = 300;
                scope.AddBuildingImageModel.Width = 300;
                scope.AddBuildingImageModel.Description = "Building image";
                scope.AddBuildingImageModel.BuildingId = scope.CurrentBuilding.Id;
                scope.AddBuildingImageModel.KeepAspectRatio = false;
                scope.AddBuildingImageModel.Uploader.clearImagePreview(document.getElementById("fuBuildingImage"), document.getElementById("fuBuildingImagePreview"));
            };
            OfflineBuildingController.prototype.getPhoto = function () {
                var scope = this;
                imageId = 'fuBuildingImagePreview';
                navigator.camera.getPicture(onPhotoURISuccess, onFail, {
                    quality: 80,
                    targetWidth: 300,
                    targetHeight: 300,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                });
            };
            OfflineBuildingController.prototype.saveNewBuildingImage = function () {
                var scope = this;
                scope.IsSaving = true;
                scope.IsLoading = true;
                if (images.length > 0) {
                    var img = {
                        Id: "new_" + new Date().toGMTString(),
                        BucketName: scope.CurrentBuilding.ActorName + '/' + 'Buildings' + '/' + scope.CurrentBuilding.Id + '/' + 'Images',
                        BucketPath: 'Files',
                        BuildingId: scope.CurrentBuilding.Id,
                        FileDescription: scope.AddBuildingImageModel.Description,
                        FileId: "",
                        FileName: images[0].substr(images[0].lastIndexOf('/') + 1)
                    };
                    var fileTrn = new FileManager();
                    fileTrn.download_file(images[0], img.BucketPath + "/" + img.BucketName, img.FileName, function (theFile) {
                        scope.CurrentBuilding.BuildingImages.push(img);
                        scope.CurrentBuilding.ImagesCount = scope.CurrentBuilding.BuildingImages.length;
                        TKWApp.Data.DataManager.Collections["OfflineBuildings"].update(scope.CurrentBuilding).then(function (data) {
                            // we need to reload the current building
                            scope.CurrentBuilding = data;
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                            // close the modal dialog
                            jQuery("#add_building_image").modal("hide");
                            scope.$apply();
                        }, function (error) {
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                        });
                    }, function (error) {
                        scope.IsSaving = false;
                        scope.IsLoading = false;
                    });
                }
                else {
                    scope.IsSaving = false;
                    scope.IsLoading = false;
                    alert("You must select an image.");
                }
            };
            OfflineBuildingController.prototype.removeBuildingImage = function (item) {
                var scope = this;
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
                                scope.CurrentBuilding.ImagesCount = scope.CurrentBuilding.BuildingImages.length;
                                TKWApp.Data.DataManager.Collections["OfflineBuildings"].update(scope.CurrentBuilding);
                                break;
                            }
                        }
                    }
                }
            };


            OfflineBuildingController.prototype.createNewPlan = function () {
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
            OfflineBuildingController.prototype.getPlanPhoto = function () {
                var scope = this;
                imageId = 'fuPlanImagePreview';
                navigator.camera.getPicture(onPhotoURISuccess, onFail, {
                    quality: 80,
                    targetWidth: 900,
                    targetHeight: 900,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                });
            };
            OfflineBuildingController.prototype.saveNewPlan = function () {
                var scope = this;
                scope.IsSaving = true;
                scope.IsLoading = true;
                if (images.length > 0) {
                    var planFile = {
                        Id: "planImg_" + generateUUID(),
                        BucketName: scope.CurrentBuilding.ActorName + '/' + 'Buildings' + '/' + scope.CurrentBuilding.Id + '/' + 'Plans',
                        BucketPath: 'Files',
                        FileDescription: scope.AddPlanModel.PlanDescription,
                        FileName: images[0].substr(images[0].lastIndexOf('/') + 1)
                    };
                    var planThumbnailFile = {
                        Id: "plan_" + generateUUID(),
                        BucketName: scope.CurrentBuilding.ActorName + '/' + 'Buildings' + '/' + scope.CurrentBuilding.Id + '/' + 'Plans',
                        BucketPath: 'Files',
                        FileDescription: scope.AddPlanModel.PlanDescription,
                        FileName: images[0].substr(images[0].lastIndexOf('/') + 1)
                    };
                    var plan = {
                        BuildingId: scope.CurrentBuilding.Id,
                        BuildingName: '',
                        CanUseFullCanvas: false,
                        Description: scope.AddPlanModel.Description,
                        Hotspots: [],
                        HotspotsCount: 0,
                        Id: "plan_" + generateUUID(),
                        Name: scope.AddPlanModel.PlanName,
                        PlanThumbnailFile: planThumbnailFile,
                        PlanFile: planFile
                    };
                    var fileTrn = new FileManager();
                    fileTrn.download_file(images[0], planFile.BucketPath + "/" + planFile.BucketName, planFile.FileName, function (theFile) {
                        scope.CurrentBuilding.BuildingPlans.push(plan);
                        scope.CurrentBuilding.ViewsCount = scope.CurrentBuilding.BuildingPlans.length;
                        TKWApp.Data.DataManager.Collections["OfflineBuildings"].update(scope.CurrentBuilding).then(function (data) {
                            // we need to reload the current building
                            scope.CurrentBuilding = data;
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                            // close the modal dialog
                            jQuery("#add_building_plan").modal("hide");
                            scope.$apply();
                        }, function (error) {
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                        });
                    }, function (error) {
                        scope.IsSaving = false;
                        scope.IsLoading = false;
                    });
                }
                else {
                    scope.IsSaving = false;
                    scope.IsLoading = false;
                    alert("You must select an image.");
                }
            };
            OfflineBuildingController.prototype.removePlan = function (item) {
                var scope = this;
                scope.CurrentBuilding.BuildingPlans.splice(scope.CurrentBuilding.BuildingPlans.indexOf(item), 1);
                scope.CurrentBuilding.ViewsCount = scope.CurrentBuilding.BuildingPlans.length;
                TKWApp.Data.DataManager.Collections["OfflineBuildings"].update(scope.CurrentBuilding);
            };
            OfflineBuildingController.prototype.getPlanUrl = function (planId) {
                var url = TKWApp.HardRouting.ApplicationRoutes.Routes["OfflinePlan"];
                var scope = this;
                var plans = scope.CurrentBuilding.BuildingPlans;
                for (var t = 0; t < plans.length; t++) {
                    TKWApp.Data.DataManager.Collections["OfflineBuildingPlans"].find(plans[t].Id).then(function (data) {
                    }, function (success) {
                        if (success.Code == 180) {
                            TKWApp.Data.DataManager.Collections["OfflineBuildingPlans"].create(plans[t]).then(function (success) {
                            }, function (success) { });
                        }
                    });
                }
                url += "?id=" + planId;
                window.location.href = url
            };


            OfflineBuildingController.prototype.getFeaturedImage = function (b) {
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
            OfflineBuildingController.prototype.getBuildingImage = function (bi) {
                return RapApp.FileUtils.getImageUrl(bi.BucketPath, bi.BucketName, bi.FileName);
            };
            OfflineBuildingController.prototype.getFileLink = function (fi) {
                var fileLink = RapApp.FileUtils.getImageUrl(fi.File.BucketPath, fi.File.BucketName, fi.File.FileName);
                return fileLink;
            };

            return OfflineBuildingController;
        })(Controllers.BaseController);
        Controllers.OfflineBuildingController = OfflineBuildingController;

        function ClearDirectory(filesPath) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
            function fail(evt) {
                alert("FILE SYSTEM FAILURE" + evt.target.error.code);
            }
            function onFileSystemSuccess(fileSystem) {
                fileSystem.root.getDirectory(
                    filesPath,
                    { create: true, exclusive: false },
                    function (entry) {
                        entry.removeRecursively(function () {
                            console.log("Remove Recursively Succeeded");
                        }, fail);
                    }, fail);
            }
        };

        function uploadImage(buildingId, ft, image) {
            var imageURI = RapApp.FileUtils.getImageUrl(image.BucketPath, image.BucketName, image.FileName);
            //imageURI = (TKWApp.Configuration.ConfigurationManager.LocalUri.replace("\"", '\'') + image.BucketPath + '/' + RapApp.FileUtils.escapeHtml(image.BucketName) + '/' + image.FileName).replace(" ", "");
            var options = new FileUploadOptions();
            options.fileKey = "recFile";
            options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            options.chunkedMode = false;
            options.headers = {
                Connection: "close",
                'Authorization': 'Bearer ' + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token,
            }
            var params = {};
            params.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            options.params = params;
            var destUrl = encodeURI(TKWApp.Configuration.ConfigurationManager.ServerUri + "api/niv/Building/UploadImageFromOffline?buildingId=" + buildingId + "&bucketName=" + image.BucketName + "&imageName=" + image.FileName);
            ft.upload(imageURI, destUrl, onUploadImageSucces, onUploadImageFail, options, true);
        }

        function onUploadImageSucces(success) {
            console.log("Code = " + success.responseCode);
            console.log("Response = " + success.response);
            console.log("Sent = " + success.bytesSent);
        }
        function onUploadImageFail(error) {
            console.log("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        }
        function onFail(message) {
        }
        function onPhotoURISuccess(imageURI) {
            images = [];
            console.log(imageURI);
            // Get image handle
            var galleryImage = document.getElementById(imageId);
            // Unhide image elements
            galleryImage.style.display = 'block';
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            //
            galleryImage.src = imageURI;
            images.push(imageURI);
        }
        function generateUUID() {
            var d = new Date().getTime();
            if (window.performance && typeof window.performance.now === "function") {
                d += performance.now(); //use high-precision timer if available
            }
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
