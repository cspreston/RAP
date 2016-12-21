var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../typings/kendo/kendo-ui.d.ts" />
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var FileManagerController = (function (_super) {
            __extends(FileManagerController, _super);
            function FileManagerController($scope) {
                this.$scope = $scope;
                _super.call(this);
                this.isLoadingFromFile = false;
                $scope.Controller = this;
                this.SelectedFolder = null;
                this.FolderPermissions = [];
                this.SelectedFolderParents = [];
                this.SelectedPermissionFile = null;
                $scope.isInRole = true;
                if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Client Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Site Admin")) {
                    $scope.isInRole = false;
                }
                $scope.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                $scope.treeData = new kendo.data.HierarchicalDataSource();
                $scope.bindFolderViewFiles = this.bindFolderViewFiles;
                $scope.saveFile = this.saveFile;
                $scope.clickFolder = this.clickFolder;
                $scope.getFolderParents = this.getFolderParents;
                $scope.clickFolderDetail = this.clickFolderDetail;
                $scope.clickFolderNav = this.clickFolderNav;
                $scope.getItemFolderParents = this.getItemFolderParents;
                $scope.addFolder = this.addFolder;
                $scope.createFolder = this.createFolder;
                $scope.removeFolder = this.removeFolder;
                $scope.addFile = this.addFile;
                $scope.createFile = this.createFile;
                $scope.removeFile = this.removeFile;
                $scope.viewItemPermission = this.viewItemPermission;
                $scope.setItemPermission = this.setItemPermission;
                this.loadBuilding($scope.BuildingId);
            }
            FileManagerController.prototype.loadBuilding = function (id) {
                var _this = this;
                var self = this;
                this.$scope.IsLoading = true;
                var url = "/GetBuildingFolders";
                url = url + "?id=" + id;
                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("GET", url, null).then(function (data) {
                    self.$scope.CurrentBuilding = data;
                    self.bindFolderViewFiles(data, "");
                    var treeDts = self.$scope.treeData;
                    if (treeDts && treeDts.transport && treeDts.transport.data) {
                        self.$scope.SelectedFolder = treeDts.transport.data[0];
                        self.$scope.SelectedFolder.items = treeDts.transport.data[0].items;
                        self.$scope.SelectedFolderParents = [];
                    }
                    _this.$scope.IsLoading = false;
                    self.$scope.$apply();
                }, function (error) {
                    alert(JSON.stringify(error));
                });
            };
            FileManagerController.prototype.bindFolderViewFiles = function (builing, expandedName) {
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
            FileManagerController.prototype.clickFolder = function (item) {
                var self = this;
                if (item.type > 1)
                    return;
                if (item.type == 0 && !item.IsBucket) {
                    self.$parent.IsLoading = true;
                    self.$parent.SelectedFolder = item;
                    var parentItem = self.$parent.SelectedFolder.parentNode();
                    if (parentItem)
                        self.$parent.SelectedFolder.ParentName = parentItem.Name;
                    else
                        self.$parent.SelectedFolder.ParentName = null;
                    self.$parent.SelectedFolder.items = item.children.transport.data.items;
                    self.$parent.IsLoading = false;
                }
                else {
                    self.$parent.SelectedFolder.items.push(item);
                }
                self.$parent.SelectedFolderParents = [];
                self.$parent.getFolderParents(item);
                self.$parent.SelectedFolderParents.reverse();
            };
            FileManagerController.prototype.getFolderParents = function (item) {
                var self = this;
                if (item.parentNode()) {
                    this.SelectedFolderParents.push(item.parentNode());
                    this.getFolderParents(item.parentNode());
                }
            };
            ;
            FileManagerController.prototype.clickFolderDetail = function (item) {
                var self = this;
                if (item.type == 0 && !item.IsBucket) {
                    self.$parent.IsLoading = true;
                    self.$parent.SelectedFolderParents.push(self.$parent.SelectedFolder);
                    var paName = self.$parent.SelectedFolder.Name;
                    self.$parent.SelectedFolder = item;
                    self.$parent.SelectedFolder.ParentName = paName;
                    var items = item.items;
                    if (items.length > 0) {
                        self.$parent.SelectedFolder.items = items;
                    }
                    else if (item.children) {
                        self.$parent.SelectedFolder.items = item.children.transport.data.items;
                    }
                    self.$parent.IsLoading = false;
                }
            };
            FileManagerController.prototype.clickFolderNav = function (item) {
                var self = this;
                if (item.type == 0 && !item.IsBucket) {
                    self.$parent.IsLoading = true;
                    var t = self.$parent.SelectedFolderParents.length;
                    while (t > 0) {
                        var it = self.$parent.SelectedFolderParents[t - 1];
                        if (it.id != item.id) {
                            self.$parent.SelectedFolderParents.splice(t - 1, 1);
                            t--;
                        }
                        else {
                            self.$parent.SelectedFolderParents.splice(t - 1, 1);
                            break;
                        }
                    }
                    self.$parent.SelectedFolder = item;
                    var items = item.items;
                    if (items.length > 0) {
                        self.$parent.SelectedFolder.items = items;
                    }
                    else if (item.children) {
                        self.$parent.SelectedFolder.items = item.children.transport.data.items;
                    }
                    self.$parent.IsLoading = false;
                }
            };
            FileManagerController.prototype.getItemFolderParents = function (item) {
                var self = this;
                if (item.items) {
                    for (var i = 0; i < item.items.length; i++) {
                        if (item.items[i].type == 0) {
                            this.SelectedFolderParents.push(item.items[i]);
                            this.getItemFolderParents(item.items[i]);
                        }
                    }
                }
            };
            ;
            FileManagerController.prototype.addFolder = function () {
                var self = this;
                self.FolderName = "";
                jQuery("#tree_info_add_folder").modal("show");
            };
            FileManagerController.prototype.createFolder = function () {
                var self = this;
                var item = this.SelectedFolder;
                var url = "/CreateFolder";
                url = url + "?buildingId=" + item.BuildingId;
                url = url + "&rootFolder=" + item.ContentPath;
                url = url + "&folderName=" + self.FolderName;
                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then(function (data) {
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
            };
            FileManagerController.prototype.removeFolder = function (fi) {
                if (confirm("Confirm action?")) {
                    var self = this;
                    var data = self.$parent.CurrentBuilding;
                    var url = "/RemoveDirectory";
                    url = url + "?path=" + fi.ContentPath;
                    url = url + "&id=" + data.Id;
                    TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then(function (success) {
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
            };
            FileManagerController.prototype.viewItemPermission = function (fi) {
                var self = this;
                self.$parent.FolderPermissions = [];
                self.$parent.Recursive = false;
                self.$parent.SelectedPermissionFile = fi;
                var data = self.$parent.CurrentBuilding;
                var url = "/GetFolderPermission";
                url = url + "?path=" + fi.ContentPath;
                url = url + "&id=" + data.Id;
                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("GET", url, null).then(function (success) {
                    self.$parent.FolderPermissions = success;
                    self.$apply();
                    jQuery("#tree_info_permission").modal("show");
                }, function (succes) {
                });
            };
            FileManagerController.prototype.setItemPermission = function () {
                var self = this;
                self.IsLoading = true;
                var url = "/SetPermission?recursive=" + self.Recursive;
                //var postData = [];
                //for (var i = 0; i < self.FolderPermissions.length; i++) {
                //    if (self.FolderPermissions[i].IsViewer)
                //        postData.push(self.FolderPermissions[i]);
                //}
                TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, { "": self.FolderPermissions }).then(function (success) {
                }, function (success) {
                    jQuery("#tree_info_permission").modal("hide");
                    if (success.status == 200) {
                        self.FolderPermissions = [];
                        self.IsLoading = false;
                        self.$apply();
                        jQuery("#saveSuccess").click();
                    }
                    else {
                        jQuery("#saveFailure").click();
                    }
                }), function (error) {
                    self.IsLoading = false;
                    jQuery("#saveFailure").click();
                    self.$apply();
                };
            };
            FileManagerController.prototype.addFile = function () {
                var self = this;
                self.Controller.Uploader = new TKWApp.Services.FileUploader();
                self.Controller.Uploader.registerUploader(document.getElementById("fuFolderFile"));
                self.Controller.Uploader.clearImagePreview(document.getElementById("fuFolderFile"), document.getElementById("fuFolderFile"));
                jQuery("#tree_info_add_file").modal("show");
            };
            FileManagerController.prototype.createFile = function () {
                var self = this;
                self.IsSaving = true;
                self.IsLoading = true;
                var item = self.SelectedFolder;
                if (self.Controller.Uploader.files && self.Controller.Uploader.files.length == 1) {
                    // upload the pdf
                    var url = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/FileManager/AddFileToFolder";
                    var operationProgress = self.Controller.Uploader.uploadFile(self.Controller.Uploader.files[0], url, {
                        "rootPath": item.ContentPath,
                        "fileName": self.Controller.Uploader.files[0].name,
                    });
                    operationProgress.finished(function (response) {
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
                    operationProgress.error(function () {
                        self.IsLoading = false;
                    });
                }
                else {
                    self.IsLoading = false;
                    alert("You must select a file to be uploaded.");
                }
            };
            FileManagerController.prototype.saveFile = function (fi) {
                if (fi.type == 2) {
                    var fileLink = fi.ContentPath;
                    return fileLink;
                }
                else
                    return "";
            };
            FileManagerController.prototype.removeFile = function (fi) {
                if (confirm("Confirm action?")) {
                    var self = this;
                    var data = self.$parent.CurrentBuilding;
                    var url = "/RemoveFile";
                    url = url + "?path=" + fi.ContentPath;
                    url = url + "&id=" + data.Id;
                    TKWApp.Data.DataManager.getFunction("FileManager").executeMethod("POST", url, null).then(function (success) {
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
            };
            return FileManagerController;
        })(Controllers.BaseController);
        Controllers.FileManagerController = FileManagerController;
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
                        getFolders(sIts[i]);
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
//# sourceMappingURL=filemanager-controller.js.map