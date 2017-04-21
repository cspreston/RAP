/// <reference path="../../typings/kendo/kendo-ui.d.ts" />

module RapApp.Controllers {
    export class BuildingController extends BaseController {
        public $scope: RapApp.Models.ISingleBuilding;
        public Uploader: TKWApp.Services.FileUploader;
        public BuildingId: string;
        public isLoadingFromFile: boolean;
        // initializes the controller
        constructor($scope: RapApp.Models.ISingleBuilding) {
            super($scope);
            this.$scope = $scope;
            var headerTab = $(".header-tabs.scrollable-tabs.sticky");
            var userIcon = $(".nav-user");
            var userIconA = $(".modal-dialog");
            $(".fa-trash, div[class*='delete'][style*='display: block'],div[class*='delete'][data-target], .fa-times").on("click", function () {
                headerTab.css('zIndex', '0');
                userIcon.css('zIndex', '0');
                userIconA.css('zIndex', '0');
            })

            $("button, .modal").on("click", function () {
                headerTab.css('zIndex', '1');
                userIcon.css('zIndex', '1');
                userIconA.css('zIndex', '1');
            })

            this.isLoadingFromFile = false;
            // initialize scope
            (<any>$scope).Controller = this;
            (<any>$scope).FolderName = "";
            (<any>$scope).OriginalSize = false;
            (<any>$scope).CustomSize = true;
            this.Uploader = new TKWApp.Services.FileUploader();
            (<any>$scope).isInRole = true;

            (<any>$scope).options1 = null;
            (<any>$scope).details1 = '';
            (<any>$scope).FileType = null;

            if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Client Admin") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Site Admin")) {
                (<any>$scope).isInRole = false;
            }

            (<any>$scope).isCompanyAdmin = false;
            if (TKWApp.Data.AuthenticationManager.isInRole("Root") ||
                TKWApp.Data.AuthenticationManager.isInRole("Company Admin")) {
                (<any>$scope).isCompanyAdmin = true;
            }

            (<any>$scope).isSiteAdmin = false;
            if (TKWApp.Data.AuthenticationManager.isInRole("Root") ||
                TKWApp.Data.AuthenticationManager.isInRole("Site Admin")) {
                (<any>$scope).isSiteAdmin = true;
            }
            (<any>$scope).isClientAdmin = false;
            if (TKWApp.Data.AuthenticationManager.isInRole("Root") ||
                TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                (<any>$scope).isClientAdmin = true;
            }
            $scope.DefaultBuildingImage = "./Content/Images/default-building.png";
            $scope.DefaultPlanImage = "./Content/Images/default-plan.jpg";

            // add methods to the scope
            (<any>$scope).getBuildingImage = this.getBuildingImage;
            (<any>$scope).getPlanThumbnail = this.getPlanThumbnail;
            (<any>$scope).getFileLink = this.getFileLink;

            (<any>$scope).removeBuildingImage = this.removeBuildingImage;

            (<any>$scope).setMainBuildingImage = this.setMainBuildingImage;

            (<any>$scope).edit = this.edit;
            (<any>$scope).update = this.update;

            (<any>$scope).createNewContactInfo = this.createNewContactInfo;
            (<any>$scope).removeContactInfo = this.removeContactInfo;
            (<any>$scope).insertContactInfo = this.insertContactInfo;
            (<any>$scope).saveContactInfo = this.saveContactInfo;
            (<any>$scope).updateContactInfo = (item) => {
                (<any>$scope).EditContactInfo = item;
                (<any>jQuery("#edit_contact_info")).modal("show");
            }

            (<any>$scope).createNewPricingInfo = this.createNewPricingInfo;
            (<any>$scope).savePricingInfo = this.savePricingInfo;
            (<any>$scope).removePricingInfo = this.removePricingInfo;
            (<any>$scope).insertPricingInfo = this.insertPricingInfo;

            (<any>$scope).updatePricingInfo = (item) => {
                (<any>$scope).EditPricingInfo = item;
                (<any>jQuery("#edit-pricing")).modal("show");
            }

           

            (<any>$scope).createNewBuildingImage = this.createNewBuildingImage;
            (<any>$scope).saveNewBuildingImage = this.saveNewBuildingImage;

            (<any>$scope).createNewPlan = this.createNewPlan;
            (<any>$scope).saveNewPlan = this.saveNewPlan;

            (<any>$scope).createNewFile = this.createNewFile;
            (<any>$scope).saveNewFile = this.saveNewFile;
            (<any>$scope).removeFile = this.removeFile;

            (<any>$scope).createNewDisasterInfo = this.createNewDisasterInfo;
            (<any>$scope).saveNewDisasterInfo = this.saveNewDisasterInfo;
            (<any>$scope).removeDisasterInfo = this.removeDisasterInfo;

            (<any>$scope).getFeaturedImage = this.getFeaturedImage;

            (<any>$scope).deleteCurrentSite = this.deleteCurrentSite;

            (<any>$scope).getPlanUrl = this.getPlanUrl;
            (<any>$scope).onChangeClient = this.onChangeClient;
            (<any>$scope).removePlan = this.removePlan;
            (<any>$scope).checkFileBox = this.checkFileBox;
            (<any>$scope).isFileCheckBoxSelected = this.isFileCheckBoxSelected;

