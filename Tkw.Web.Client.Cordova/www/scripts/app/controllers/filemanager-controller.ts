/// <reference path="../../typings/kendo/kendo-ui.d.ts" />
module RapApp.Controllers {
    export class FileManagerController extends BaseController {
        public $scope: RapApp.Models.ISingleBuilding;
        public isLoadingFromFile: boolean;
        public SelectedFolder: RapApp.Models.IBuildingFolder;
        public SelectedFolderParents: Array<RapApp.Models.IBuildingFolder>;
        public FolderPermissions: any;
        public SelectedPermissionFile: any;
        constructor($scope: Models.ISingleBuilding) {
            this.$scope = $scope;
            super();
            this.isLoadingFromFile = false;
            (<any>$scope).Controller = this;
            this.SelectedFolder = null;
            this.FolderPermissions = [];
            this.SelectedFolderParents = [];
            this.SelectedPermissionFile = null;
            (<any>$scope).isInRole = true;
            if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Client Admin") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Site Admin")) {
                (<any>$scope).isInRole = false;
            }

            $scope.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            (<any>$scope).treeData = new kendo.data.HierarchicalDataSource();
            (<any>$scope).bindFolderViewFiles = this.bindFolderViewFiles;
            (<any>$scope).saveFile = this.saveFile;
            (<any>$scope).clickFolder = this.clickFolder;
            (<any>$scope).getFolderParents = this.getFolderParents;

            (<any>$scope).clickFolderDetail = this.clickFolderDetail;
            (<any>$scope).clickFolderNav = this.clickFolderNav;
            (<any>$scope).getItemFolderParents = this.getItemFolderParents;


            (<any>$scope).addFolder = this.addFolder;
            (<any>$scope).createFolder = this.createFolder;
            (<any>$scope).removeFolder = this.removeFolder;

            (<any>$scope).addFile = this.addFile;
            (<any>$scope).createFile = this.createFile;
            (<any>$scope).removeFile = this.removeFile;

            (<any>$scope).viewItemPermission = this.viewItemPermission;
            (<any>$scope).setItemPermission = this.setItemPermission;

