var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var PlanController = (function (_super) {
            __extends(PlanController, _super);
            // initializes the controller
            function PlanController($scope) {
                var _this = this;
                this.$scope = $scope;
                _super.call(this);
                this.ZoomLevel = 1;
                this.CanvasScale = 1;
                this.ScaleFactor = 1.2;
                this.$scope.HotspotActionTypes = [];
                this.$scope.HotspotDisplayTypes = [];
                this.$scope.CurrentPlanHotspots = [];
                this.$scope.FilteredPlanHotspots = [];
                this.$scope.PinnedLineColor = "#000000";
                this.$scope.PinnedLineSize = 3;
                this.$scope.Colors = [
                    { id: "#000000", name: 'Black' },
                    { id: "#008000", name: 'Green' },
                    { id: "#ff0000", name: 'Red' },
                    { id: "#0000ff", name: 'Blue' },
                    { id: "#ffff00", name: 'Yellow' },
                    { id: "#ffffff", name: 'White' }
                ];
                this.$scope.selectedTextColor = this.$scope.Colors[0];
                this.$scope.selectedBgColor = this.$scope.Colors[5];
                this.$scope.TextAlignments = ['Left', 'Center', 'Right', 'Justify'];
                this.$scope.selectedTextAlignment = this.$scope.TextAlignments[0];
                this.$scope.HotspotPoints = [];
                this.$scope.PinHotspots = [];
                this.$scope.IsPinAction = false;
                this.$scope.IsUnPinAction = false;
                this.$scope.HideEditSpot = false;
                this.$scope.DeleteSpotText = "Delete Spot";
                this.hashPinedHashTable = {};
                this.hashPinedLineTable = {};
                this.hashPinedLineTable2 = {};
                $scope.isInRole = true;
                if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                    $scope.isInRole = false;
                }
                // add scope functions
                this.$scope.toggleEditMode = this.toggleEditMode;
                this.$scope.getHotspotDisplayTypeImage = this.getHotspotDisplayTypeImage;
                this.$scope.hotspotDragging = this.hotspotDragging;
                this.$scope.hotspotDropped = this.hotspotDropped;
                this.$scope.deleteSelectedSpot = this.deleteSelectedSpot;
                this.$scope.editSelectedHotspot = this.editSelectedHotspot;
                this.$scope.updateSelectedHotspot = this.updateSelectedHotspot;
                this.$scope.getSpotFileUrl = this.getSpotFileUrl;
                this.$scope.getSpotFileType = this.getSpotFileType;
                this.$scope.isSpotFileType = this.isSpotFileType;
                this.$scope.removeHotspotFile = this.removeHotspotFile;
                this.$scope.loadOtherPlans = this.loadOtherPlans;
                this.$scope.loadDetails = this.loadDetails;
                this.$scope.editPlanDetails = this.editPlanDetails;
                this.$scope.getSelectedHotspot = this.getSelectedHotspot;
                this.$scope.getLastPinHotspot = this.getLastPinHotspot;
                this.$scope.setPin = this.setPin;
                this.$scope.reloadSetPin = this.reloadSetPin;
                this.$scope.undoPin = this.undoPin;
                this.$scope.getPlanImage = this.getPlanImage;
                this.$scope.reloadPlan = this.reloadPlan;
                this.$scope.refreshPlan = this.refreshPlan;
                this.$scope.hotspotActionTypeAllowsAttachment = this.hotspotActionTypeAllowsAttachment;
                this.$scope.growCanvas = function () {
                    _this.CanvasScale = _this.CanvasScale * _this.ScaleFactor;
                    _this.ZoomLevel /= 1.2;
                    var objects = _this.canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;
                        var tempScaleX = scaleX * _this.ScaleFactor;
                        var tempScaleY = scaleY * _this.ScaleFactor;
                        var tempLeft = left * _this.ScaleFactor;
                        var tempTop = top * _this.ScaleFactor;
                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;
                        objects[i].setCoords();
                    }
                    var orgImg = _this.canvas.backgroundImage;
                    orgImg.width = orgImg.width * _this.ScaleFactor;
                    orgImg.height = orgImg.height * _this.ScaleFactor;
                    _this.canvas.setBackgroundImage(orgImg, null);
                    _this.canvas.setWidth(orgImg.width);
                    _this.canvas.setHeight(orgImg.height);
                    _this.canvas.renderAll();
                    $("#respondCanvas").attr("style", "margin-right:20px");
                };
                this.$scope.shrinkCanvas = function () {
                    _this.ZoomLevel *= 1.2;
                    _this.CanvasScale = _this.CanvasScale / _this.ScaleFactor;
                    var objects = _this.canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;
                        var tempScaleX = scaleX * (1 / _this.ScaleFactor);
                        var tempScaleY = scaleY * (1 / _this.ScaleFactor);
                        var tempLeft = left * (1 / _this.ScaleFactor);
                        var tempTop = top * (1 / _this.ScaleFactor);
                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;
                        objects[i].setCoords();
                    }
                    var orgImg = _this.canvas.backgroundImage;
                    orgImg.width = orgImg.width * (1 / _this.ScaleFactor);
                    orgImg.height = orgImg.height * (1 / _this.ScaleFactor);
                    _this.canvas.setBackgroundImage(orgImg, null);
                    _this.canvas.setWidth(orgImg.width);
                    _this.canvas.setHeight(orgImg.height);
                    _this.canvas.renderAll();
                };
                this.$scope.reset = function () {
                };
                this.$scope.nextActiveFile = function () {
                    if ($scope.ActiveHotspot)
                        $scope.ActiveHotspot.nextActiveFile();
                };
                this.$scope.prevActiveFile = function () {
                    if ($scope.ActiveHotspot)
                        $scope.ActiveHotspot.prevActiveFile();
                };
                this.$scope.navigateToPlan = function (view) {
                    if (view.Id != $scope.CurrentPlan.Id) {
                        _this.navigateUrl('Plan', view.Id);
                    }
                };
                this.$scope.editPlan = function (id) {
                    _this.navigateUrl('PlanEdit', id);
                };
                // initialize scope
                $scope.Controller = this;
                $scope.DefaultPlanImage = "./Content/Images/default-plan.jpg";
                $scope.DefaultSpotImage = "./Content/Images/default-plan.jpg";
                // get the current plan id
                this.PlanId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                this.$scope.PlanId = this.PlanId;
                $scope.EditMode = true;
                // load current plan
                this.$scope.loadPlan = this.loadPlan;
                this.loadPlan(this.PlanId);
                var w = angular.element($(window));
                w.bind('resize', function () {
                    //(<any>$scope).reloadPlan();
                });
                this.$scope.PressedHp = null;
                this.$scope.HasPressedHp = false;
                this.$scope.pressHp = this.pressHp;
                this.$scope.dropHp = this.dropHp;
                //customise lines 
                this.$scope.customizePinedObjects = this.customizePinedObjects;
                this.$scope.updatePinedObjectCustomProperties = this.updatePinedObjectCustomProperties;
                this.$scope.customizeObject = this.customizeObject;
                this.$scope.updateCustomizeObject = this.updateCustomizeObject;
                $scope.Filter = false;
                //filter icon
                this.$scope.filter = function () {
                    if ($scope.Filter) {
                        $scope.Filter = false;
                        fabric.Object.prototype.selectable = true;
                        _this.$scope.FilteredPlanHotspots = [];
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.visible = true;
                        });
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.renderAll();
                        var selected = $(".spot-touched");
                        for (var j = 0; j < selected.length; j++) {
                            jQuery(selected[j]).removeClass("spot-touched");
                        }
                    }
                    else {
                        jQuery("#filter-icons").modal("show");
                        $scope.Filter = true;
                    }
                };
                this.$scope.filterIcon = this.filterIcon;
            }
            PlanController.prototype.filterIcon = function ($event, spotDisplayType) {
                var scope = this;
                var self = scope.Controller;
                var hp = null;
                var ids = [];
                var beaconuuIds = [];
                var elem = document.getElementById(spotDisplayType.Id);
                if (jQuery(elem).hasClass("spot-touched")) {
                    for (var k = 0; k < $(".spot-touched").length; k++) {
                        for (var j = 0; j < self.$scope.FilteredPlanHotspots.length; j++) {
                            hp = self.$scope.FilteredPlanHotspots[j].Dto;
                            if (hp.HotspotDisplayTypeId == spotDisplayType.Id) {
                                ids.push(hp.Id);
                                self.$scope.FilteredPlanHotspots.splice(j, 1);
                            }
                        }
                    }
                    for (var k = 0; k < ids.length; k++) {
                        for (var v = 0; v < self.$scope.FilteredPlanHotspots.length; v++) {
                            if (self.$scope.FilteredPlanHotspots[v].Dto.BeaconuuId == ids[k]) {
                                beaconuuIds.push(self.$scope.FilteredPlanHotspots[v].Dto.BeaconuuId);
                            }
                        }
                    }
                    for (var k = 0; k < beaconuuIds.length; k++) {
                        for (var v = 0; v < self.$scope.FilteredPlanHotspots.length; v++) {
                            if (self.$scope.FilteredPlanHotspots[v].Dto.BeaconuuId == beaconuuIds[k]) {
                                self.$scope.FilteredPlanHotspots.splice(v, 1);
                            }
                        }
                    }
                    jQuery(elem).removeClass("spot-touched");
                }
                else {
                    jQuery(elem).addClass("spot-touched");
                    for (var t = 0; t < self.$scope.CurrentPlanHotspots.length; t++) {
                        if (self.$scope.CurrentPlanHotspots[t].Dto.HotspotDisplayTypeId == spotDisplayType.Id) {
                            hp = self.$scope.CurrentPlanHotspots[t].Dto;
                            self.$scope.FilteredPlanHotspots.push(self.$scope.CurrentPlanHotspots[t]);
                            for (var j = 0; j < self.$scope.CurrentPlanHotspots.length; j++) {
                                if (self.$scope.CurrentPlanHotspots[j].Dto.Id != hp.Id && self.$scope.CurrentPlanHotspots[j].Dto.BeaconuuId == hp.Id) {
                                    self.$scope.FilteredPlanHotspots.push(self.$scope.CurrentPlanHotspots[j]);
                                }
                            }
                        }
                    }
                }
                fabric.Object.prototype.selectable = true;
                self.canvas.forEachObject(function (element, index, arr) {
                    element.visible = false;
                });
                var obj = self.canvas.getObjects();
                for (var t = 0; t < obj.length; t++) {
                    for (var j = 0; j < self.$scope.FilteredPlanHotspots.length; j++) {
                        if (obj[t] == self.$scope.FilteredPlanHotspots[j].FabricJSObject) {
                            obj[t].visible = true;
                        }
                    }
                }
                if (jQuery('.spot-touched').length == 0) {
                    self.canvas.forEachObject(function (element, index, arr) {
                        element.visible = true;
                    });
                }
                self.canvas.forEachObject(function (element, index, arr) {
                    element.selectable = false;
                });
                self.canvas.renderAll();
            };
            PlanController.prototype.customizeObject = function () {
                var scope = this;
                var self = scope.Controller;
                var obj = self.getSelectedHotspot();
                if (obj) {
                    scope.SelectedHotspot = obj;
                    scope.SelectedHotspot.CustomProperties = {
                        LineColor: obj.DisplayDetails.Color,
                        CircleColor: obj.DisplayDetails.Color,
                        LineSize: obj.DisplayDetails.Size.width,
                        CircleSize: obj.DisplayDetails.Size.width,
                    };
                    jQuery("#customize-object").modal("show");
                }
            };
            PlanController.prototype.updateCustomizeObject = function () {
                debugger;
                var scope = this;
                var self = scope.Controller;
                var obj = self.getSelectedHotspot();
                var HotspotCustomPropertiesDto = {
                    "BeaconuuId": obj.Dto.Id,
                    "LineSize": obj.CustomProperties.LineSize,
                    "LineColor": obj.CustomProperties.LineColor,
                    "CircleSize": obj.CustomProperties.CircleSize,
                    "CircleColor": obj.CustomProperties.CircleColor
                };
                scope.PinnedLineColor = obj.CustomProperties.LineColor;
                scope.PinnedLineSize = obj.CustomProperties.LineSize;
                TKWApp.Data.DataManager.getFunction("UpdateHotpotDisplayDetail").execute(HotspotCustomPropertiesDto).then(function (data) {
                    var hps = scope.CurrentPlanHotspots;
                    for (var i = 0; i < hps.length; i++) {
                        if (hps[i].Dto.Id == data.Id) {
                            hps[i].Dto.DisplayDetails = data.DisplayDetails;
                            hps[i].DisplayDetails = JSON.parse(data.DisplayDetails);
                            scope.Controller.canvas.remove(hps[i].FabricJSObject);
                            hps[i].FabricJSObject = null;
                            scope.Controller.initFabricHotspot(hps[i]);
                            scope.Controller.canvas.renderAll();
                        }
                    }
                }, function (response) {
                });
            };
            PlanController.prototype.customizePinedObjects = function () {
                var scope = this;
                var self = scope.Controller;
                var obj = self.getSelectedHotspot();
                if (obj) {
                    scope.SelectedHotspot = obj;
                    var hps = scope.CurrentPlanHotspots;
                    var lineColor = "", circleColor = "", lineSize = 1, circleSize = 8;
                    if (hps) {
                        for (var i = 0; i < hps.length; i++) {
                            if (hps[i].Dto.BeaconuuId == obj.Dto.Id && hps[i].Dto.HotspotDisplayType.Type == 2) {
                                lineColor = hps[i].DisplayDetails.Color;
                                lineSize = hps[i].DisplayDetails.Size.width;
                                break;
                            }
                        }
                        for (var i = 0; i < hps.length; i++) {
                            if (hps[i].Dto.BeaconuuId == obj.Dto.Id && hps[i].Dto.HotspotDisplayType.Type == 3) {
                                circleColor = hps[i].DisplayDetails.Color;
                                circleSize = hps[i].DisplayDetails.Size.width;
                                break;
                            }
                        }
                    }
                    scope.SelectedHotspot.CustomProperties = {
                        LineColor: lineColor,
                        CircleColor: circleColor,
                        LineSize: lineSize,
                        CircleSize: circleSize,
                    };
                    jQuery("#customize-pined-objects").modal("show");
                }
            };
            PlanController.prototype.updatePinedObjectCustomProperties = function () {
                var scope = this;
                var self = scope.Controller;
                var obj = self.getSelectedHotspot();
                var HotspotCustomPropertiesDto = {
                    "BeaconuuId": obj.Dto.Id,
                    "LineSize": obj.CustomProperties.LineSize,
                    "LineColor": obj.CustomProperties.LineColor,
                    "CircleSize": obj.CustomProperties.CircleSize,
                    "CircleColor": obj.CustomProperties.CircleColor
                };
                scope.PinnedLineColor = obj.CustomProperties.LineColor;
                scope.PinnedLineSize = obj.CustomProperties.LineSize;
                TKWApp.Data.DataManager.getFunction("UpdateHotpotsDisplayDetails").execute(HotspotCustomPropertiesDto).then(function (data) {
                    if (data && data.length > 0) {
                        scope.IsLoading = true;
                        scope.$apply();
                        //localStorage.setItem("Reload", "true");
                        window.location.href = "/plan?id=" + scope.CurrentPlan.Id;
                        return;
                    }
                }, function (response) {
                });
            };
            PlanController.prototype.toggleEditMode = function () {
                var scope = this;
                var self = scope.Controller;
                //this is a hack to reload canvas
                if (self.canvas) {
                    if (localStorage.getItem("Reload")) {
                        scope.EditMode = false;
                        localStorage.removeItem("Reload");
                    }
                }
                // (<any>scope).reset();
                scope.EditMode = !scope.EditMode;
                if (scope.EditMode) {
                    $("#respondCanvas").css("border", "1px blue dotted");
                    // enable canvas object selection
                    fabric.Object.prototype.selectable = true;
                    if (self.canvas) {
                        self.canvas.forEachObject(function (o) {
                            if (o.get('type') != 'line' && o.get('type') != 'circle') {
                                o.selectable = true;
                            }
                        });
                        if (scope.CurrentPlanHotspots) {
                            var fObjs = self.canvas.getObjects();
                            for (var i = 0; i < scope.CurrentPlanHotspots.length; i++) {
                                if (!scope.CurrentPlanHotspots[i].Dto.BeaconuuId) {
                                    for (var k = 0; k < fObjs.length; k++) {
                                        if (fObjs[k] == scope.CurrentPlanHotspots[i].FabricJSObject) {
                                            fObjs[k].selectable = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (self.CanvasScale != 1) {
                            var fac = self.ZoomLevel;
                            self.ZoomLevel = 1;
                            var objects = self.canvas.getObjects();
                            for (var t in objects) {
                                var scaleX = objects[t].scaleX;
                                var scaleY = objects[t].scaleY;
                                var left = objects[t].left;
                                var top = objects[t].top;
                                var tempScaleX = scaleX * fac;
                                var tempScaleY = scaleY * fac;
                                var tempLeft = left * fac;
                                var tempTop = top * fac;
                                objects[t].scaleX = tempScaleX;
                                objects[t].scaleY = tempScaleY;
                                objects[t].left = tempLeft;
                                objects[t].top = tempTop;
                                objects[t].setCoords();
                            }
                            var orgImg = self.canvas.backgroundImage;
                            orgImg.width = orgImg.width * fac;
                            orgImg.height = orgImg.height * fac;
                            self.canvas.setBackgroundImage(orgImg, null);
                            self.canvas.setWidth(orgImg.width);
                            self.canvas.setHeight(orgImg.height);
                            self.canvas.renderAll();
                        }
                    }
                    scope.IsUnPinAction = false;
                    scope.PinAct = false;
                    scope.IsPinAction = false;
                    scope.HasSelectedSpot = false;
                }
                else {
                    $("#respondCanvas").css("border", "none");
                    // unselect selected object
                    if (self.canvas) {
                        fabric.Object.prototype.selectable = false;
                        self.canvas.forEachObject(function (o) {
                            o.selectable = false;
                        });
                        self.canvas.deactivateAll().renderAll();
                    }
                    $('#main').width('100%');
                    $('#sitekey').width('0%');
                    $('#sitekey').hide();
                    $("#sitekeyPoint").hide();
                }
            };
            PlanController.prototype.loadPlan = function (id) {
                var self = this;
                this.$scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].find(id).then(function (data) {
                    self.$scope.CurrentPlan = data;
                    self.$scope.BuildingId = data.BuildingId;
                    // init fabric
                    self.initFabric(function () {
                        // init hotspots
                        self.$scope.CurrentPlanHotspots = [];
                        for (var j = 0; j < data.Hotspots.length; j++) {
                            var hotspot = new RapApp.Models.Hotspot(data.Hotspots[j]);
                            self.$scope.CurrentPlanHotspots.push(hotspot);
                            // add to canvas
                            self.initFabricHotspot(hotspot);
                        }
                    });
                    if (self.canvas) {
                        fabric.Object.prototype.selectable = false;
                        self.canvas.forEachObject(function (o) {
                            o.selectable = false;
                        });
                    }
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                    // load hotspot display types, action types, and other plans
                    self.loadHotspotTypes();
                    //self.loadOtherPlans();
                    self.$scope.toggleEditMode();
                }, function (error) {
                    alert(JSON.stringify(error));
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                });
            };
            PlanController.prototype.reloadPlan = function () {
                var self = this;
                localStorage.setItem("Reload", "true");
                window.location.href = "/plan?id=" + self.Controller.PlanId;
            };
            PlanController.prototype.refreshPlan = function () {
                var self = this;
                window.location.href = "/plan?id=" + self.Controller.PlanId;
            };
            PlanController.prototype.loadOtherPlans = function () {
                var self = this;
                var query = new TKWApp.Data.Query();
                query.and().eq("BuildingId", self.BuildingId);
                TKWApp.Data.DataManager.Collections["BuildingPlans"].search(query).then(function (data) {
                    self.OtherViews = data;
                    self.$apply();
                    jQuery("#choose-view-modal").modal("show");
                }, function (success) {
                }, function (error) {
                    alert(JSON.stringify(error));
                });
            };
            PlanController.prototype.loadDetails = function () {
                var scope = this;
                scope.updatePlanInfo = jQuery.extend(true, {}, scope.CurrentPlan);
                jQuery("#edit-plan-info").modal("show");
            };
            PlanController.prototype.editPlanDetails = function () {
                var scope = this;
                scope.IsSaving = true;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].edit(scope.updatePlanInfo, "EditDetails").then(function (data) {
                }, function (success) {
                    if (success.status == 200) {
                        scope.CurrentPlan.Name = scope.updatePlanInfo.Name;
                        scope.CurrentPlan.Description = scope.updatePlanInfo.Description;
                        scope.IsSaving = false;
                        jQuery("#edit-plan-info").modal("hide");
                        scope.$apply();
                    }
                    else {
                        scope.IsSaving = false;
                        jQuery("#edit-plan-info").modal("hide");
                        jQuery("#saveSiteFailure").click();
                    }
                }, function (error) {
                    scope.IsSaving = false;
                    alert(JSON.stringify(error));
                    jQuery("#saveSiteFailure").click();
                });
            };
            PlanController.prototype.loadHotspotTypes = function () {
                var self = this;
                self.$scope.HotspotDisplayTypes = [];
                self.$scope.HotspotPoints = [];
                self.$scope.PinHotspots = [];
                TKWApp.Data.DataManager.Collections["HotspotDisplayTypes"].search(null).then(function (data) {
                    $.each(data, function (i, item) {
                        if (item.Type == 0) {
                            self.$scope.HotspotDisplayTypes.push(item);
                        }
                        else if (item.Type == 1) {
                            self.$scope.HotspotPoints.push(item);
                        }
                        else {
                            self.$scope.PinHotspots.push(item);
                        }
                    });
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                }, function (error) {
                    alert(JSON.stringify(error));
                });
                TKWApp.Data.DataManager.Collections["HotspotActionTypes"].search(null).then(function (data) {
                    self.$scope.HotspotActionTypes = data;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                }, function (error) {
                    alert(JSON.stringify(error));
                });
            };
            PlanController.prototype.getPlanImage = function (plan) {
                var fileLink = RapApp.FileUtils.getImageUrl(plan.PlanFile.BucketPath, plan.PlanFile.BucketName, plan.PlanFile.FileName);
                return fileLink;
            };
            PlanController.prototype.getSpotFileUrl = function (spotFile) {
                if (!spotFile)
                    return "";
                var fileLink = RapApp.FileUtils.getImageUrl(spotFile.BucketPath, spotFile.BucketName, spotFile.FileName);
                return fileLink;
            };
            PlanController.prototype.getSpotFileType = function (spotFile) {
                if (!spotFile)
                    return "";
                var type = RapApp.FileUtils.getFileType(spotFile.FileName);
                return type;
            };
            PlanController.prototype.isSpotFileType = function (spotFile, fType) {
                var type = RapApp.FileUtils.getFileType(spotFile.FileName) == fType;
                return type;
            };
            PlanController.prototype.getHotspotDisplayTypeImage = function (displayType) {
                return RapApp.FileUtils.getHotspotDisplayImage(displayType.FileName);
            };
            // Manage hotspots
            PlanController.prototype.createHotspot = function (displayType, posX, posY, width, height, color, posX1, posY1, posX2, posY2, bId, isPin) {
                if (color === void 0) { color = null; }
                if (posX1 === void 0) { posX1 = null; }
                if (posY1 === void 0) { posY1 = null; }
                if (posX2 === void 0) { posX2 = null; }
                if (posY2 === void 0) { posY2 = null; }
                if (bId === void 0) { bId = null; }
                if (isPin === void 0) { isPin = true; }
                // create a new hotspot with default values
                if (!displayType)
                    return;
                if (posX > 1) {
                    posX = posX / this.canvas.getWidth();
                }
                if (posY > 1) {
                    posY = posY / this.canvas.getHeight();
                }
                if (posX1 > 1) {
                    posX1 = posX1 / this.canvas.getWidth();
                }
                if (posY1 > 1) {
                    posY1 = posY1 / this.canvas.getHeight();
                }
                if (posX2 > 1) {
                    posX2 = posX2 / this.canvas.getWidth();
                }
                if (posY2 > 1) {
                    posY2 = posY2 / this.canvas.getHeight();
                }
                var displayDetails = {
                    Position: {
                        x: posX,
                        y: posY
                    },
                    Size: {
                        width: width,
                        height: height
                    },
                    Rotation: 0,
                    Color: color,
                    Coords: {
                        x1: posX1,
                        y1: posY1,
                        x2: posX2,
                        y2: posY2,
                    },
                };
                var hotspotDTO = {
                    Id: null,
                    HotspotDisplayTypeId: displayType.Id,
                    HotspotDisplayType: displayType,
                    HotspotActionTypeId: this.$scope.HotspotActionTypes[0].Id,
                    HotspotActionType: this.$scope.HotspotActionTypes[0],
                    Name: displayType.Name,
                    BuildingPlanId: this.$scope.CurrentPlan.Id,
                    BuildingId: this.$scope.CurrentPlan.BuildingId,
                    Description: displayType.Description,
                    DisplayDetails: JSON.stringify(displayDetails),
                    BeaconuuId: bId,
                    Files: []
                };
                var spot = new RapApp.Models.Hotspot(hotspotDTO);
                var self = this;
                //self.initFabricHotspot(spot);
                //return;
                TKWApp.Data.DataManager.Collections["Hotspots"].create(hotspotDTO).then(function (data) {
                    // hotspot created
                    // we need to add it to the plan as plan
                    self.$scope.CurrentPlan.Hotspots.push(data);
                    // create new hotspot object
                    var spot = new RapApp.Models.Hotspot(data);
                    // for now just add it to the list
                    self.$scope.CurrentPlanHotspots.push(spot);
                    debugger;
                    // add the spot to fabric
                    if (isPin) {
                        if (spot.Dto.HotspotDisplayType.Type == 3) {
                            delete self.hashPinedLineTable[self.getSelectedHotspot().Dto.Id];
                            self.hashPinedHashTable[self.getSelectedHotspot().Dto.Id] = spot;
                        }
                    }
                    if (spot.Dto.HotspotDisplayType.Type == 2) {
                        delete self.hashPinedLineTable2[self.getSelectedHotspot().Dto.Id];
                        self.hashPinedLineTable2[self.getSelectedHotspot().Dto.Id] = spot;
                    }
                    self.initFabricHotspot(spot);
                    var obj = spot.FabricJSObject;
                    if (obj) {
                        obj.sendBackwards(true);
                        obj.sendToBack();
                        obj.moveTo(0);
                    }
                }, function (error) {
                    alert(JSON.stringify(error));
                });
            };
            PlanController.prototype.removeHotspotFile = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["HotspotFiles"].delete(item.Id).then(function (data) { }, function (success) {
                    scope.SelectedHotspot.Dto.Files.splice(scope.SelectedHotspot.Dto.Files.indexOf(item), 1);
                    scope.$apply();
                    jQuery("#saveHotSpotSuccess").click();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            PlanController.prototype.deleteSelectedSpot = function () {
                var scope = this;
                var self = scope.Controller;
                var currentObject = self.canvas.getActiveObject();
                // seach the spot with this object
                var dto = null;
                for (var i = 0; i < scope.CurrentPlanHotspots.length; i++) {
                    if (scope.CurrentPlanHotspots[i].FabricJSObject == currentObject) {
                        dto = scope.CurrentPlanHotspots[i].Dto;
                        break;
                    }
                }
                if (dto) {
                    // found spot
                    // delete spot
                    TKWApp.Data.DataManager.Collections["Hotspots"].delete(dto.Id)
                        .then(function (data) {
                    }, function (success) {
                        if (dto.BeaconuuId == dto.Id) {
                            scope.reloadPlan();
                            return;
                        }
                        // the spot was deleted
                        // so we need to remove the objects from our lists and our canvas
                        // delete from the current plan
                        if (dto.HotspotDisplayType.Type > 1) {
                            for (var g in self.hashPinedHashTable) {
                                if (self.hashPinedHashTable[g].Dto.Id = dto.Id) {
                                    delete self.hashPinedHashTable[g];
                                    break;
                                }
                            }
                            for (var g in self.hashPinedLineTable2) {
                                if (self.hashPinedLineTable2[g].Dto.Id = dto.Id) {
                                    delete self.hashPinedLineTable2[g];
                                    break;
                                }
                            }
                            currentObject.opacity = 0;
                            self.canvas.renderAll();
                        }
                        self.deleteActiveFabricObject();
                        for (var c = 0; c < scope.CurrentPlanHotspots.length; c++) {
                            if (scope.CurrentPlanHotspots[c].Dto.Id == dto.Id) {
                                scope.CurrentPlanHotspots.splice(c, 1);
                            }
                            else if (scope.CurrentPlanHotspots[c].Dto.BeaconuuId == dto.Id) {
                                if (scope.CurrentPlanHotspots[c]) {
                                    self.deleteFabricObject(scope.CurrentPlanHotspots[c].FabricJSObject);
                                    scope.CurrentPlanHotspots[c].FabricJSObject.opacity = 0;
                                    self.deleteFabricObject(scope.CurrentPlanHotspots[c].FabricJSObject);
                                    scope.CurrentPlanHotspots.splice(c, 1);
                                }
                            }
                        }
                        for (var c = 0; c < scope.CurrentPlan.Hotspots.length; c++) {
                            if (scope.CurrentPlan.Hotspots[c].Id == dto.Id) {
                                scope.CurrentPlan.Hotspots.splice(c, 1);
                            }
                            else if (scope.CurrentPlan.Hotspots[c].BeaconuuId == dto.Id) {
                                scope.CurrentPlan.Hotspots.splice(c, 1);
                            }
                        }
                        self.canvas.renderAll();
                        //var index = scope.CurrentPlan.Hotspots.indexOf(dto);
                        //if (index >= 0)
                        //    scope.CurrentPlan.Hotspots.splice(index, 1);
                        // delete from scope list
                        scope.CurrentPlanHotspots.splice(i, 1);
                        // remove object from canvas
                        // close the modal
                        jQuery("#delete-spot-modal").modal("hide");
                        scope.$apply();
                        // close the modal
                        jQuery("#saveHotSpotSuccess").click();
                    }, function (error) {
                        alert(JSON.stringify(error));
                        // close the modal
                        jQuery("#delete-spot-modal").modal("hide");
                    });
                }
                else {
                    jQuery("#delete-spot-modal").modal("hide");
                }
            };
            PlanController.prototype.hotspotActionTypeAllowsAttachment = function () {
                if ($("#select-clients option[value='1']").attr("selected"))
                    return false;
                else
                    return true;
            };
            PlanController.prototype.reloadHotspot = function (hotspot) {
                TKWApp.Data.DataManager.Collections["Hotspots"].find(hotspot.Dto.Id).then(function (data) {
                    hotspot.Dto = data;
                }, function (error) {
                });
            };
            PlanController.prototype.updateSelectedHotspot = function () {
                var scope = this;
                scope.IsSaving = true;
                var displayDetails = JSON.parse(scope.SelectedHotspot.Dto.DisplayDetails);
                var textHP = false;
                if (isTextHp(scope.SelectedHotspot)) {
                    textHP = true;
                    if (scope.selectedTextColor)
                        displayDetails.Color = scope.selectedTextColor.id;
                    if (scope.selectedBgColor)
                        displayDetails.ForeColor = scope.selectedBgColor.id;
                    if (scope.SelectedHotspot.Dto.Width)
                        displayDetails.Size.width = scope.SelectedHotspot.Dto.Width / scope.Controller.canvas.getWidth();
                    if (scope.SelectedHotspot.Dto.Height)
                        displayDetails.Size.height = scope.SelectedHotspot.Dto.Height / scope.Controller.canvas.getHeight();
                    if (scope.SelectedHotspot.Dto.FontSize)
                        displayDetails.FontSize = scope.SelectedHotspot.Dto.FontSize;
                    if (scope.SelectedHotspot.Dto.TextAlign)
                        displayDetails.TextAlign = scope.selectedTextAlignment;
                    scope.SelectedHotspot.Dto.DisplayDetails = JSON.stringify(displayDetails);
                }
                else {
                    scope.SelectedHotspot.Dto.DisplayDetails = scope.SelectedHotspot.Dto.DisplayDetails;
                }
                TKWApp.Data.DataManager.Collections["Hotspots"].update(scope.SelectedHotspot.Dto).then(function (data) {
                    /*file upload*/
                    if (scope.AddHotspotModel.Uploader.files.length > 0) {
                        var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot/UploadFiles";
                        var files = scope.AddHotspotModel.Uploader.files;
                        for (var i = 0; i < files.length; i++) {
                            var progress = scope.AddHotspotModel.Uploader.uploadFile(scope.AddHotspotModel.Uploader.files[i], uploadUrl, {
                                Name: scope.AddHotspotModel.Uploader.files[i].name,
                                Description: "",
                                HotspotId: scope.SelectedHotspot.Dto.Id,
                                HotspotActionTypeId: scope.SelectedHotspot.Dto.HotspotActionTypeId
                            });
                            progress.progress(function (args) {
                            });
                            progress.finished(function (data) {
                                if (i == files.length) {
                                    scope.IsSaving = false;
                                    scope.Controller.reloadHotspot(scope.SelectedHotspot);
                                    jQuery("#edit-spot-modal").modal("hide");
                                    jQuery("#saveHotSpotSuccess").click();
                                }
                            });
                            progress.error(function (err) {
                                scope.IsSaving = false;
                                jQuery("#edit-spot-modal").modal("hide");
                                jQuery("#saveHotSpotFailure").click();
                            });
                        }
                    }
                    else {
                        scope.IsSaving = false;
                        scope.SelectedHotspot.Dto.DisplayDetails = data.DisplayDetails;
                        scope.SelectedHotspot.DisplayDetails = JSON.parse(data.DisplayDetails);
                        scope.Controller.canvas.remove(scope.SelectedHotspot.FabricJSObject);
                        scope.SelectedHotspot.FabricJSObject = null;
                        scope.Controller.initFabricHotspot(scope.SelectedHotspot);
                        if (!textHP)
                            jQuery("#edit-spot-modal").modal("hide");
                        else
                            jQuery("#edit-spot-modal-text").modal("hide");
                    }
                    /*file upload end*/
                    // we need to reload the current building
                    //scope.SelectedHotspot = data;
                    scope.$apply();
                    // close the modal dialog
                }, function (sucess) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(sucess));
                    jQuery("#saveHotSpotFailure").click();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                    jQuery("#saveHotSpotFailure").click();
                });
            };
            PlanController.prototype.editSelectedHotspot = function () {
                var scope = this;
                var self = scope.Controller;
                var currentObject = self.canvas.getActiveObject();
                scope.SelectedHotspot = null;
                // seach the spot with this object
                for (var i = 0; i < scope.CurrentPlanHotspots.length; i++) {
                    if (scope.CurrentPlanHotspots[i].FabricJSObject == currentObject) {
                        // found current selected object
                        scope.SelectedHotspot = scope.CurrentPlanHotspots[i];
                        if (!isTextHp(scope.SelectedHotspot)) {
                            jQuery("#edit-spot-modal").modal("show");
                        }
                        else {
                            scope.SelectedHotspot.Dto.Width = (scope.SelectedHotspot.DisplayDetails.Size.width * self.canvas.getWidth()).toFixed(0);
                            scope.SelectedHotspot.Dto.Height = (scope.SelectedHotspot.DisplayDetails.Size.height * self.canvas.getHeight()).toFixed(0);
                            scope.SelectedHotspot.Dto.FontSize = scope.SelectedHotspot.DisplayDetails.FontSize != null ? scope.SelectedHotspot.DisplayDetails.FontSize : 18;
                            scope.SelectedHotspot.Dto.TextAlign = scope.SelectedHotspot.DisplayDetails.TextAlign != null ? scope.SelectedHotspot.DisplayDetails.TextAlign : 'left';
                            if (scope.SelectedHotspot.DisplayDetails.Color) {
                                for (var t = 0; t < scope.Colors.length; t++) {
                                    if (scope.Colors[t].id == scope.SelectedHotspot.DisplayDetails.Color) {
                                        scope.selectedTextColor = scope.Colors[t];
                                        break;
                                    }
                                }
                            }
                            if (scope.SelectedHotspot.DisplayDetails.TextAlign) {
                                for (var t = 0; t < scope.TextAlignments.length; t++) {
                                    if (scope.TextAlignments[t] == scope.SelectedHotspot.DisplayDetails.TextAlign) {
                                        scope.selectedTextAlignment = scope.TextAlignments[t];
                                        break;
                                    }
                                }
                            }
                            if (scope.SelectedHotspot.DisplayDetails.ForeColor) {
                                for (var t = 0; t < scope.Colors.length; t++) {
                                    if (scope.Colors[t].id == scope.SelectedHotspot.DisplayDetails.ForeColor) {
                                        scope.selectedBgColor = scope.Colors[t];
                                        break;
                                    }
                                }
                            }
                            jQuery("#edit-spot-modal-text").modal("show");
                        }
                        break;
                    }
                }
                if (!scope.SelectedHotspot) {
                    jQuery("#edit-spot-modal").modal("hide");
                }
                /*file upload*/
                scope.AddHotspotModel = new RapApp.Models.BuildHotspotUploadModel(document.getElementById("fuBuildingHotspot"), document.getElementById("fuBuildingHotspotPreview"));
                scope.AddHotspotModel.Description = "Building image";
                scope.AddHotspotModel.BuildingId = scope.CurrentPlan.Id;
                scope.AddHotspotModel.Uploader.clearImagePreview(document.getElementById("fuBuildingHotspot"), document.getElementById("fuBuildingHotspotPreview"));
                //self.loadHotspotTypes();
                /*file upload end*/
            };
            PlanController.prototype.getSelectedHotspot = function () {
                var self = this;
                var currentObject = self.canvas.getActiveObject();
                // seach the spot with this object
                for (var i = 0; i < self.$scope.CurrentPlanHotspots.length; i++) {
                    if (self.$scope.CurrentPlanHotspots[i].FabricJSObject == currentObject) {
                        return self.$scope.CurrentPlanHotspots[i];
                    }
                }
            };
            PlanController.prototype.getLastPinHotspot = function () {
                var self = this;
                var t = self.$scope.CurrentPlanHotspots.length;
                while (t > 0) {
                    if (self.$scope.CurrentPlanHotspots[t - 1].Dto.HotspotDisplayType.Type == 2 ||
                        self.$scope.CurrentPlanHotspots[t - 1].Dto.HotspotDisplayType.Type == 3) {
                        return self.$scope.CurrentPlanHotspots[t - 1];
                        break;
                    }
                    t--;
                }
            };
            PlanController.prototype.undoPin = function () {
                var scope = this;
                var self = scope.Controller;
                var obj = self.getSelectedHotspot();
                if (obj) {
                    TKWApp.Data.DataManager.Collections["Hotspots"].edit(null, "UnPin?id=" + obj.Dto.BeaconuuId)
                        .then(function (data) {
                    }, function (success) {
                        if (success.status == 200) {
                            scope.IsLoading = true;
                            scope.$apply();
                            scope.reloadPlan();
                            return;
                            obj.Dto.BeaconuuId = null;
                            for (var c = 0; c < scope.CurrentPlanHotspots.length; c++) {
                                if (scope.CurrentPlanHotspots[c].Dto.BeaconuuId == obj.Dto.Id) {
                                    scope.CurrentPlanHotspots[c].Dto.BeaconuuId = null;
                                }
                            }
                            for (var c = 0; c < scope.CurrentPlan.Hotspots.length; c++) {
                                if (scope.CurrentPlan.Hotspots[c].BeaconuuId == obj.Dto.Id) {
                                    scope.CurrentPlanHotspots[c].Dto.BeaconuuId = null;
                                }
                            }
                            for (var g in self.hashPinedLineTable2) {
                                if (self.hashPinedLineTable2[g].Dto.Id == obj.Dto.Id) {
                                    delete self.hashPinedLineTable2[g];
                                    break;
                                }
                            }
                            if (self.hashPinedHashTable[obj.Dto.Id]) {
                                delete self.hashPinedHashTable[obj.Dto.Id];
                            }
                            if (self.hashPinedLineTable[obj.Dto.Id]) {
                                delete self.hashPinedLineTable[obj.Dto.Id];
                            }
                            scope.IsUnPinAction = false;
                            scope.PinAct = false;
                            // enable canvas object selection
                            fabric.Object.prototype.selectable = true;
                            if (self.canvas) {
                                self.canvas.forEachObject(function (o) {
                                    if (o.get('type') != 'line' && o.get('type') != 'circle')
                                        o.selectable = true;
                                });
                                if (scope.CurrentPlanHotspots) {
                                    var fObjs = self.canvas.getObjects();
                                    for (var i = 0; i < scope.CurrentPlanHotspots.length; i++) {
                                        if (!scope.CurrentPlanHotspots[i].Dto.BeaconuuId) {
                                            for (var k = 0; k < fObjs.length; k++) {
                                                if (fObjs[k] == scope.CurrentPlanHotspots[i].FabricJSObject) {
                                                    fObjs[k].selectable = true;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            scope.$apply();
                        }
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                }
            };
            PlanController.prototype.setPin = function () {
                var scope = this;
                var self = scope.Controller;
                scope.PinAct = true;
                scope.IsPinAction = true;
                var sel = self.getSelectedHotspot();
                if (sel.Dto.HotspotDisplayType.Type > 1) {
                    alert("Only icons and points can be pined");
                    return;
                }
                //var cx = 1;
                var centerX, centerY;
                var c = sel.FabricJSObject.getCenterPoint();
                centerX = c.x;
                centerY = c.y;
                var color = sel.Dto.HotspotDisplayType.Color;
                if (!color)
                    color = "#000000";
                var hotSpCircle;
                for (var i = 0; i < scope.PinHotspots.length; i++) {
                    if (scope.PinHotspots[i].Type == 3) {
                        hotSpCircle = scope.PinHotspots[i];
                        break;
                    }
                }
                var size = 8;
                if (self.hashPinedHashTable[sel.Dto.Id]) {
                    size = 0;
                }
                self.createHotspot(hotSpCircle, centerX, centerY, size, size, color, null, null, null, null, sel.Dto.Id, true);
                sel.Dto.BeaconuuId = sel.Dto.Id;
                TKWApp.Data.DataManager.Collections["Hotspots"].update(sel.Dto).then(function (data) {
                    // we need to reload the current building
                    //scope.SelectedHotspot = data;
                    scope.$apply();
                    // close the modal dialog
                }, function (sucess) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(sucess));
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            PlanController.prototype.reloadSetPin = function () {
                var scope = this;
                var self = scope.Controller;
                var sel = self.getSelectedHotspot();
                var cx = 1;
                var centerX, centerY;
                if (sel.FabricJSObject.scaleX >= 1) {
                    centerX = (sel.FabricJSObject.width * sel.FabricJSObject.scaleX / 8) + sel.FabricJSObject.left;
                }
                else {
                    centerX = sel.FabricJSObject.left - (sel.FabricJSObject.width * sel.FabricJSObject.scaleX / 8);
                }
                var cy = 1;
                if (sel.FabricJSObject.scaleX >= 1) {
                    centerY = (sel.FabricJSObject.height * sel.FabricJSObject.scaleY / 8) + sel.FabricJSObject.top;
                }
                else {
                    centerY = sel.FabricJSObject.top - (sel.FabricJSObject.height * sel.FabricJSObject.scaleY / 8);
                }
                var c = sel.FabricJSObject.getCenterPoint();
                centerX = c.x;
                centerY = c.y;
                var color = sel.Dto.HotspotDisplayType.Color;
                var hotSpCircle;
                for (var i = 0; i < scope.PinHotspots.length; i++) {
                    if (scope.PinHotspots[i].Type == 3) {
                        hotSpCircle = scope.PinHotspots[i];
                        break;
                    }
                }
                var doPin = false;
                if (!self.hashPinedHashTable[sel.Dto.Id]) {
                    doPin = true;
                }
                self.createHotspot(hotSpCircle, centerX, centerY, 0, 0, color, null, null, null, null, sel.Dto.Id, doPin);
            };
            // CANVAS UTILS
            PlanController.prototype.initFabric = function (successFunction) {
                var _this = this;
                var self = this;
                // initialize canvas 
                this.canvas = new fabric.Canvas('respondCanvas');
                var g = document.getElementById("canv-container");
                g.addEventListener("touchstart", this.dropHp, false);
                var wd = 0.8 * $(window).width();
                var ht = wd * 9 / 16;
                var wd = g.clientWidth;
                var ht = g.clientHeight;
                this.canvas.setWidth(wd);
                this.canvas.setHeight(ht);
                this.initialCanvasLeft = document.getElementById("respondCanvas").getBoundingClientRect().left;
                // set background image
                fabric.Image.fromURL(this.getPlanImage(this.$scope.CurrentPlan), function (img) {
                    // compute the width and height of the background
                    // recompote canvas size
                    var width = img.width;
                    var height = img.height;
                    if (_this.$scope.CurrentPlan.CanUseFullCanvas) {
                        var ratio = (_this.canvas.getWidth()) / width;
                        width = _this.canvas.getWidth();
                        height = ratio * img.height;
                        self.canvas.setHeight(height);
                        self.canvas.calcOffset();
                    }
                    else {
                        self.canvas.setWidth(width);
                        self.canvas.setHeight(height);
                        self.canvas.calcOffset();
                    }
                    // set background
                    img.set({ width: width, height: height, originX: 'left', originY: 'top' });
                    self.canvas.setBackgroundImage(img, self.canvas.renderAll.bind(self.canvas));
                    if (successFunction)
                        successFunction();
                });
                // set up canvas events
                this.canvas.on("mouse:down", function (ev) {
                    // if the plan is in edit mode, we need to disregard this
                    if (self.$scope.EditMode && !self.$scope.PinAct)
                        return;
                    else if (self.$scope.EditMode && self.$scope.PinAct) {
                        var sel = self.getSelectedHotspot();
                        if (sel) {
                            if (!self.hashPinedHashTable[sel.Dto.Id] &&
                                !self.hashPinedLineTable[sel.Dto.Id] &&
                                !self.hashPinedLineTable2[sel.Dto.Id])
                                return;
                            var origPin = self.hashPinedHashTable[sel.Dto.Id];
                            if (!origPin)
                                origPin = sel;
                            if (origPin) {
                                var centerX = origPin.DisplayDetails.Position.x;
                                var centerY = origPin.DisplayDetails.Position.y;
                                var color = origPin.DisplayDetails.Color;
                                if (!color)
                                    color = "#000000";
                                if (sel.Dto.HotspotDisplayType.Type == 0) {
                                    color = _this.$scope.PinnedLineColor;
                                }
                                if (sel.Dto.HotspotDisplayType.Type == 1 && _this.$scope.PinnedLineColor != "#000000") {
                                    color = _this.$scope.PinnedLineColor;
                                }
                                var c = origPin.FabricJSObject.getCenterPoint();
                                centerX = c.x;
                                centerY = c.y;
                                var isNew = true;
                                var obj = self.hashPinedLineTable[sel.Dto.Id];
                                if (obj != null) {
                                    isNew = false;
                                    self.canvas.remove(obj);
                                }
                                //if (this.CanvasScale > 1) {
                                //    centerX = centerX * this.CanvasScale;
                                //    centerY = centerY * this.CanvasScale;
                                //}
                                //else if (this.CanvasScale < 1) {
                                //    centerX = centerX * (1 / this.CanvasScale);
                                //    centerY = centerY * (1 / this.CanvasScale);
                                //}
                                self.drawedObject = new fabric.Line([centerX, centerY, centerX, centerY], {
                                    originX: 'center',
                                    originY: 'center',
                                    strokeWidth: _this.$scope.PinnedLineSize,
                                    stroke: color,
                                    selectable: false,
                                    name: "line_" + sel.Dto.Id,
                                    hasControls: false,
                                    hasRotatingPoint: false,
                                    lockRotation: true,
                                    lockMovementX: true,
                                    lockScalingFlip: true,
                                    lockMovementY: true,
                                    lockScalingX: true,
                                    lockScalingY: true,
                                    lockUniScaling: true
                                });
                                delete self.hashPinedLineTable[sel.Dto.Id];
                                self.hashPinedLineTable[sel.Dto.Id] = self.drawedObject;
                                self.$scope.IsUnPinAction = true;
                                self.$scope.$apply();
                                self.canvas.add(self.drawedObject);
                                self.drawedObject.sendToBack();
                                self.drawedObject.moveTo(0);
                                self.drawedObject.sendBackwards(true);
                                self.canvas.renderAll();
                                if (isNew) {
                                    var hotSpLine;
                                    for (var i = 0; i < self.$scope.PinHotspots.length; i++) {
                                        if (self.$scope.PinHotspots[i].Type == 2) {
                                            hotSpLine = self.$scope.PinHotspots[i];
                                            break;
                                        }
                                    }
                                    self.createHotspot(hotSpLine, centerX, centerY, _this.$scope.PinnedLineSize, 1, color, null, null, null, null, sel.Dto.Id, false);
                                }
                            }
                        }
                    }
                    else {
                        var object = self.canvas.findTarget(ev.e, true);
                        if (!object)
                            return;
                        //TODO: we should probably move this into a function like the create
                        // find hotspot with this object
                        for (var i = 0; i < self.$scope.CurrentPlanHotspots.length; i++) {
                            if (self.$scope.CurrentPlanHotspots[i].Dto.HotspotDisplayType.Type < 2) {
                                if (self.$scope.CurrentPlanHotspots[i].FabricJSObject == object) {
                                    // found the object
                                    // we should set the selected hotspot
                                    // and show the modal for the selected hotspot
                                    self.$scope.ActiveHotspot = self.$scope.CurrentPlanHotspots[i];
                                    self.$scope.ActiveHotspot.initActiveFile();
                                    self.$scope.$apply();
                                    // show dialog
                                    jQuery("#view-spot-modal").modal("show");
                                    break;
                                }
                            }
                        }
                    }
                });
                this.canvas.on("mouse:up", function (ev) {
                    if (self.drawedObject) {
                        //update onj to db
                        var sel = self.getSelectedHotspot();
                        if (!sel)
                            return;
                        if (sel.Dto.HotspotDisplayType.Type > 1) {
                            self.$scope.HasSelectedSpot = false;
                            self.$scope.$apply();
                            return;
                        }
                        if (self.hashPinedLineTable2[sel.Dto.Id]) {
                            var origPin = self.hashPinedHashTable[sel.Dto.Id];
                            var dto = self.hashPinedLineTable2[sel.Dto.Id];
                            for (var i = 0; i < self.$scope.CurrentPlanHotspots.length; i++) {
                                if (self.$scope.CurrentPlanHotspots[i].Dto.Id == dto.Dto.Id) {
                                    var o = sel.FabricJSObject.getCenterPoint();
                                    var centerX1 = o.x;
                                    var centerY1 = o.y;
                                    var d = origPin.FabricJSObject.getCenterPoint();
                                    var centerX2 = d.x;
                                    var centerY2 = d.y;
                                    sel.FabricJSObject.bringForward(true);
                                    sel.FabricJSObject.bringToFront();
                                    if (centerX1 > 1) {
                                        centerX1 = centerX1 / _this.canvas.getWidth();
                                    }
                                    if (centerY1 > 1) {
                                        centerY1 = centerY1 / _this.canvas.getHeight();
                                    }
                                    if (centerX2 > 1) {
                                        centerX2 = centerX2 / _this.canvas.getWidth();
                                    }
                                    if (centerY2 > 1) {
                                        centerY2 = centerY2 / _this.canvas.getHeight();
                                    }
                                    self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.x1 = centerX1;
                                    self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.x2 = centerX2;
                                    self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.y1 = centerY1;
                                    self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.y2 = centerY2;
                                    // stirngify to dto
                                    self.$scope.CurrentPlanHotspots[i].Dto.DisplayDetails = JSON.stringify(self.$scope.CurrentPlanHotspots[i].DisplayDetails);
                                    // save to storage
                                    TKWApp.Data.DataManager.Collections["Hotspots"].update(self.$scope.CurrentPlanHotspots[i].Dto)
                                        .then(function (data) {
                                    }, function (error) {
                                        alert(JSON.stringify(error));
                                    });
                                    break;
                                }
                            }
                        }
                        self.canvas.remove(self.drawedObject);
                        self.canvas.renderAll();
                        self.canvas.add(self.drawedObject);
                        self.drawedObject.sendBackwards(true);
                        self.drawedObject.sendToBack();
                        self.drawedObject = null;
                    }
                });
                this.canvas.on('mouse:move', function (e) {
                    if (self.$scope.EditMode && self.$scope.PinAct) {
                        if (!self.drawedObject) {
                            return;
                        }
                        var sel = self.getSelectedHotspot();
                        if (sel) {
                            self.$scope.IsUnPinAction = true;
                            if (self.hashPinedHashTable[sel.Dto.Id]) {
                                var pointer = self.canvas.getPointer(e.e);
                                self.drawedObject.set({ x2: pointer.x, y2: pointer.y });
                                self.drawedObject.bringForward(true);
                                self.drawedObject.bringToFront();
                                self.canvas.renderAll();
                            }
                        }
                    }
                });
                this.canvas.on('object:selected', function (ev) {
                    _this.$scope.HideEditSpot = false;
                    _this.$scope.ShowCustomizeObject = false;
                    _this.$scope.PinnedLineColor = "#000000";
                    _this.$scope.PinnedLineSize = 3;
                    if (!self.$scope.EditMode)
                        return;
                    var sel = self.getSelectedHotspot();
                    if (!sel) {
                        _this.$scope.IsUnPinAction = false;
                        _this.$scope.PinAct = false;
                        _this.$scope.IsPinAction = false;
                        self.$scope.HasSelectedSpot = false;
                        self.$scope.$apply();
                        return;
                    }
                    if (sel && sel.Dto.HotspotDisplayType.Type > 1) {
                        if (sel.Dto.BeaconuuId != null) {
                            self.$scope.HasSelectedSpot = false;
                            self.$scope.$apply();
                            return;
                        }
                        _this.$scope.HideEditSpot = true;
                    }
                    // show delete object button
                    $('#main').width('100%');
                    $('#sitekey').width('0%');
                    $('#sitekey').hide();
                    $("#sitekeyPoint").width('0%');
                    $('#sitekeyPoint').hide();
                    var doPin = false;
                    if (sel) {
                        if (sel.Dto.Id == sel.Dto.BeaconuuId) {
                            _this.$scope.PinAct = true;
                            _this.$scope.IsPinAction = true;
                            doPin = true;
                        }
                        if (sel.Dto.HotspotDisplayType.Type <= 1) {
                            _this.$scope.IsPinAction = true;
                            if (!self.hashPinedLineTable[sel.Dto.Id]) {
                                _this.$scope.IsUnPinAction = false;
                            }
                        }
                    }
                    if (doPin) {
                        _this.$scope.reloadSetPin();
                        var hps = self.$scope.CurrentPlanHotspots;
                        if (hps) {
                            for (var i = 0; i < hps.length; i++) {
                                if (hps[i].Dto.BeaconuuId == sel.Dto.Id && hps[i].Dto.HotspotDisplayType.Type == 2) {
                                    _this.$scope.PinnedLineColor = hps[i].DisplayDetails.Color;
                                    _this.$scope.PinnedLineSize = hps[i].DisplayDetails.Size.width;
                                    break;
                                }
                            }
                        }
                    }
                    self.$scope.HasSelectedSpot = true;
                    self.$scope.$apply();
                });
                this.canvas.on('selection:cleared', function (ev) {
                    // hide delete object button
                    _this.$scope.IsUnPinAction = false;
                    _this.$scope.PinAct = false;
                    _this.$scope.IsPinAction = false;
                    self.$scope.HasSelectedSpot = false;
                    self.$scope.$apply();
                });
                this.canvas.on('object:modified', function (ev) {
                    if (!self.$scope.EditMode)
                        return;
                    var object = self.canvas.getActiveObject();
                    if (!object)
                        return;
                    var normWidth = object.getWidth() / self.canvas.getWidth();
                    var normHeight = object.getHeight() / self.canvas.getHeight();
                    var normX = object.getLeft() / self.canvas.getWidth();
                    var normY = object.getTop() / self.canvas.getHeight();
                    var rotation = object.getAngle();
                    //TODO: we should probably move this into a function like the create
                    // find hotspot with this object
                    for (var i = 0; i < self.$scope.CurrentPlanHotspots.length; i++) {
                        if (self.$scope.CurrentPlanHotspots[i].FabricJSObject == object) {
                            // found the hotspot
                            // set its attributes
                            if (self.$scope.CurrentPlanHotspots[i].DisplayDetails.Position.x != normX ||
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Position.y != normY ||
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Size.width != normWidth ||
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Size.height != normHeight ||
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Rotation != rotation) {
                                console.log('object:modified');
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Position.x = normX;
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Position.y = normY;
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Size.width = normWidth;
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Size.height = normHeight;
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Rotation = rotation;
                                // stirngify to dto
                                self.$scope.CurrentPlanHotspots[i].Dto.DisplayDetails = JSON.stringify(self.$scope.CurrentPlanHotspots[i].DisplayDetails);
                                // save to storage
                                TKWApp.Data.DataManager.Collections["Hotspots"].update(self.$scope.CurrentPlanHotspots[i].Dto)
                                    .then(function (data) {
                                }, function (error) {
                                    alert(JSON.stringify(error));
                                });
                                break;
                            }
                        }
                    }
                });
            };
            // a new hotspot started dragging
            // we need to set it as current
            PlanController.prototype.hotspotDragging = function (ev, draggable, hotspotDisplayType) {
                var scope = this.$parent;
                if (!scope.EditMode)
                    return;
                scope.SelectedHotspotDisplayType = hotspotDisplayType;
            };
            // hotspot was dropped into the canvas...
            // need to create a default spot in that location
            PlanController.prototype.hotspotDropped = function (ev, droppable) {
                var scope = this;
                // get real position
                var positionY = droppable.offset.top - document.getElementById("respondCanvas").getBoundingClientRect().top;
                var positionX = droppable.offset.left - document.getElementById("respondCanvas").getBoundingClientRect().left;
                var normX = positionX / scope.Controller.canvas.getWidth();
                var normY = positionY / scope.Controller.canvas.getHeight();
                var w = 60, h = 60;
                var normWidth = w / scope.Controller.canvas.getWidth();
                var normHeight = h / scope.Controller.canvas.getHeight();
                fabric.Object.prototype.selectable = true;
                if (scope.Controller.canvas) {
                    scope.Controller.canvas.forEachObject(function (o) {
                        o.selectable = true;
                    });
                }
                scope.Controller.createHotspot(scope.SelectedHotspotDisplayType, normX, normY, normWidth, normHeight);
            };
            // initializes the fabric js object for the current
            // specified hotspot, and adds it to the canvas
            PlanController.prototype.initFabricHotspot = function (spot) {
                var _this = this;
                // check if the spot is already on the canvas
                if (spot.FabricJSObject)
                    return;
                // spot not on the canvas - so we ned to add it
                var img = document.createElement("img");
                var self = this;
                img.onload = function () {
                    var obj = new fabric.Image(img, null);
                    // set rotation
                    obj.angle = spot.DisplayDetails.Rotation;
                    if (spot.Dto.HotspotDisplayType.Type == 1) {
                        obj.width = spot.DisplayDetails.Size.width * _this.canvas.getWidth();
                        obj.height = spot.DisplayDetails.Size.height * _this.canvas.getHeight();
                        if (obj.width > 32)
                            obj.width = 32;
                        if (obj.height > 32)
                            obj.height = 32;
                        if (_this.canvas.getWidth() < 1024) {
                            obj.width = obj.height = 16;
                        }
                    }
                    else {
                        // un-normalize size elements and set them
                        if ($("#sitekeyPoint").is(":hidden")) {
                            obj.width = spot.DisplayDetails.Size.width * _this.canvas.getWidth();
                            obj.height = spot.DisplayDetails.Size.height * _this.canvas.getHeight();
                        }
                        else {
                            obj.width = obj.width * 2;
                            obj.height = obj.height * 2;
                        }
                    }
                    // un-normalize position elements and set them
                    obj.setPositionByOrigin(new fabric.Point(spot.DisplayDetails.Position.x * self.canvas.getWidth(), spot.DisplayDetails.Position.y * self.canvas.getHeight()), "left", "top");
                    // set the created fabricjs object to the spot
                    spot.FabricJSObject = obj;
                    // add the fabricjs object to the canvas
                    self.canvas.add(obj);
                    if (self.$scope.EditMode) {
                        self.canvas.setActiveObject(obj);
                    }
                };
                if (spot.Dto.HotspotDisplayType.Type == 0 || spot.Dto.HotspotDisplayType.Type == 1) {
                    normalizeCanvas(self.canvas, spot);
                    if (isTextHp(spot)) {
                        spot.Dto.Description = spot.Dto.Description ? spot.Dto.Description : "";
                        if (spot.Dto.Description) {
                            var unformatted = new fabric.Text(spot.Dto.Description, {
                                backgroundColor: spot.DisplayDetails.ForeColor,
                                fill: spot.DisplayDetails.Color,
                                fontSize: spot.DisplayDetails.FontSize,
                                top: 5,
                                left: 5,
                                selectable: true,
                            });
                            var formatted = RapApp.CanvasUtils.wrapCanvasText(unformatted, self.canvas, spot.DisplayDetails.Size.width * this.canvas.getWidth(), spot.DisplayDetails.Size.height * this.canvas.getHeight(), spot.DisplayDetails.TextAlign);
                            formatted.top = spot.DisplayDetails.Position.y * self.canvas.getHeight();
                            formatted.left = spot.DisplayDetails.Position.x * self.canvas.getWidth();
                            self.canvas.add(formatted);
                            spot.FabricJSObject = formatted;
                        }
                        else {
                            img.src = this.getHotspotDisplayTypeImage(spot.Dto.HotspotDisplayType);
                        }
                    }
                    else {
                        img.src = this.getHotspotDisplayTypeImage(spot.Dto.HotspotDisplayType);
                    }
                }
                else if (spot.Dto.HotspotDisplayType.Type == 2) {
                    var isSelecteable = true;
                    if (spot.Dto.BeaconuuId)
                        isSelecteable = false;
                    normalizeCanvas(self.canvas, spot);
                    var x1 = spot.DisplayDetails.Coords.x1;
                    if (x1 < 1)
                        x1 = x1 * self.canvas.getWidth();
                    var x2 = spot.DisplayDetails.Coords.x2;
                    if (x2 < 1)
                        x2 = x2 * self.canvas.getWidth();
                    var y1 = spot.DisplayDetails.Coords.y1;
                    if (y1 < 1)
                        y1 = y1 * self.canvas.getHeight();
                    var y2 = spot.DisplayDetails.Coords.y2;
                    if (y2 < 1)
                        y2 = y2 * self.canvas.getHeight();
                    var line = new fabric.Line([x1, y1, x2, y2], {
                        originX: 'center',
                        originY: 'center',
                        name: "line_" + spot.Dto.BeaconuuId,
                        strokeWidth: spot.DisplayDetails.Size.width,
                        stroke: spot.DisplayDetails.Color,
                        selectable: isSelecteable,
                        hasControls: false,
                        hasRotatingPoint: false,
                        lockRotation: true,
                        lockMovementX: true,
                        lockScalingFlip: true,
                        lockMovementY: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockUniScaling: true,
                    });
                    self.canvas.add(line);
                    line.sendToBack();
                    line.sendBackwards();
                    line.moveTo(1);
                    self.canvas.sendToBack(line);
                    spot.FabricJSObject = line;
                }
                else if (spot.Dto.HotspotDisplayType.Type == 3) {
                    var isSelecteable = true;
                    if (spot.Dto.BeaconuuId)
                        isSelecteable = false;
                    normalizeCanvas(self.canvas, spot);
                    var left = spot.DisplayDetails.Position.x;
                    if (left < 1)
                        left = left * self.canvas.getWidth();
                    var top = spot.DisplayDetails.Position.y;
                    if (top < 1)
                        top = top * self.canvas.getHeight();
                    var circle = new fabric.Circle({
                        radius: spot.DisplayDetails.Size.width,
                        fill: spot.DisplayDetails.Color,
                        left: left,
                        top: top,
                        selectable: isSelecteable,
                        hasControls: false,
                        hasRotatingPoint: false,
                        lockRotation: true,
                        lockMovementX: true,
                        lockScalingFlip: true,
                        lockMovementY: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockUniScaling: true,
                    });
                    self.canvas.add(circle);
                    self.canvas.bringToFront(circle);
                    spot.FabricJSObject = circle;
                }
            };
            PlanController.prototype.deleteActiveFabricObject = function () {
                var obj = this.canvas.getActiveObject();
                this.canvas.remove(obj);
            };
            PlanController.prototype.deleteFabricObject = function (obj) {
                this.canvas.remove(obj);
            };
            //mobile function
            PlanController.prototype.pressHp = function (item) {
                var $scope = this;
                $scope.$parent.PressedHp = item;
                $scope.$parent.HasPressedHp = true;
            };
            PlanController.prototype.dropHp = function (event) {
                var scope = angular.element(this).scope();
                if (scope.HasPressedHp) {
                    var positionY = 0;
                    var positionX = 0;
                    var normX = positionX / scope.Controller.canvas.getWidth();
                    var normY = positionY / scope.Controller.canvas.getHeight();
                    var normWidth = 60 / scope.Controller.canvas.getWidth();
                    var normHeight = 60 / scope.Controller.canvas.getHeight();
                    scope.Controller.createHotspot(scope.PressedHp, normX, normY, normWidth, normHeight);
                    scope.HasPressedHp = false;
                    scope.HasPressedHp = null;
                }
            };
            return PlanController;
        })(Controllers.BaseController);
        Controllers.PlanController = PlanController;
        function normalizeCanvas(canvas, hp) {
            if (canvas.getWidth() < hp.DisplayDetails.Position.x) {
                canvas.setWidth(hp.DisplayDetails.Position.x + 50);
            }
            if (canvas.getHeight() < hp.DisplayDetails.Position.y) {
                canvas.setHeight(hp.DisplayDetails.Position.y + 50);
            }
        }
        function isTextHp(hp) {
            if (!hp)
                return false;
            if (hp.Dto.HotspotDisplayType.FileName.indexOf("text") != -1)
                return true;
            else
                return false;
        }
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=plan-controller.js.map