            (<any>$scope).loadUsers = () => {
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
                                url: TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/User/GetAllByClient?clientId=" + (<any>$scope).EditBuilding.ActorId,
                                beforeSend: function (req) {
                                    req.setRequestHeader('Authorization', "Bearer " + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token);
                                },
                                dataType: "json"
                            }
                        }
                    }
                }
            }

            (<any>$scope).importPlansFromPDF = () => {
                TKWApp.HardRouting.ApplicationRoutes.redirect("ImportPlan", this.$scope.BuildingId);
            };

            // get the current building id and load it
            this.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            $scope.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            (<any>$scope).copy = this.copy;
            (<any>$scope).checkImageInClone = this.checkImageInClone;
            (<any>$scope).checkPlanInClone = this.checkPlanInClone;
            (<any>$scope).checkPriceInClone = this.checkPriceInClone;
            (<any>$scope).checkContactInClone = this.checkContactInClone;

            (<any>$scope).checkFilesInClone = this.checkFilesInClone;
            (<any>$scope).checkDisasterInfoInClone = this.checkDisasterInfoInClone;

            (<any>$scope).treeData = new kendo.data.HierarchicalDataSource();
            (<any>$scope).bindFolderViewFiles = this.bindFolderViewFiles;
            (<any>$scope).clickFile = (item) => {
                (<any>$scope).SelectedFile = item;
                $("div[id^='file_act_']").hide();
                $("div[id^='fold_act_']").hide();
                if (item.type == 0 && !item.IsBucket) {
                    $("#fold_act_" + item.id).show();
                }
                if (item.type == 2) {
                    $("#file_act_" + item.id).show();
                }
            }
            (<any>$scope).foldActAdd = this.foldActAdd;
            (<any>$scope).createFolder = this.createFolder;

            (<any>$scope).getFileFolderLink = this.getFileFolderLink;
            (<any>$scope).foldActAddFile = this.foldActAddFile;
            (<any>$scope).createFile = this.createFile;
            (<any>$scope).removeFileFolder = this.removeFileFolder;
            (<any>$scope).removeFolder = this.removeFolder;
            (<any>$scope).renderMap = false;
            (<any>$scope).showMap = this.showMap;

            (<any>$scope).updateBuildingDisasterInfo = (item) => {
                (<any>$scope).EditMetaDataFile = item;
                (<any>jQuery("#edit_building_disaster_info")).modal("show");
            }
            (<any>$scope).editDisasterInfo = this.editDisasterInfo;

            (<any>$scope).updateBuildingFile = (item) => {
                (<any>$scope).EditMetaDataFile = item;
                (<any>jQuery("#edit_building_file")).modal("show");
            }
            (<any>$scope).editBuildingFile = this.editBuildingFile;
            (<any>$scope).sortableViews = {
                stop: function (e, ui) {
                    var items = (<any>$scope.CurrentBuilding).BuildingPlans;
                    TKWApp.Data.DataManager.getFunction("PerformSortBuildingPlan").execute({ "": items }).then((data) => {
                    }, (error) => {
                    });
                }
            };
            (<any>$scope).sortableImages = {
                stop: function (e, ui) {
                    var items = (<any>$scope.CurrentBuilding).BuildingImages;
                    TKWApp.Data.DataManager.getFunction("PerformSortBuildingImage").execute({ "": items }).then((data) => {
                    }, (error) => {
                    });
                }
            };

            (<any>$scope).updateImageNameOnEnter = this.updateImageNameOnEnter;
            (<any>$scope).updateImageName = this.updateImageName;

            (<any>$scope).updatePlanNameOnEnter = this.updatePlanNameOnEnter;
            (<any>$scope).updatePlanName = this.updatePlanName;

            (<any>$scope).updatePlanDetail = (item) => {
                (<any>$scope).updatePlanInfo = jQuery.extend(true, {}, item);
                (<any>jQuery("#edit-plan-info")).modal("show");
            }

            (<any>$scope).editPlanDetail = () => {
                var self: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
                self.IsSaving = true;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].edit((<any>self).$scope.updatePlanInfo, "EditDetails").then(function (data) {
                }, function (success) {
                    if (success.status == 200) {
                        for (var i = 0; i < (<any>self).$scope.CurrentBuilding.BuildingPlans.length; i++) {
                            if ((<any>self).$scope.CurrentBuilding.BuildingPlans[i].Id == (<any>self).$scope.updatePlanInfo.Id) {
                                (<any>self).$scope.CurrentBuilding.BuildingPlans[i].Name = (<any>self).$scope.updatePlanInfo.Name;
                                (<any>self).$scope.CurrentBuilding.BuildingPlans[i].Description = (<any>self).$scope.updatePlanInfo.Description;
                                break;
                            }
                        }
                        self.IsSaving = false;
                        (<any>jQuery("#edit-plan-info")).modal("hide");
                        (<any>self).$scope.$apply();
                    }
                    else {
                        self.IsSaving = false;
                        (<any>jQuery("#edit-plan-info")).modal("hide");
                        (<any>jQuery("#saveSiteFailure")).click();
                    }
                }, function (error) {
                    self.IsSaving = false;
                    alert(JSON.stringify(error));
                    (<any>jQuery("#saveSiteFailure")).click();
                });
            }
            (<any>$scope).hasPricingFiles = false;
            (<any>$scope).hasContactFiles = false;
            this.loadBuilding(this.BuildingId);

            (<any>$scope).selectPlanSize = this.selectPlanSize;
            (<any>$scope).openSendEmergencyEmail = () =>
            {
                (<any>jQuery("#emergency-email")).val('');
                (<any>jQuery("#send-emergency-email")).modal("show");
            }
            (<any>$scope).sendEmergencyEmail = this.sendEmergencyEmail;
            (<any>$scope).zipSite = this.zipSite;
        };

        
        //downlaod all files for selected building
        zipSite() {
            var scope: any = <any>this;
            scope.IsSaving = true;
            var url = "DownloadBuildingFiles?Id=" + scope.CurrentBuilding.Id;
            
            return TKWApp.Data.DataManager.Collections["Buildings"].getFromUrl(url).then((data) => {
                scope.IsSaving = false;
                if (data) {
                    window.open(data, '_blank', '');
                }
                else {
                    alert(JSON.stringify(data.responseText));
                }
                (<any>jQuery("#send-emergency-email")).modal("hide");
            }, function (error) {
                scope.IsSaving = false;
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();

            }, function (error) {
                // display an error
                scope.IsSaving = false;
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
                });

        }

        selectPlanSize(value: boolean) {
            var scope: any = <any>this;
            (<any>scope).OriginalSize = value;
            (<any>scope).CustomSize = !(<any>scope).OriginalSize;
            if (value) {
                scope.AddPlanModel.Height = 0;
                scope.AddPlanModel.Width = 0;
            }
            else {
                scope.AddPlanModel.Height = 600;
                scope.AddPlanModel.Width = 900;
            }
        }

        updateImageNameOnEnter(e, item) {
            if (e.keyCode == 13) {
                var scope: any = <any>this;
                var items = (<any>scope.CurrentBuilding).BuildingImages;
                for (var i = 0; i < items.length; i++) {
                    if (item.id == items[i].id && item.FileDescription != item.FileDescription) {
                        TKWApp.Data.DataManager.Collections["BuildingImages"].update(item).then(function (data) {
                        }, function (error) {
                        });
                        break;
                    }
                }
            }
        }

        updateImageName(e, item) {
            var scope: any = <any>this;
            var items = (<any>scope.CurrentBuilding).BuildingImages;
            for (var i = 0; i < items.length; i++) {
                if (item.id == items[i].id && item.FileDescription != item.FileDescription) {
                    TKWApp.Data.DataManager.Collections["BuildingImages"].update(item).then(function (data) {
                    }, function (error) {
                    });
                    break;
                }
            }
        }

        updatePlanNameOnEnter(e, item) {
            if (e.keyCode == 13) {
                var scope: any = <any>this;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].update(item).then(function (data) {
                }, function (error) {
                });
            }
        }
        updatePlanName(e, item) {
            var scope: any = <any>this;
            TKWApp.Data.DataManager.Collections["BuildingPlans"].update(item).then(function (data) {
            }, function (error) {
            });
        }

        loadBuilding(id) {
            var self = this;
            this.$scope.IsLoading = true;
            TKWApp.Data.DataManager.Collections["Buildings"].find(id).then((response) => {
                (<any>self).$scope.CurrentBuilding = response;
                for (var i = 0; i < response.BuildingFiles.length; i++) {
                    if (response.BuildingFiles[i].Type == 1) {
                        (<any>self).$scope.hasPricingFiles = true;
                    }
                    else if (response.BuildingFiles[i].Type == 2) {
                        (<any>self).$scope.hasContactFiles = true;
                    }
                    if ((<any>self).$scope.hasPricingFiles && (<any>self).$scope.hasContactFiles)
                        break;
                }
                var url = window.URL;
                if (window.location.href.indexOf("copy-site") >= 0) {
                    (<any>self).$scope.SiteClone = jQuery.extend(true, {}, (<any>self).$scope.CurrentBuilding);
                    (<any>self).$scope.SiteClone.Name = (<any>self).$scope.CurrentBuilding.Name + " Clone";
                }
                this.$scope.IsLoading = false;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.bindFolderViewFiles(response, "");
                self.loadClients();
                var src = self.getFeaturedImage((<any>self).$scope.CurrentBuilding);
                if (src == null)
                    src = self.$scope.DefaultBuildingImage;
                (<any>jQuery("#FeaturedImage")).css('background-image', 'url(\'' + src + '\')');
                self.$scope.$apply();

            }, function (error) {
                this.$scope.IsLoading = false;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.$scope.$apply();
            });
        }

        loadClients() {
            var self = this;
            TKWApp.Data.DataManager.Collections["Clients"].search(null).then((data) => {
                (<any>self).$scope.Clients = data;
                // this forces it to do so
                self.$scope.$apply();
            }, function (error) {
                this.$scope.IsLoading = false;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                alert(JSON.stringify(error));
            });
        }

        edit() {
            var scope: any = <any>this;
            // on edit we copy the current building into a new one... to allow to easily cancel
            if (scope.CurrentBuilding) {
                scope.EditBuilding = jQuery.extend(true, {}, scope.CurrentBuilding);
                var self = this;
                (<any>self).renderMap = !(<any>self).renderMap;
                (<any>self).loadUsers();
                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                }
                //edit-site-modal
                (<any>jQuery("#edit-site-modal")).modal("show");
            }
        }

        sendEmergencyEmail() {
            var scope: any = <any>this;
            var url = "SendEmergencyEmail?Id=" + scope.CurrentBuilding.Id + "&message=" + (<any>jQuery("#emergency-email")).val();
            TKWApp.Data.DataManager.Collections["Buildings"].edit(null, url).then(function (data) {
            }, function (success) {
                scope.IsSaving = false;
                if (success.status == 200) {
                    alert("Notification was sent successfully!");
                }
                else {
                    alert(JSON.stringify(success.responseText));
                }
                (<any>jQuery("#send-emergency-email")).modal("hide");
            }, function (error) {
                scope.IsSaving = false;
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }

        showMap() {
            var self = this;
            (<any>self).renderMap = !(<any>self).renderMap;
        }

        onChangeClient() {
            var scope: any = <any>this;
            scope = scope.$angular_scope;
            scope.EditBuilding.UserIds = "";
            (<any>scope).loadUsers();
            scope.$apply();
        }

        update() {
            var scope: any = <any>this;
            scope.IsSaving = true;

            if (scope.EditBuilding.Actor) {
                scope.EditBuilding.ActorId = (<any>scope.EditBuilding.Actor).Id;
                scope.EditBuilding.ActorName = (<any>scope.EditBuilding.Actor).FirstName;
            }

            if ((<any>scope).$$childHead.details && (<any>scope).$$childHead.details.geometry && (<any>scope).$$childHead.details.geometry.location) {
                var coord = Array<Number>();
                coord.push((<any>scope).$$childHead.details.geometry.location.lat());
                coord.push((<any>scope).$$childHead.details.geometry.location.lng());
                (<any>scope).EditBuilding.Geopoints = JSON.stringify(coord);
            }



            TKWApp.Data.DataManager.Collections["Buildings"].update(scope.EditBuilding).then(function (data) {
                // we need to reload the current building
                scope.CurrentBuilding = data;
                scope.IsSaving = false;
                scope.$apply();
                // close the modal dialog
                (<any>jQuery("#edit-site-modal")).modal("hide");
                (<any>jQuery("#saveSiteSuccess")).click();
            }, function (error) {
                scope.IsSaving = false;
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
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
                    url = b.BuildingImages[i].Url;
                    //url = RapApp.FileUtils.getImageUrl(b.BuildingImages[i].BucketPath, b.BuildingImages[i].BucketName, b.BuildingImages[i].FileName);
                }
            }
            if (!url && b.BuildingImages.length > 0) {
                // featured image is not in the list
                // normally this should never happen, but just in case
                // we consider the first image as featured
                url = b.BuildingImages[0].Url;
                //url = RapApp.FileUtils.getImageUrl(b.BuildingImages[0].BucketPath, b.BuildingImages[0].BucketName, b.BuildingImages[0].FileName);
            }
            return url;
        }    // returns the url for the building's featured image

        getBuildingImage(bi: any) {
            return bi.Url;
            //return RapApp.FileUtils.getImageUrl(bi.BucketPath, bi.BucketName, bi.FileName);
        }

        getFileLink(fi: any) {
            //var fileLink = RapApp.FileUtils.getImageUrl(fi.File.BucketPath, fi.File.BucketName, fi.File.FileName);
            var fileLink = fi.File.FileUrl;
            return fileLink;
        }

        getPlanThumbnail(plan: any) {
            //var fileLink = RapApp.FileUtils.getImageUrl(plan.PlanThumbnailFile.BucketPath, plan.PlanThumbnailFile.BucketName, plan.PlanThumbnailFile.FileName);
            var fileLink = plan.PlanFile.ThumbUrl;
            return fileLink;
        }

        createNewBuildingImage() {
            //var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            //scope.AddBuildingImageModel = new RapApp.Models.BuildimgImageUploadModel(
            //    <HTMLInputElement>document.getElementById("fuBuildingImage"),
            //    <HTMLImageElement>document.getElementById("fuBuildingImagePreview")
            //);
            //scope.AddBuildingImageModel.Height = 300;
            //scope.AddBuildingImageModel.Width = 300;
            //scope.AddBuildingImageModel.Description = "Building image";
            //scope.AddBuildingImageModel.BuildingId = scope.CurrentBuilding.Id;
            //scope.AddBuildingImageModel.KeepAspectRatio = false;

            //scope.AddBuildingImageModel.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuBuildingImage"), <HTMLImageElement>document.getElementById("fuBuildingImagePreview"));
        }

        saveNewBuildingImage() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            scope.IsLoading = true;
            if (scope.AddBuildingImageModel.Uploader.files.length > 0) {
                var uploadUrl: string = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingImage/Post";
                var files = scope.AddBuildingImageModel.Uploader.files;
                for (var i = 0; i < files.length; i++) {
                    var knt = 0;
                    var progress: TKWApp.Services.OperationProgress = scope.AddBuildingImageModel.Uploader.uploadFile(scope.AddBuildingImageModel.Uploader.files[i],
                        uploadUrl,
                        {
                            Name: scope.AddBuildingImageModel.Uploader.files[i].name,
                            Width: scope.AddBuildingImageModel.Width,
                            Height: scope.AddBuildingImageModel.Height,
                            KeepAspectRatio: scope.AddBuildingImageModel.KeepAspectRatio,
                            Description: scope.AddBuildingImageModel.Description,
                            BuildingId: scope.AddBuildingImageModel.BuildingId
                        });
                    progress.progress((args) => {
                    });
                    progress.finished(() => {
                        knt++;
                        // reload building
                        if (knt == files.length) {
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                            (<BuildingController>(<any>scope).Controller).loadBuilding(scope.CurrentBuilding.Id);
                            // close the modal
                            (<any>jQuery("#add_building_image")).modal("hide");
                            (<any>jQuery("#saveSiteSuccess")).click();
                        }
                    });
                    progress.error((err) => {
                        scope.IsSaving = false;
                        scope.IsLoading = false;
                        (<any>jQuery("#saveSiteFailure")).click();
                    });
                }
            }
            else {
                scope.IsSaving = false;
                scope.IsLoading = false;
                alert("You must select an image.");
            }
        }

        removeBuildingImage(item) {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            TKWApp.Data.DataManager.Collections["BuildingImages"].delete(item.Id).then(function (data) { },
                function (success) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    if (success.status == 200) {
                        if (scope.CurrentBuilding) {
                            var images = (<any>scope.CurrentBuilding).BuildingImages;
                            var isMainImg = false;
                            if ((<any>scope.CurrentBuilding).FeaturedImageId == item.Id) {
                                isMainImg = true;
                                (<any>scope.CurrentBuilding).FeaturedImageId = null;
                            }
                            if (images) {
                                for (var i = 0; i < images.length; i++) {
                                    var img = images[i];
                                    if (isMainImg && (<any>scope.CurrentBuilding).FeaturedImageId == null && img.Id != item.Id) {
                                        (<any>scope.CurrentBuilding).FeaturedImageId = img.Id;
                                    }
                                    if (img.Id === item.Id) {
                                        (<any>scope.CurrentBuilding).BuildingImages.splice(i, 1);
                                        if ((<any>scope.CurrentBuilding).FeaturedImageId != null && (<any>scope.CurrentBuilding).BuildingImages[0] != null) {
                                            var imgH = (<any>scope.CurrentBuilding).BuildingImages[0];
                                            var src = RapApp.FileUtils.getImageUrl(imgH.BucketPath, imgH.BucketName, imgH.FileName);
                                            if (src != null) {
                                                (<any>jQuery("#FeaturedImage")).css('background-image', 'url(\'' + src + '\')');
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            (<any>scope).bindFolderViewFiles(scope.CurrentBuilding, "Images");
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
        }

        setMainBuildingImage(item) {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsLoading = true;
            TKWApp.Data.DataManager.Collections["BuildingImages"].edit(null, "SetMainImage?id=" + item.Id).then(function (data) { },
                function (success) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    if (success.status == 200) {
                        (<any>scope.CurrentBuilding).FeaturedImageId = item.Id;
                        var src = RapApp.FileUtils.getImageUrl(item.BucketPath, item.BucketName, item.FileName);
                        if (src != null) {
                            (<any>jQuery("#FeaturedImage")).css('background-image', 'url(\'' + src + '\')');
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
        }

        // Contact info management methods
        // initiate create new contact
        createNewContactInfo() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
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

            scope.AddPriceInfoInfoModel = new RapApp.Models.BuildFileUploadModel(
                <HTMLInputElement>document.getElementById("ciPricingInfo"),
                <HTMLImageElement>document.getElementById("ciPricingInfoPreview")
            );
            scope.AddPriceInfoInfoModel.Description = "file description";
            scope.AddPriceInfoInfoModel.BuildingId = scope.CurrentBuilding.Id;
            scope.AddPriceInfoInfoModel.FileName = "";
            scope.AddPriceInfoInfoModel.FileDescription = "";

            scope.AddPriceInfoInfoModel.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("ciPricingInfo"),
                <HTMLImageElement>document.getElementById("ciPricingInfoPreview")
            );

            this.isLoadingFromFile = false;
        }

        // delete existing contact info and refresh the building
        removeContactInfo(item) {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;

            TKWApp.Data.DataManager.Collections["ContactInfos"].delete(item.Id).then(function (data) { }, function (success) {
                scope.CurrentBuilding.ContactInfos.splice(scope.CurrentBuilding.ContactInfos.indexOf(item), 1);
                scope.$apply();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });
        }
        // insert a new contact info and refresh the building
        insertContactInfo() {
            if (this.isLoadingFromFile) {
                var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
                scope.IsSaving = true;
                if (scope.AddPriceInfoInfoModel.Uploader.files.length > 0) {
                    var uploadUrl: string = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/ContactInfo/PostFile";
                    var progress: TKWApp.Services.OperationProgress = scope.AddPriceInfoInfoModel.Uploader.uploadFile(scope.AddPriceInfoInfoModel.Uploader.files[0],
                        uploadUrl,
                        {
                            Name: scope.AddPriceInfoInfoModel.Uploader.files[0].name,
                            BuildingId: scope.AddPriceInfoInfoModel.BuildingId,
                        });
                    progress.finished((response) => {
                        scope.IsSaving = false;
                        var cnts = JSON.parse(response);
                        $.each(cnts, function (i, item) {
                            scope.CurrentBuilding.ContactInfos.push(item);
                        });
                        (<any>jQuery("#add_contact_info")).modal("hide");
                        (<any>jQuery("#saveSiteSuccess")).click();
                        scope.IsSaving = false;
                        scope.$apply();
                    });
                    progress.error((err) => {
                        scope.IsSaving = false;
                        (<any>jQuery("#saveSiteFailure")).click();
                    });
                }
                else {
                    scope.IsSaving = false;
                    alert("You must select a file.");
                }
            } else {
                var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
                scope.IsSaving = true;
                TKWApp.Data.DataManager.Collections["ContactInfos"].create(scope.EditContactInfo).then(function (data) {
                    // add the new item to the list
                    scope.CurrentBuilding.ContactInfos.push(data);
                    scope.IsSaving = false;
                    scope.$apply();
                
                    // close the modal dialog
                    (<any>jQuery("#add_contact_info")).modal("hide");
                    (<any>jQuery("#saveSiteSuccess")).click();
                }, function (error) {
                    scope.IsSaving = false;
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    (<any>jQuery("#saveSiteFailure")).click();
                });
            }
        }

        saveContactInfo() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            TKWApp.Data.DataManager.Collections["ContactInfos"].update(scope.EditContactInfo).then(function (data) {
                // add the new item to the list
                scope.IsSaving = false;
                scope.$apply();
                // close the modal dialog
                (<any>jQuery("#edit_contact_info")).modal("hide");
                (<any>jQuery("#saveSiteSuccess")).click();
            }, function (error) {
                scope.IsSaving = false;
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }
        // Pricing info management methods
        // initialize a new pricing info
        createNewPricingInfo() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.EditPricingInfo = {
                Id: "",
                BuildingId: scope.BuildingId,
                Name: "",
                Description: "",
                UnitPrice: 0,
                Quantity: 0,
                Units: "",
            };


            scope.AddPriceInfoInfoModel = new RapApp.Models.BuildFileUploadModel(
                <HTMLInputElement>document.getElementById("fuPricingInfo"),
                <HTMLImageElement>document.getElementById("fuPricingInfoPreview")
            );
            scope.AddPriceInfoInfoModel.Description = "file description";
            scope.AddPriceInfoInfoModel.BuildingId = scope.CurrentBuilding.Id;
            scope.AddPriceInfoInfoModel.FileName = "";
            scope.AddPriceInfoInfoModel.FileDescription = "";

            scope.AddPriceInfoInfoModel.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuPricingInfo"),
                <HTMLImageElement>document.getElementById("fuPricingInfoPreview")
            );

            this.isLoadingFromFile = false;
        }

        savePricingInfo() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            TKWApp.Data.DataManager.Collections["PricingInfos"].update(scope.EditPricingInfo).then(function (data) {
                // add the new item to the list
                scope.IsSaving = false;
                scope.$apply();
                // close the modal dialog
                (<any>jQuery("#edit-pricing")).modal("hide");
                (<any>jQuery("#saveSiteSuccess")).click();
            }, function (error) {
                scope.IsSaving = false;
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }
        // insert a new pricing info
        insertPricingInfo() {
            if (!this.isLoadingFromFile) {
                var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
                scope.IsSaving = true;
                TKWApp.Data.DataManager.Collections["PricingInfos"].create(scope.EditPricingInfo).then(function (data) {
                    // add the new item to the list
                    scope.CurrentBuilding.PricingInfos.push(data);
                    scope.IsSaving = false;
                    scope.$apply();
                    // close the modal dialog
                    (<any>jQuery("#add_pricing_info")).modal("hide");
                    (<any>jQuery("#saveSiteSuccess")).click();
                }, function (error) {
                    scope.IsSaving = false;
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    (<any>jQuery("#saveSiteFailure")).click();
                });
            }
            else {
                var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
                scope.IsSaving = true;
                if (scope.AddPriceInfoInfoModel.Uploader.files.length > 0) {
                    var uploadUrl: string = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/PricingInfo/PostFile";
                    var progress: TKWApp.Services.OperationProgress = scope.AddPriceInfoInfoModel.Uploader.uploadFile(scope.AddPriceInfoInfoModel.Uploader.files[0],
                        uploadUrl,
                        {
                            Name: scope.AddPriceInfoInfoModel.Uploader.files[0].name,
                            BuildingId: scope.AddPriceInfoInfoModel.BuildingId,
                        });
                    progress.finished((response) => {
                        // close the modal
                        scope.IsSaving = false;
                        var cnts = JSON.parse(response);
                        $.each(cnts, function (i, item) {
                            scope.CurrentBuilding.PricingInfos.push(item);
                        });
                        (<any>jQuery("#add_pricing_info")).modal("hide");
                        (<any>jQuery("#saveSiteSuccess")).click();
                        scope.$apply();
                    });
                    progress.error((err) => {
                        scope.IsSaving = false;
                        (<any>jQuery("#saveSiteFailure")).click();
                    });
                }
                else {
                    scope.IsSaving = false;
                    alert("You must select a file.");
                }
            }
        }
        // delete an existing pricing info
        removePricingInfo(item) {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            TKWApp.Data.DataManager.Collections["PricingInfos"].delete(item.Id).then(function (data) {
            }, function (success) {
                scope.CurrentBuilding.PricingInfos.splice(scope.CurrentBuilding.PricingInfos.indexOf(item), 1);
                scope.$apply();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });

        }

        deleteCurrentSite() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            TKWApp.Data.DataManager.Collections["Buildings"].delete(scope.CurrentBuilding.Id).then((data) => {
                TKWApp.HardRouting.ApplicationRoutes.redirect("Dashboard");
            }, (succes) => {
                if (succes.status === 200) {
                    window.location.href = "dashboard";
                }
                else {
                    alert(JSON.stringify(succes));
                }
            }
                , (error) => {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
        }

        createNewFile(type: any = null) {
            var scope = (<any>this);
            scope.IsSaving = false;
            scope.FileType = type;
            scope.AddFileModel = new RapApp.Models.BuildFileUploadModel(
                <HTMLInputElement>document.getElementById("fuFile"),
                <HTMLImageElement>document.getElementById("fuFilePreview")
            );
            scope.AddFileModel.Description = "file description";
            scope.AddFileModel.BuildingId = scope.CurrentBuilding.Id;
            scope.AddFileModel.FileName = "";
            scope.AddFileModel.FileDescription = "";

            scope.AddFileModel.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuFile"),
                <HTMLImageElement>document.getElementById("fuFilePreview")
            );
        }

        removeFile(item) {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;

            TKWApp.Data.DataManager.Collections["BuildingFiles"].delete(item.Id).then(function (data) {
                scope.CurrentBuilding.BuildingFiles.splice(scope.CurrentBuilding.BuildingFiles.indexOf(item), 1);
                (<any>scope).bindFolderViewFiles(scope.CurrentBuilding, "Files");
                (<any>scope.$parent).hasContactFiles = false;
                (<any>scope.$parent).hasPricingFiles = false;
                for (var i = 0; i < scope.CurrentBuilding.BuildingFiles.length; i++) {
                    if (scope.CurrentBuilding.BuildingFiles[i].Type == 1) {
                        (<any>scope.$parent).hasPricingFiles = true;
                    }
                    else if (scope.CurrentBuilding.BuildingFiles[i].Type == 2) {
                        (<any>scope.$parent).hasContactFiles = true;
                    }
                    if ((<any>scope.$parent).hasPricingFiles && (<any>scope.$parent).hasContactFiles)
                        break;
                }
                scope.$apply();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });
        }

        saveNewFile() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            if (scope.AddFileModel.Uploader && scope.AddFileModel.Uploader.files.length > 0) {
                var uploadUrl: string = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingFile/Post";
                var files = scope.AddFileModel.Uploader.files;
                for (var i = 0; i < files.length; i++) {
                    var progress: TKWApp.Services.OperationProgress = scope.AddFileModel.Uploader.uploadFile(scope.AddFileModel.Uploader.files[i],
                        uploadUrl,
                        {
                            Name: scope.AddFileModel.Uploader.files[i].name,
                            Description: scope.AddFileModel.Description,
                            BuildingId: scope.AddFileModel.BuildingId,
                            Title: scope.AddFileModel.FileName,
                            BuildingFileDescription: scope.AddFileModel.FileDescription,
                            Type: (<any>scope).FileType
                        });
                    progress.progress((args) => {
                    });
                    progress.finished(() => {
                        scope.IsSaving = false;
                        // reload building
                        (<BuildingController>(<any>scope).Controller).loadBuilding(scope.CurrentBuilding.Id);
                        // close the modal
                        (<any>jQuery("#add_building_file")).modal("hide");
                        (<any>jQuery("#saveSiteSuccess")).click();
                    });
                    progress.error((err) => {
                        scope.IsSaving = false;

                        (<any>jQuery("#saveSiteFailure")).click();
                    });
                }
            }
            else {
                scope.IsSaving = false;
                alert("You must select a file.");
            }
        }

        editBuildingFile() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            TKWApp.Data.DataManager.Collections["BuildingFiles"].update(scope.EditMetaDataFile).then(function (data) {
                // add the new item to the list
                scope.IsSaving = false;
                scope.$apply();
                // close the modal dialog
                (<any>jQuery("#edit_building_file")).modal("hide");
                (<any>jQuery("#saveSiteSuccess")).click();
            }, function (error) {
                scope.IsSaving = false;
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }

        createNewPlan() {
            //var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;

            //scope.AddPlanModel = new RapApp.Models.BuildimgPlanUploadModel(
            //    <HTMLInputElement>document.getElementById("fuPlanImage"),
            //    <HTMLImageElement>document.getElementById("fuPlanImagePreview")
            //);
            //scope.AddPlanModel.Description = "Floor plan";
            //scope.AddPlanModel.BuildingId = scope.CurrentBuilding.Id;
            //scope.AddPlanModel.PlanName = "";
            //scope.AddPlanModel.Height = 600;
            //scope.AddPlanModel.Width = 900;
            //scope.AddPlanModel.PlanDescription = "";
            //scope.AddPlanModel.KeepAspectRatio = false;

            //scope.AddPlanModel.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuPlanImage"),
            //    <HTMLImageElement>document.getElementById("fuPlanImagePreview")
            //);
        }

        saveNewPlan() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            scope.IsLoading = true;
            if (scope.AddPlanModel.Uploader.files.length > 0) {
                var uploadUrl: string = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/Post";
                var files = scope.AddPlanModel.Uploader.files;
                for (var i = 0; i < files.length; i++) {
                    scope.IsSaving = true;
                    var knt = 0;
                    var progress: TKWApp.Services.OperationProgress = scope.AddPlanModel.Uploader.uploadFile(scope.AddPlanModel.Uploader.files[i],
                        uploadUrl,
                        {
                            Name: scope.AddPlanModel.Uploader.files[i].name,
                            Description: scope.AddPlanModel.Description,
                            BuildingId: scope.AddPlanModel.BuildingId,
                            PlanName: scope.AddPlanModel.PlanName,
                            PlanDescription: scope.AddPlanModel.PlanDescription,
                            Width: scope.AddPlanModel.Width,
                            Height: scope.AddPlanModel.Height,
                            KeepAspectRatio: scope.AddPlanModel.KeepAspectRatio
                        });
                    progress.progress((args) => {
                    });
                    progress.finished(() => {
                        knt++;
                        // reload building
                        if (knt == files.length) {
                            (<BuildingController>(<any>scope).Controller).loadBuilding(scope.CurrentBuilding.Id);
                            scope.IsSaving = false;
                            scope.IsLoading = false;
                            // close the modal
                            (<any>jQuery("#add_building_plan")).modal("hide");
                            (<any>jQuery("#saveSiteSuccess")).click();
                        }
                    });
                    progress.error((err) => {
                        scope.IsSaving = false;
                        scope.IsLoading = false;
                        (<any>jQuery("#saveSiteFailure")).click();
                    });
                }
            }
            else {
                scope.IsSaving = false;
                scope.IsLoading = false;
                alert("You must select an image.");
            }
        }
                                
        removePlan(item) {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;

            TKWApp.Data.DataManager.Collections["BuildingPlans"].delete(item.Id).then(function (data) {
            }, function (succes) {
                if (succes.status === 200) {
                    (<any>scope.CurrentBuilding).BuildingPlans.splice((<any>scope.CurrentBuilding).BuildingPlans.indexOf(item), 1);
                    (<any>scope).bindFolderViewFiles(scope.CurrentBuilding, "Views");
                    scope.$apply();
                }
                else {
                    alert(JSON.stringify(succes));
                }
            }
                , function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
        }

        createNewDisasterInfo() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = false;
            scope.AddDisasterInfoModel = new RapApp.Models.BuildDisasterInfoUploadModel(
                <HTMLInputElement>document.getElementById("fuDisasterInfo"),
                <HTMLImageElement>document.getElementById("fuDisasterInfoPreview")
            );
            scope.AddDisasterInfoModel.Description = "Disaster Info description";
            scope.AddDisasterInfoModel.BuildingId = scope.CurrentBuilding.Id;
            scope.AddDisasterInfoModel.DisasterInfoName = "";
            scope.AddDisasterInfoModel.DisasterInfoDescription = "";

            scope.AddDisasterInfoModel.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuDisasterInfo"),
                <HTMLImageElement>document.getElementById("fuDisasterInfoPreview")
            );
        }

        removeDisasterInfo(item) {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;

            TKWApp.Data.DataManager.Collections["BuildingDisasterInfos"].delete(item.Id).then(function (data) {

            }, function (success) {
                scope.CurrentBuilding.BuildingDisasterInfos.splice(scope.CurrentBuilding.BuildingDisasterInfos.indexOf(item), 1);
                (<any>scope).bindFolderViewFiles(scope.CurrentBuilding, "Disaster Infos");
                scope.$apply();
                (<any>jQuery("#deleteSiteSuccess")).click();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }

        saveNewDisasterInfo() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            if (scope.AddDisasterInfoModel.Uploader.files.length > 0) {
                var uploadUrl: string = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingDisasterInfo/Post";
                var files = scope.AddDisasterInfoModel.Uploader.files;
                for (var i = 0; i < files.length; i++) {
                    var progress: TKWApp.Services.OperationProgress = scope.AddDisasterInfoModel.Uploader.uploadFile(scope.AddDisasterInfoModel.Uploader.files[i],
                        uploadUrl,
                        {
                            Name: scope.AddDisasterInfoModel.Uploader.files[i].name,
                            Description: scope.AddDisasterInfoModel.Description,
                            BuildingId: scope.AddDisasterInfoModel.BuildingId,
                            Title: scope.AddDisasterInfoModel.DisasterInfoName,
                            DisasterInfoDescription: scope.AddDisasterInfoModel.DisasterInfoDescription
                        });
                    progress.progress((args) => {
                    });
                    progress.finished(() => {
                        scope.IsSaving = false;
                        // reload building
                        (<BuildingController>(<any>scope).Controller).loadBuilding(scope.CurrentBuilding.Id);
                        // close the modal
                        (<any>jQuery("#add_building_disaster_info")).modal("hide");
                        (<any>jQuery("#saveSiteSuccess")).click();
                    });
                    progress.error((err) => {
                        scope.IsSaving = false;

                        (<any>jQuery("#saveSiteFailure")).click();
                    });
                }
            }
            else {
                scope.IsSaving = false;
                alert("You must select a disaster information file.");
            }
        }

        editDisasterInfo() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            scope.IsSaving = true;
            TKWApp.Data.DataManager.Collections["BuildingDisasterInfos"].update(scope.EditMetaDataFile).then(function (data) {
                // add the new item to the list
                scope.IsSaving = false;
                scope.$apply();
                // close the modal dialog
                (<any>jQuery("#edit_building_disaster_info")).modal("hide");
                (<any>jQuery("#saveSiteSuccess")).click();
            }, function (error) {
                scope.IsSaving = false;
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }

        getPlanUrl(planId) {
            var url = TKWApp.HardRouting.ApplicationRoutes.Routes["Plan"];
            url += "?id=" + planId;
            return url;
        }

        //START COPY SITE METHODS
        copy() {
            var scope: any = <any>this;
            scope.IsLoading = true;
            TKWApp.Data.DataManager.Collections["Buildings"].edit(scope.SiteClone, "Clone").then(function (data) {
                window.location.href = "site?id=" + data.Id;
            }, function (error) {
                scope.IsSaving = false;
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }

        checkImageInClone(item) {
            var scope: any = <any>this;
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
        }

        checkPlanInClone(item) {
            var scope: any = <any>this;
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
        }

        checkPriceInClone(item) {
            var scope: any = <any>this;
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
        }

        checkContactInClone(item) {
            var scope: any = <any>this;
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
        }

        checkFilesInClone(item) {
            var scope: any = <any>this;
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
        }

        checkDisasterInfoInClone(item) {
            var scope: any = <any>this;
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
        }

        checkFileBox() {
            if (this.isLoadingFromFile)
                this.isLoadingFromFile = false;
            else
                this.isLoadingFromFile = true;
        }

        isFileCheckBoxSelected() {
            return this.isLoadingFromFile;
        }

        //START FOLDER VIEW
        bindFolderViewFiles(builing: any, expandedName: any) {
            var self = this;
            var data = builing;
            var dt = [];
            var it: RapApp.Models.IBuildingFolder = {
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
            for (var i = 0; i < (<any>data).BuildingFolders.length; i++) {
                if ((<any>data).BuildingFolders[i].Name == expandedName) {
                    (<any>data).BuildingFolders[i].expanded = true;
                }
                it.items.push((<any>data).BuildingFolders[i]);
            }
            dt.push(it);
            if (self.$scope) {
                (<any>self.$scope).treeData = new kendo.data.HierarchicalDataSource({ data: dt });
            }
            else {
                (<any>self).treeData = new kendo.data.HierarchicalDataSource({ data: dt });
            }
        }

        getFileFolderLink(fi: any) {
            if (fi.type == 2) {
                var fileLink = fi.ContentPath;
                return fileLink;
            }
            else
                return "";
        }

        foldActAdd() {
            var self: any = <any>this;
            (<any>self.$parent).FolderName = "";
            var item = (<any>this).SelectedFile;
            if (item.type == 0) {
                (<any>jQuery("#tree_info_add_folder")).modal("show");
            }
        }

        createFolder() {
            var self: any = <any>this;
            var item = (<any>this).SelectedFile;
            var url = "/CreateFolder";
            url = url + "?buildingId=" + item.BuildingId;
            url = url + "&rootFolder=" + item.ContentPath;
            url = url + "&folderName=" + self.FolderName;
            TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then((data) => {
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
        }

        foldActAddFile() {
            //var self: any = <any>this;
            //self.Controller.Uploader = new TKWApp.Services.FileUploader();
            //self.Controller.Uploader.registerUploader(<HTMLInputElement>document.getElementById("fuFolderFile"));
            //self.Controller.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuFolderFile"), <HTMLImageElement>document.getElementById("fuFolderFile"));
            //(<any>jQuery("#tree_info_add_file")).modal("show");
        }

        createFile() {
            var self: any = <any>this;
            self.IsSaving = true;
            var item = self.SelectedFile;
            if (self.Controller.Uploader.files && self.Controller.Uploader.files.length == 1) {
                // upload the pdf
                var url = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/FileManager/AddFileToFolder";
                var operationProgress: TKWApp.Services.OperationProgress = self.Controller.Uploader.uploadFile(self.Controller.Uploader.files[0], url, {
                    "rootPath": item.ContentPath,
                    "fileName": self.Controller.Uploader.files[0].name,
                });
                operationProgress.finished((response) => {
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
                operationProgress.error(() => {
                });
            }
            else {
                alert("You must select a PDF file to be uploaded.");
            }
        }

        removeFileFolder(fi: any) {
            if (confirm("Confirm action?")) {
                var self: any = <any>this;
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

                    TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then((success) => {
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
        }

        removeFolder(fi: any) {
            if (confirm("Confirm action?")) {
                var self: any = <any>this;
                var data = self.$parent.CurrentBuilding;
                var url = "/RemoveDirectory";
                url = url + "?path=" + fi.ContentPath;
                url = url + "&id=" + data.Id;
                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then((success) => {
                    var itm = fi;
                    if (success == "root") {
                        for (var i = 0; i < data.BuildingFolders.length; i++) {
                            if (data.BuildingFolders[i].id == itm.id) {
                                data.BuildingFolders.splice(i, 1);
                                self.$parent.bindFolderViewFiles(data);
                                break;
                            }
                        };
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
        }
    }

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
}