            this.loadBuilding($scope.BuildingId);
        }

        loadBuilding(id) {
            var self = this;
            this.$scope.IsLoading = true;
            var url = "/GetBuildingFolders";
            url = url + "?id=" + id;
            TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("GET", url, null).then((data) => {
                (<any>self).$scope.CurrentBuilding = data;
                self.bindFolderViewFiles(data, "");
                var treeDts = (<any>self).$scope.treeData;
                if (treeDts && treeDts.transport && treeDts.transport.data) {
                    (<any>self).$scope.SelectedFolder = treeDts.transport.data[0];
                    (<any>self).$scope.SelectedFolder.items = treeDts.transport.data[0].items;
                    (<any>self).$scope.SelectedFolderParents = [];
                }
                this.$scope.IsLoading = false;
                self.$scope.$apply();
            }, function (error) {
                alert(JSON.stringify(error));
            });
        }

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

        clickFolder(item: RapApp.Models.IBuildingFolder) {
            var self = this;
            if (item.type > 1)
                return;
            if (item.type == 0 && !(<any>item).IsBucket) {

                (<any>self).$parent.IsLoading = true;
                (<any>self).$parent.SelectedFolder = item;
                var parentItem = (<any>self).$parent.SelectedFolder.parentNode();
                if (parentItem)
                    (<any>self).$parent.SelectedFolder.ParentName = parentItem.Name;
                else
                    (<any>self).$parent.SelectedFolder.ParentName = null;
                (<any>self).$parent.SelectedFolder.items = (<any>item).children.transport.data.items;
                (<any>self).$parent.IsLoading = false;
            }
            else {
                (<any>self).$parent.SelectedFolder.items.push(item);
            }
            (<any>self).$parent.SelectedFolderParents = [];
            (<any>self).$parent.getFolderParents(item);
            (<any>self).$parent.SelectedFolderParents.reverse();
        }

        getFolderParents(item) {

            var self = this;
            if (item.parentNode()) {
                this.SelectedFolderParents.push(item.parentNode());
                this.getFolderParents(item.parentNode())
            }
        };

        clickFolderDetail(item: RapApp.Models.IBuildingFolder) {
            var self = this;
            if (item.type == 0 && !(<any>item).IsBucket) {

                (<any>self).$parent.IsLoading = true;
                (<any>self).$parent.SelectedFolderParents.push((<any>self).$parent.SelectedFolder);
                var paName = (<any>self).$parent.SelectedFolder.Name;
                (<any>self).$parent.SelectedFolder = item;
                (<any>self).$parent.SelectedFolder.ParentName = paName;
                var items = (<any>item).items;
                if (items.length > 0) {
                    (<any>self).$parent.SelectedFolder.items = items;
                }
                else if ((<any>item).children) {
                    (<any>self).$parent.SelectedFolder.items = (<any>item).children.transport.data.items;
                }
                (<any>self).$parent.IsLoading = false;
            }
        }

        clickFolderNav(item: RapApp.Models.IBuildingFolder) {
            var self = this;
            if (item.type == 0 && !(<any>item).IsBucket) {

                (<any>self).$parent.IsLoading = true;
                var t = (<any>self).$parent.SelectedFolderParents.length;
                while (t > 0) {
                    var it = (<any>self).$parent.SelectedFolderParents[t - 1];
                    if (it.id != item.id) {
                        (<any>self).$parent.SelectedFolderParents.splice(t - 1, 1);
                        t--;
                    }
                    else {
                        (<any>self).$parent.SelectedFolderParents.splice(t - 1, 1);
                        break;
                    }
                }
                (<any>self).$parent.SelectedFolder = item;
                var items = (<any>item).items;
                if (items.length > 0) {
                    (<any>self).$parent.SelectedFolder.items = items;
                }
                else if ((<any>item).children) {
                    (<any>self).$parent.SelectedFolder.items = (<any>item).children.transport.data.items;
                }
                (<any>self).$parent.IsLoading = false;
            }
        }

        getItemFolderParents(item) {
            var self = this;
            if (item.items) {
                for (var i = 0; i < item.items.length; i++) {
                    if (item.items[i].type == 0) {
                        this.SelectedFolderParents.push(item.items[i]);
                        this.getItemFolderParents(item.items[i])
                    }
                }
            }
        };

        addFolder() {
            var self: any = <any>this;
            (<any>self).FolderName = "";
            (<any>jQuery("#tree_info_add_folder")).modal("show");
        }

        createFolder() {
            var self: any = <any>this;
            var item = (<any>this).SelectedFolder;
            var url = "/CreateFolder";
            url = url + "?buildingId=" + item.BuildingId;
            url = url + "&rootFolder=" + item.ContentPath;
            url = url + "&folderName=" + self.FolderName;
            TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then((data) => {
                if (self.SelectedFolder.id != "root") {
                    var bFolders = self.CurrentBuilding.BuildingFolders;
                    for (var i = 0; i < bFolders.length; i++) {
                        var folder = getFolder(bFolders[i], self.SelectedFolder.id);
                        if (folder) {
                            folder.items.push(data);
                            self.bindFolderViewFiles(self.CurrentBuilding, folder.Name);
                            break;
                        }
                    }
                }
                else {
                    self.CurrentBuilding.BuildingFolders.push(data);
                    self.SelectedFolder.items.push(data);
                    self.bindFolderViewFiles(self.CurrentBuilding);
                }
                self.$apply();
            }, function (error) {
                alert(JSON.stringify(error.responseJSON.Message));
            });
        }

        removeFolder(fi) {
            if (confirm("Confirm action?")) {
                var self: any = <any>this;
                var data = self.$parent.CurrentBuilding;
                var url = "/RemoveDirectory";
                url = url + "?path=" + fi.ContentPath;
                url = url + "&id=" + data.Id;
                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then((success) => {
                    var itm = fi;
                    for (var v = 0; v < self.SelectedFolder.items.length; v++) {
                        if (self.SelectedFolder.items[v].id == fi.id) {
                            self.SelectedFolder.items.splice(v, 1);
                            break;
                        }
                    }
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
                                self.$parent.bindFolderViewFiles(data);
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

        viewItemPermission(fi) {
            var self: any = <any>this;
            self.$parent.FolderPermissions = [];
            self.$parent.Recursive = false;
            self.$parent.SelectedPermissionFile = fi;
            var data = self.$parent.CurrentBuilding;
            var url = "/GetFolderPermission";
            url = url + "?path=" + fi.ContentPath;
            url = url + "&id=" + data.Id;
            TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("GET", url, null).then((success) => {
                self.$parent.FolderPermissions = success;
                self.$apply();
                (<any>jQuery("#tree_info_permission")).modal("show");
            }, function (succes) {
            });
        }

        setItemPermission() {
            var self: any = <any>this;
            self.IsLoading = true;
            var url = "/SetPermission?recursive=" + self.Recursive;
            //var postData = [];
            //for (var i = 0; i < self.FolderPermissions.length; i++) {
            //    if (self.FolderPermissions[i].IsViewer)
            //        postData.push(self.FolderPermissions[i]);
            //}
            TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, { "": self.FolderPermissions }).then((success) => {
            }, function (success) {
                (<any>jQuery("#tree_info_permission")).modal("hide");
                if (success.status == 200) {
                    self.FolderPermissions = [];
                    self.IsLoading = false;
                    self.$apply();
                    (<any>jQuery("#saveSuccess")).click();
                }
                else {
                    (<any>jQuery("#saveFailure")).click();
                }
            }), function (error) {
                self.IsLoading = false;
                (<any>jQuery("#saveFailure")).click();
                self.$apply();
            };
        }

        addFile() {
            var self: any = <any>this;
            self.Controller.Uploader = new TKWApp.Services.FileUploader();
            self.Controller.Uploader.registerUploader(<HTMLInputElement>document.getElementById("fuFolderFile"));
            self.Controller.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuFolderFile"), <HTMLImageElement>document.getElementById("fuFolderFile"));
            (<any>jQuery("#tree_info_add_file")).modal("show");
        }

        createFile() {
            var self: any = <any>this;
            self.IsSaving = true;
            self.IsLoading = true;
            var item = self.SelectedFolder;
            if (self.Controller.Uploader.files && self.Controller.Uploader.files.length == 1) {
                // upload the pdf
                var url = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/FileManager/AddFileToFolder";
                var operationProgress: TKWApp.Services.OperationProgress = self.Controller.Uploader.uploadFile(self.Controller.Uploader.files[0], url, {
                    "rootPath": item.ContentPath,
                    "fileName": self.Controller.Uploader.files[0].name,
                });
                operationProgress.finished((response) => {
                    self.SelectedFolder.items.push(JSON.parse(response));
                    var bFolders = self.CurrentBuilding.BuildingFolders;
                    for (var i = 0; i < bFolders.length; i++) {
                        var folder = getFolder(bFolders[i], self.SelectedFolder.id);
                        if (folder) {
                            folder.items.push(JSON.parse(response));
                            self.bindFolderViewFiles(self.CurrentBuilding, folder.Name);
                            break;
                        }
                    }
                    self.IsLoading = false;
                    self.$apply();
                });
                operationProgress.error(() => {
                    self.IsLoading = false;
                });
            }
            else {
                self.IsLoading = false;
                alert("You must select a file to be uploaded.");
            }
        }

        saveFile(fi: any) {
            if (fi.type == 2) {
                var fileLink = fi.ContentPath;
                return fileLink;
            }
            else
                return "";
        }

        removeFile(fi) {
            if (confirm("Confirm action?")) {
                var self: any = <any>this;
                var data = self.$parent.CurrentBuilding;

                var url = "/RemoveFile";
                url = url + "?path=" + fi.ContentPath;
                url = url + "&id=" + data.Id;

                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then((success) => {
                    var itm = fi;
                    var fInfos = data.BuildingFolders;
                    for (var v = 0; v < self.SelectedFolder.items.length; v++) {
                        if (self.SelectedFolder.items[v].id == fi.id) {
                            self.SelectedFolder.items.splice(v, 1);
                            break;
                        }
                    }
                    for (var i = 0; i < fInfos.length; i++) {
                        var folder = getFolderbyPath(fInfos[i], success);
                        if (folder) {
                            for (var t = 0; t <= folder.items.length; t++) {
                                if (folder.items[t].id == fi.id) {
                                    folder.items.splice(t, 1);
                                    break;
                                }
                            }
                            self.$parent.bindFolderViewFiles(data);
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

    function getFolders(item) {
        var sIts = item.items;
        if (sIts) {
            for (var i = 0; i < sIts.length; i++) {
                if (sIts[i].type != 0) {
                    item.items.splice(i, 1);
                }
                else {
                    getFolders(sIts[i])
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