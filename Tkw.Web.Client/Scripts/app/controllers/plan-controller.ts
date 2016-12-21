module RapApp.Controllers {
    export class PlanController extends BaseController {
        public $scope: RapApp.Models.ISinglePlan;
        public PlanId: string;
        public ZoomLevel: number;
        private drawedObject: fabric.IObject;
        private hashPinedHashTable: {};
        //keep circle
        private hashPinedLineTable: {};
        //keep drwaw line
        private hashPinedLineTable2: {};
        public canvas: fabric.ICanvas;
        private initialCanvasLeft: number;

        public CanvasScale: number;
        public ScaleFactor: number;

        // initializes the controller
        constructor($scope: RapApp.Models.ISinglePlan) {
            super();
            this.$scope = $scope;
            this.ZoomLevel = 1;

            this.CanvasScale = 1;
            this.ScaleFactor = 1.2;

            this.$scope.HotspotActionTypes = [];
            this.$scope.HotspotDisplayTypes = [];
            this.$scope.CurrentPlanHotspots = [];
            (<any>this.$scope).FilteredPlanHotspots = [];
            (<any>this.$scope).PinnedLineColor = "#000000";
            (<any>this.$scope).PinnedLineSize = 3;
            (<any>this.$scope).Colors = [
                { id: "#000000", name: 'Black' },
                { id: "#008000", name: 'Green' },
                { id: "#ff0000", name: 'Red' },
                { id: "#0000ff", name: 'Blue' },
                { id: "#ffff00", name: 'Yellow' },
                { id: "#ffffff", name: 'White' }
            ];
            (<any>this.$scope).selectedTextColor = (<any>this.$scope).Colors[0];
            (<any>this.$scope).selectedBgColor = (<any>this.$scope).Colors[5];
            (<any>this.$scope).TextAlignments = ['Left', 'Center', 'Right', 'Justify'];
            (<any>this.$scope).selectedTextAlignment = (<any>this.$scope).TextAlignments[0];
            (<any>this.$scope).HotspotPoints = [];
            (<any>this.$scope).PinHotspots = [];
            (<any>this.$scope).IsPinAction = false;
            (<any>this.$scope).IsUnPinAction = false;
            (<any>this.$scope).HideEditSpot = false;
            (<any>this.$scope).DeleteSpotText = "Delete Spot"
            this.hashPinedHashTable = {};
            this.hashPinedLineTable = {};
            this.hashPinedLineTable2 = {};
            (<any>$scope).isInRole = true;
            if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                (<any>$scope).isInRole = false;
            }
            // add scope functions
            (<any>this.$scope).toggleEditMode = this.toggleEditMode;

            (<any>this.$scope).getHotspotDisplayTypeImage = this.getHotspotDisplayTypeImage;

            (<any>this.$scope).hotspotDragging = this.hotspotDragging;
            (<any>this.$scope).hotspotDropped = this.hotspotDropped;
            (<any>this.$scope).deleteSelectedSpot = this.deleteSelectedSpot;
            (<any>this.$scope).editSelectedHotspot = this.editSelectedHotspot;
            (<any>this.$scope).updateSelectedHotspot = this.updateSelectedHotspot;
            (<any>this.$scope).getSpotFileUrl = this.getSpotFileUrl;
            (<any>this.$scope).getSpotFileType = this.getSpotFileType;
            (<any>this.$scope).isSpotFileType = this.isSpotFileType;
            (<any>this.$scope).removeHotspotFile = this.removeHotspotFile;
            (<any>this.$scope).loadOtherPlans = this.loadOtherPlans;
            (<any>this.$scope).loadDetails = this.loadDetails;
            (<any>this.$scope).editPlanDetails = this.editPlanDetails;
            (<any>this.$scope).getSelectedHotspot = this.getSelectedHotspot;
            (<any>this.$scope).getLastPinHotspot = this.getLastPinHotspot;

            (<any>this.$scope).setPin = this.setPin;
            (<any>this.$scope).reloadSetPin = this.reloadSetPin;

            
            (<any>this.$scope).undoPin = this.undoPin;
            (<any>this.$scope).getPlanImage = this.getPlanImage;
            (<any>this.$scope).reloadPlan = this.reloadPlan;
            (<any>this.$scope).refreshPlan = this.refreshPlan;
            (<any>this.$scope).hotspotActionTypeAllowsAttachment = this.hotspotActionTypeAllowsAttachment;

            (<any>this.$scope).growCanvas = () => {
                this.CanvasScale = this.CanvasScale * this.ScaleFactor;
                this.ZoomLevel /= 1.2;
                var objects = this.canvas.getObjects();
                for (var i in objects) {
                    var scaleX = objects[i].scaleX;
                    var scaleY = objects[i].scaleY;
                    var left = objects[i].left;
                    var top = objects[i].top;

                    var tempScaleX = scaleX * this.ScaleFactor;
                    var tempScaleY = scaleY * this.ScaleFactor;
                    var tempLeft = left * this.ScaleFactor;
                    var tempTop = top * this.ScaleFactor;

                    objects[i].scaleX = tempScaleX;
                    objects[i].scaleY = tempScaleY;
                    objects[i].left = tempLeft;
                    objects[i].top = tempTop;

                    objects[i].setCoords();
                }
                var orgImg = this.canvas.backgroundImage;
                (<any>orgImg).width = (<any>orgImg).width * this.ScaleFactor;
                (<any>orgImg).height = (<any>orgImg).height * this.ScaleFactor;
                this.canvas.setBackgroundImage(orgImg, null);
                this.canvas.setWidth((<any>orgImg).width);
                this.canvas.setHeight((<any>orgImg).height);
                this.canvas.renderAll();
                $("#respondCanvas").attr("style", "margin-right:20px");
            };

            (<any>this.$scope).shrinkCanvas = () => {
                this.ZoomLevel *= 1.2;
                this.CanvasScale = this.CanvasScale / this.ScaleFactor;
                var objects = this.canvas.getObjects();
                for (var i in objects) {
                    var scaleX = objects[i].scaleX;
                    var scaleY = objects[i].scaleY;
                    var left = objects[i].left;
                    var top = objects[i].top;
                    var tempScaleX = scaleX * (1 / this.ScaleFactor);
                    var tempScaleY = scaleY * (1 / this.ScaleFactor);
                    var tempLeft = left * (1 / this.ScaleFactor);
                    var tempTop = top * (1 / this.ScaleFactor);
                    objects[i].scaleX = tempScaleX;
                    objects[i].scaleY = tempScaleY;
                    objects[i].left = tempLeft;
                    objects[i].top = tempTop;

                    objects[i].setCoords();
                }
                var orgImg = this.canvas.backgroundImage;
                (<any>orgImg).width = (<any>orgImg).width * (1 / this.ScaleFactor);
                (<any>orgImg).height = (<any>orgImg).height * (1 / this.ScaleFactor);
                this.canvas.setBackgroundImage(orgImg, null); 
                this.canvas.setWidth((<any>orgImg).width);
                this.canvas.setHeight((<any>orgImg).height);
                this.canvas.renderAll(); 
            };

            (<any>this.$scope).reset = () => {
               
            };

            (<any>this.$scope).nextActiveFile = () => {
                if ($scope.ActiveHotspot)
                    $scope.ActiveHotspot.nextActiveFile();

            };

            (<any>this.$scope).prevActiveFile = () => {
                if ($scope.ActiveHotspot)
                    $scope.ActiveHotspot.prevActiveFile();

            };

            (<any>this.$scope).navigateToPlan = (view: Models.IBuildingPlan) => {
                if (view.Id != $scope.CurrentPlan.Id) {
                    this.navigateUrl('Plan', view.Id)
                }

            };

            (<any>this.$scope).editPlan = (id: string) => {
                this.navigateUrl('PlanEdit', id);
            };
            
            // initialize scope
            (<any>$scope).Controller = this;
            $scope.DefaultPlanImage = "./Content/Images/default-plan.jpg";
            $scope.DefaultSpotImage = "./Content/Images/default-plan.jpg";


            // get the current plan id
            this.PlanId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            this.$scope.PlanId = this.PlanId;
            $scope.EditMode = true;
            // load current plan
            (<any>this.$scope).loadPlan = this.loadPlan;
            this.loadPlan(this.PlanId);
            var w = angular.element((<any>$(window)));
            w.bind('resize', function () {
               //(<any>$scope).reloadPlan();
            });

            (<any>this.$scope).PressedHp = null;
            (<any>this.$scope).HasPressedHp = false;
            (<any>this.$scope).pressHp = this.pressHp;
            (<any>this.$scope).dropHp = this.dropHp;

            //customise lines 
            (<any>this.$scope).customizePinedObjects = this.customizePinedObjects;
            (<any>this.$scope).updatePinedObjectCustomProperties = this.updatePinedObjectCustomProperties;

            (<any>this.$scope).customizeObject = this.customizeObject;
            (<any>this.$scope).updateCustomizeObject = this.updateCustomizeObject;
            (<any>$scope).Filter = false;
            //filter icon
            (<any>this.$scope).filter = () => {
                if ((<any>$scope).Filter) {
                    (<any>$scope).Filter = false;
                    fabric.Object.prototype.selectable = true;
                    (<any>this.$scope).FilteredPlanHotspots = [];
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.visible = true;
                    });
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.renderAll();
                    var selected = $(".spot-touched");
                    for (var j = 0; j < selected.length; j++) {
                        (<any>jQuery(selected[j])).removeClass("spot-touched");
                    }
                }
                else {
                    (<any>jQuery("#filter-icons")).modal("show");
                    (<any>$scope).Filter = true;
                }
            };
            (<any>this.$scope).filterIcon = this.filterIcon;
        }

        filterIcon($event, spotDisplayType) {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            var hp = null;
            var ids = [];
            var beaconuuIds = [];
            var elem = document.getElementById(spotDisplayType.Id);

            if ((<any>jQuery(elem)).hasClass("spot-touched")) {
                for (var k = 0; k < $(".spot-touched").length; k++) {
                    for (var j = 0; j < (<any>self.$scope).FilteredPlanHotspots.length; j++) {
                        hp = (<any>self.$scope).FilteredPlanHotspots[j].Dto;
                        if (hp.HotspotDisplayTypeId == spotDisplayType.Id) {                           
                            ids.push(hp.Id);
                            (<any>self.$scope).FilteredPlanHotspots.splice(j, 1);
                        }
                    }
                }
                for (var k = 0; k < ids.length; k++) {
                    for (var v = 0; v < (<any>self.$scope).FilteredPlanHotspots.length; v++) {
                        if ((<any>self.$scope).FilteredPlanHotspots[v].Dto.BeaconuuId == ids[k]) {
                            beaconuuIds.push((<any>self.$scope).FilteredPlanHotspots[v].Dto.BeaconuuId);
                        }
                    }
                }
                for (var k = 0; k < beaconuuIds.length; k++) {
                    for (var v = 0; v < (<any>self.$scope).FilteredPlanHotspots.length; v++) {
                        if ((<any>self.$scope).FilteredPlanHotspots[v].Dto.BeaconuuId == beaconuuIds[k]) {
                           (<any>self.$scope).FilteredPlanHotspots.splice(v, 1);
                        }
                    }
                }
                (<any>jQuery(elem)).removeClass("spot-touched");
            }
            else {
                (<any>jQuery(elem)).addClass("spot-touched");
                for (var t = 0; t < self.$scope.CurrentPlanHotspots.length; t++) {
                    if (self.$scope.CurrentPlanHotspots[t].Dto.HotspotDisplayTypeId == spotDisplayType.Id) {
                        hp = self.$scope.CurrentPlanHotspots[t].Dto;
                        (<any>self.$scope).FilteredPlanHotspots.push(self.$scope.CurrentPlanHotspots[t]);
                        for (var j = 0; j < self.$scope.CurrentPlanHotspots.length; j++) {
                            if (self.$scope.CurrentPlanHotspots[j].Dto.Id != hp.Id && self.$scope.CurrentPlanHotspots[j].Dto.BeaconuuId == hp.Id) {
                                (<any>self.$scope).FilteredPlanHotspots.push(self.$scope.CurrentPlanHotspots[j]);
                            }
                        }
                    }
                }
            }

            fabric.Object.prototype.selectable = true;
            self.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                element.visible = false;
            });
            var obj = self.canvas.getObjects();
            for (var t = 0; t < obj.length; t++) {
                for (var j = 0; j < (<any>self.$scope).FilteredPlanHotspots.length; j++) {
                    if (obj[t] == (<any>self.$scope).FilteredPlanHotspots[j].FabricJSObject) {
                        obj[t].visible = true;
                    }
                }
            }      
            if ((<any>jQuery('.spot-touched')).length == 0) {
                self.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                    element.visible = true;
                });
            }
            self.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                element.selectable = false;
            });
            self.canvas.renderAll();
        }

        customizeObject() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            var obj: Models.Hotspot = self.getSelectedHotspot();
            if (obj) {
                scope.SelectedHotspot = obj;
                scope.SelectedHotspot.CustomProperties = {
                    LineColor: obj.DisplayDetails.Color,
                    CircleColor: obj.DisplayDetails.Color,
                    LineSize: obj.DisplayDetails.Size.width,
                    CircleSize: obj.DisplayDetails.Size.width,
                };
                (<any>jQuery("#customize-object")).modal("show");
            }
        }

        updateCustomizeObject() {
            debugger
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            var obj: Models.Hotspot = self.getSelectedHotspot();
            var HotspotCustomPropertiesDto = {
                "BeaconuuId": obj.Dto.Id,
                "LineSize": obj.CustomProperties.LineSize,
                "LineColor": obj.CustomProperties.LineColor,
                "CircleSize": obj.CustomProperties.CircleSize,
                "CircleColor": obj.CustomProperties.CircleColor
            };
            (<any>scope).PinnedLineColor = obj.CustomProperties.LineColor;
            (<any>scope).PinnedLineSize = obj.CustomProperties.LineSize;
            TKWApp.Data.DataManager.getFunction("UpdateHotpotDisplayDetail").execute(HotspotCustomPropertiesDto).then((data) => {
                var hps: Models.Hotspot[] = scope.CurrentPlanHotspots;
                for (var i = 0; i < hps.length; i++) {
                    if (hps[i].Dto.Id == data.Id) {
                        hps[i].Dto.DisplayDetails = data.DisplayDetails;
                        hps[i].DisplayDetails = JSON.parse(data.DisplayDetails);
                        (<PlanController>scope.Controller).canvas.remove(hps[i].FabricJSObject);
                        hps[i].FabricJSObject = null;
                        (<PlanController>scope.Controller).initFabricHotspot(hps[i]);
                        (<PlanController>scope.Controller).canvas.renderAll();
                    }
                }
            }, (response) => {
            });
        }

        customizePinedObjects() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            var obj: Models.Hotspot = self.getSelectedHotspot();
            if (obj) {
                scope.SelectedHotspot = obj;
                var hps: Models.Hotspot[] = scope.CurrentPlanHotspots;
                var lineColor = "", circleColor = "", lineSize = 1, circleSize = 8;
                if (hps) {
                    for (var i = 0; i < hps.length; i++)
                    {
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
                (<any>jQuery("#customize-pined-objects")).modal("show");
            }
        }

        updatePinedObjectCustomProperties() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            var obj: Models.Hotspot = self.getSelectedHotspot();

            var HotspotCustomPropertiesDto = {
                "BeaconuuId": obj.Dto.Id,
                "LineSize": obj.CustomProperties.LineSize,
                "LineColor": obj.CustomProperties.LineColor,
                "CircleSize": obj.CustomProperties.CircleSize,
                "CircleColor": obj.CustomProperties.CircleColor
            };
            (<any>scope).PinnedLineColor = obj.CustomProperties.LineColor;
            (<any>scope).PinnedLineSize = obj.CustomProperties.LineSize;
            TKWApp.Data.DataManager.getFunction("UpdateHotpotsDisplayDetails").execute(HotspotCustomPropertiesDto).then((data) => {
                if (data && data.length > 0) {
                    scope.IsLoading = true;
                    scope.$apply();
                    //localStorage.setItem("Reload", "true");
                    window.location.href = "/plan?id=" + scope.CurrentPlan.Id;
                    return;
                }
            }, (response) => {
            });
        }

        toggleEditMode() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
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
                        var fObjs: Array<fabric.IObject> = self.canvas.getObjects();
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
                        (<any>orgImg).width = (<any>orgImg).width * fac;
                        (<any>orgImg).height = (<any>orgImg).height * fac;
                        self.canvas.setBackgroundImage(orgImg, null);
                        self.canvas.setWidth((<any>orgImg).width);
                        self.canvas.setHeight((<any>orgImg).height);
                        self.canvas.renderAll();
                    }
                }
                (<any>scope).IsUnPinAction = false;
                (<any>scope).PinAct = false;
                (<any>scope).IsPinAction = false;
                (<any>scope).HasSelectedSpot = false;
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
        }

        loadPlan(id) {
            var self = this;
            this.$scope.IsLoading = true;
            TKWApp.Data.DataManager.Collections["BuildingPlans"].find(id).then((data) => {
                self.$scope.CurrentPlan = data;
                self.$scope.BuildingId = data.BuildingId;
                // init fabric
                self.initFabric(() => {
                    // init hotspots
                    self.$scope.CurrentPlanHotspots = [];

                    for (var j = 0; j < data.Hotspots.length; j++) {

                        var hotspot = new Models.Hotspot(data.Hotspots[j]);
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
                (<any>self.$scope).toggleEditMode();
                
            }, function (error) {
                alert(JSON.stringify(error));
                self.$scope.IsLoading = false;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.$scope.$apply();
            });
        }

        reloadPlan() {
            var self = this;
            localStorage.setItem("Reload", "true");
            window.location.href = "/plan?id=" + (<any>self).Controller.PlanId;
        }
        refreshPlan() {
            var self = this;
            window.location.href = "/plan?id=" + (<any>self).Controller.PlanId;
        }

        loadOtherPlans() {
            var self = this;

            var query: TKWApp.Data.Query = new TKWApp.Data.Query();
            query.and().eq("BuildingId", (<any>self).BuildingId);
            TKWApp.Data.DataManager.Collections["BuildingPlans"].search(query).then((data) => {

                (<any>self).OtherViews = data;
                (<any>self).$apply();
                (<any>jQuery("#choose-view-modal")).modal("show");

            }, function (success) {
            }, function (error) {
                alert(JSON.stringify(error));
            });
        }
        loadDetails() {
            var scope = this;
            (<any>scope).updatePlanInfo = jQuery.extend(true, {},(<any>scope).CurrentPlan);
            (<any>jQuery("#edit-plan-info")).modal("show");
        }  
        editPlanDetails() {
            var scope: RapApp.Models.ISingleBuilding = <RapApp.Models.ISingleBuilding><any>this;
            (<any>scope).IsSaving = true;
            TKWApp.Data.DataManager.Collections["BuildingPlans"].edit((<any>scope).updatePlanInfo, "EditDetails").then(function (data) {
            }, function (success) {
                if (success.status == 200) {
                    (<any>scope).CurrentPlan.Name = (<any>scope).updatePlanInfo.Name;
                    (<any>scope).CurrentPlan.Description = (<any>scope).updatePlanInfo.Description;
                    (<any>scope).IsSaving = false;
                    (<any>jQuery("#edit-plan-info")).modal("hide");
                    (<any>scope).$apply();
                }
                else {
                    (<any>scope).IsSaving = false;
                    (<any>jQuery("#edit-plan-info")).modal("hide");
                    (<any>jQuery("#saveSiteFailure")).click();
                }
            }, function (error) {
                (<any>scope).IsSaving = false;
                alert(JSON.stringify(error));
                (<any>jQuery("#saveSiteFailure")).click();
            });
        }                                                                    

        loadHotspotTypes() {
            var self = this;
            (<any>self.$scope).HotspotDisplayTypes = [];
            (<any>self.$scope).HotspotPoints = [];
            (<any>self.$scope).PinHotspots = [];
            TKWApp.Data.DataManager.Collections["HotspotDisplayTypes"].search(null).then((data) => {
                $.each(data, function (i, item) {
                    if (item.Type == 0) {
                        self.$scope.HotspotDisplayTypes.push(item);
                    }
                    else if (item.Type == 1) {
                        (<any>self.$scope).HotspotPoints.push(item);
                    }
                    else {
                        (<any>self.$scope).PinHotspots.push(item);
                    }
                });
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.$scope.$apply();
            }, (error) => {
                alert(JSON.stringify(error));
            });

            TKWApp.Data.DataManager.Collections["HotspotActionTypes"].search(null).then((data) => {

                self.$scope.HotspotActionTypes = data;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.$scope.$apply();
            }, (error) => {
                alert(JSON.stringify(error));
            });
        }

        getPlanImage(plan: any) {
            var fileLink = RapApp.FileUtils.getImageUrl(plan.PlanFile.BucketPath, plan.PlanFile.BucketName, plan.PlanFile.FileName);
            return fileLink;
        }

        getSpotFileUrl(spotFile: any) {
            if (!spotFile) return "";
            var fileLink = RapApp.FileUtils.getImageUrl(spotFile.BucketPath, spotFile.BucketName, spotFile.FileName);
            return fileLink;
        }

        getSpotFileType(spotFile: any) {
            if (!spotFile) return "";
            var type = FileUtils.getFileType(spotFile.FileName);
            return type;
        }

        isSpotFileType(spotFile: any, fType: string): boolean {
            var type = FileUtils.getFileType(spotFile.FileName) == fType;
            return type;
        }

        getHotspotDisplayTypeImage(displayType: RapApp.Models.IHotspotDisplayType): string {
            return RapApp.FileUtils.getHotspotDisplayImage(displayType.FileName);
        }
       
         // Manage hotspots
        createHotspot(displayType: RapApp.Models.IHotspotDisplayType, posX: number, posY: number, width: number, height: number, color: string = null, posX1: number = null, posY1: number = null,
            posX2: number = null, posY2: number = null, bId: string = null, isPin: boolean = true) {
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
            var hotspotDTO: Models.IHotspot = {
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
            var spot = new Models.Hotspot(hotspotDTO);
            var self = this;
            //self.initFabricHotspot(spot);
            //return;
            TKWApp.Data.DataManager.Collections["Hotspots"].create(hotspotDTO).then((data) => {
                // hotspot created
                // we need to add it to the plan as plan
                (<any>self.$scope.CurrentPlan).Hotspots.push(data);

                // create new hotspot object
                var spot = new Models.Hotspot(data);
                // for now just add it to the list
                self.$scope.CurrentPlanHotspots.push(spot);
                debugger
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
            }, (error) => {
                alert(JSON.stringify(error));
            });
        }

        removeHotspotFile(item) {
            var scope: RapApp.Models.ISinglePlan = <RapApp.Models.ISinglePlan><any>this;
            TKWApp.Data.DataManager.Collections["HotspotFiles"].delete(item.Id).then(function (data) { }, function (success) {
                (<any>scope).SelectedHotspot.Dto.Files.splice((<any>scope).SelectedHotspot.Dto.Files.indexOf(item), 1);
                scope.$apply();
                (<any>jQuery("#saveHotSpotSuccess")).click();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });
        }

        deleteSelectedSpot() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
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
                    .then((data) => {
                    }, (success) => {
                        if (dto.BeaconuuId == dto.Id) {
                            (<any>scope).reloadPlan();
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
                        (<any>jQuery("#delete-spot-modal")).modal("hide");
                        scope.$apply();
                        // close the modal
                        (<any>jQuery("#saveHotSpotSuccess")).click();
                    }, (error) => {
                        alert(JSON.stringify(error));
                        // close the modal
                        (<any>jQuery("#delete-spot-modal")).modal("hide");
                    });
            }
            else {
                (<any>jQuery("#delete-spot-modal")).modal("hide");
            }
        }

        hotspotActionTypeAllowsAttachment() {
            if ($("#select-clients option[value='1']").attr("selected"))
                return false;
            else
                return true;
        }

        reloadHotspot(hotspot) {
            TKWApp.Data.DataManager.Collections["Hotspots"].find(hotspot.Dto.Id).then((data) => {
                hotspot.Dto = data;
            }, (error) => {
            });
        }

        updateSelectedHotspot() {
            var scope: RapApp.Models.ISinglePlan = <RapApp.Models.ISinglePlan><any>this;
            scope.IsSaving = true;
            var displayDetails = JSON.parse(scope.SelectedHotspot.Dto.DisplayDetails);

            var textHP: boolean = false;
            if (isTextHp(scope.SelectedHotspot)) {
                textHP = true;
                if ((<any>scope).selectedTextColor)
                    displayDetails.Color = (<any>scope).selectedTextColor.id;
                if ((<any>scope).selectedBgColor)
                    displayDetails.ForeColor = (<any>scope).selectedBgColor.id;
                if ((<any>scope).SelectedHotspot.Dto.Width)
                    displayDetails.Size.width = (<any>scope).SelectedHotspot.Dto.Width / (<PlanController>scope.Controller).canvas.getWidth();
                if ((<any>scope).SelectedHotspot.Dto.Height)
                    displayDetails.Size.height = (<any>scope).SelectedHotspot.Dto.Height / (<PlanController>scope.Controller).canvas.getHeight();
                if ((<any>scope).SelectedHotspot.Dto.FontSize)
                    displayDetails.FontSize = (<any>scope).SelectedHotspot.Dto.FontSize;
                if ((<any>scope).SelectedHotspot.Dto.TextAlign)
                    displayDetails.TextAlign = (<any>scope).selectedTextAlignment;
                scope.SelectedHotspot.Dto.DisplayDetails = JSON.stringify(displayDetails);
            }
            else {
                scope.SelectedHotspot.Dto.DisplayDetails =scope.SelectedHotspot.Dto.DisplayDetails;
            }

            TKWApp.Data.DataManager.Collections["Hotspots"].update(scope.SelectedHotspot.Dto).then(function (data) {
                /*file upload*/
                if (scope.AddHotspotModel.Uploader.files.length > 0) {
                    var uploadUrl: string = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot/UploadFiles";
                    var files = scope.AddHotspotModel.Uploader.files;
                    for (var i = 0; i < files.length; i++) {
                        var progress: TKWApp.Services.OperationProgress = scope.AddHotspotModel.Uploader.uploadFile(scope.AddHotspotModel.Uploader.files[i],
                            uploadUrl,
                            {
                                Name: scope.AddHotspotModel.Uploader.files[i].name,
                                Description: "",
                                HotspotId: scope.SelectedHotspot.Dto.Id,
                                HotspotActionTypeId: scope.SelectedHotspot.Dto.HotspotActionTypeId
                            });
                        progress.progress((args) => {
                        });
                        progress.finished((data) => {
                            if (i == files.length) {
                                scope.IsSaving = false;
                                (<PlanController>scope.Controller).reloadHotspot(scope.SelectedHotspot);
                                (<any>jQuery("#edit-spot-modal")).modal("hide");
                                (<any>jQuery("#saveHotSpotSuccess")).click();
                            }
                        });
                        progress.error((err) => {
                            scope.IsSaving = false;
                            (<any>jQuery("#edit-spot-modal")).modal("hide");
                            (<any>jQuery("#saveHotSpotFailure")).click();
                        });
                    }
                }
                else {
                    scope.IsSaving = false;
                    scope.SelectedHotspot.Dto.DisplayDetails = data.DisplayDetails;
                    scope.SelectedHotspot.DisplayDetails = JSON.parse(data.DisplayDetails);
                    (<PlanController>scope.Controller).canvas.remove(scope.SelectedHotspot.FabricJSObject);
                    scope.SelectedHotspot.FabricJSObject = null;
                    (<PlanController>scope.Controller).initFabricHotspot(scope.SelectedHotspot);
                    if (!textHP)
                        (<any>jQuery("#edit-spot-modal")).modal("hide");
                    else
                        (<any>jQuery("#edit-spot-modal-text")).modal("hide");
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
                (<any>jQuery("#saveHotSpotFailure")).click();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
                (<any>jQuery("#saveHotSpotFailure")).click();
            });
        }

        editSelectedHotspot() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            var currentObject = self.canvas.getActiveObject();

            scope.SelectedHotspot = null;
            // seach the spot with this object
            for (var i = 0; i < scope.CurrentPlanHotspots.length; i++) {
                if (scope.CurrentPlanHotspots[i].FabricJSObject == currentObject) {
                    // found current selected object
                    scope.SelectedHotspot = scope.CurrentPlanHotspots[i];
                    if (!isTextHp(scope.SelectedHotspot)) {
                        (<any>jQuery("#edit-spot-modal")).modal("show");
                    }
                    else {
                        (<any>scope).SelectedHotspot.Dto.Width = (scope.SelectedHotspot.DisplayDetails.Size.width * self.canvas.getWidth()).toFixed(0);
                        (<any>scope).SelectedHotspot.Dto.Height = (scope.SelectedHotspot.DisplayDetails.Size.height * self.canvas.getHeight()).toFixed(0);
                        (<any>scope).SelectedHotspot.Dto.FontSize = scope.SelectedHotspot.DisplayDetails.FontSize != null ? scope.SelectedHotspot.DisplayDetails.FontSize : 18;
                        (<any>scope).SelectedHotspot.Dto.TextAlign = scope.SelectedHotspot.DisplayDetails.TextAlign != null ? scope.SelectedHotspot.DisplayDetails.TextAlign : 'left';
                        if (scope.SelectedHotspot.DisplayDetails.Color) {
                            for (var t = 0; t < (<any>scope).Colors.length; t++) {
                                if ((<any>scope).Colors[t].id == scope.SelectedHotspot.DisplayDetails.Color) {
                                    (<any>scope).selectedTextColor = (<any>scope).Colors[t];
                                    break;
                                }
                            }
                        }
                        if (scope.SelectedHotspot.DisplayDetails.TextAlign) {
                            for (var t = 0; t < (<any>scope).TextAlignments.length; t++) {
                                if ((<any>scope).TextAlignments[t] == scope.SelectedHotspot.DisplayDetails.TextAlign) {
                                    (<any>scope).selectedTextAlignment = (<any>scope).TextAlignments[t];
                                    break;
                                }
                            }
                        }
                        if (scope.SelectedHotspot.DisplayDetails.ForeColor) {
                            for (var t = 0; t < (<any>scope).Colors.length; t++) {
                                if ((<any>scope).Colors[t].id == scope.SelectedHotspot.DisplayDetails.ForeColor) {
                                    (<any>scope).selectedBgColor = (<any>scope).Colors[t];
                                    break;
                                }
                            }
                        }

                        (<any>jQuery("#edit-spot-modal-text")).modal("show");
                    }
                    break;
                }
            }
            if (!scope.SelectedHotspot) {
                (<any>jQuery("#edit-spot-modal")).modal("hide");
            }

            /*file upload*/
            scope.AddHotspotModel = new RapApp.Models.BuildHotspotUploadModel(
                <HTMLInputElement>document.getElementById("fuBuildingHotspot"),
                <HTMLImageElement>document.getElementById("fuBuildingHotspotPreview")
            );
            scope.AddHotspotModel.Description = "Building image";
            scope.AddHotspotModel.BuildingId = scope.CurrentPlan.Id;

            scope.AddHotspotModel.Uploader.clearImagePreview(<HTMLInputElement>document.getElementById("fuBuildingHotspot"),
                <HTMLImageElement>document.getElementById("fuBuildingHotspotPreview")
            );
            //self.loadHotspotTypes();
            /*file upload end*/
        }

        getSelectedHotspot() {
            var self: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var currentObject = (<any>self).canvas.getActiveObject();
            // seach the spot with this object
            for (var i = 0; i < (<any>self).$scope.CurrentPlanHotspots.length; i++) {
                if ((<any>self).$scope.CurrentPlanHotspots[i].FabricJSObject == currentObject) {
                    return (<any>self).$scope.CurrentPlanHotspots[i];
                }
            }
        }

        getLastPinHotspot() {
            var self: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var t = (<any>self).$scope.CurrentPlanHotspots.length;
            while (t > 0) {
                if ((<any>self).$scope.CurrentPlanHotspots[t - 1].Dto.HotspotDisplayType.Type == 2 ||
                    (<any>self).$scope.CurrentPlanHotspots[t - 1].Dto.HotspotDisplayType.Type == 3) {
                    return (<any>self).$scope.CurrentPlanHotspots[t - 1];
                    break;
                }
                t--;
            }
        }

        undoPin() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            var obj = self.getSelectedHotspot();
            if (obj) {
                TKWApp.Data.DataManager.Collections["Hotspots"].edit(null, "UnPin?id=" + obj.Dto.BeaconuuId)
                    .then((data) => {
                    }, (success) => {
                        if (success.status == 200) {
                            scope.IsLoading = true;
                            scope.$apply();
                            (<any>scope).reloadPlan();
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
                            (<any>scope).IsUnPinAction = false;
                            (<any>scope).PinAct = false;
                            // enable canvas object selection
                            fabric.Object.prototype.selectable = true;
                            if (self.canvas) {
                                self.canvas.forEachObject(function (o) {
                                    if (o.get('type') != 'line' && o.get('type') != 'circle')
                                        o.selectable = true;
                                });
                                if (scope.CurrentPlanHotspots) {
                                    var fObjs: Array<fabric.IObject> = self.canvas.getObjects();
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
                    }, (error) => {
                        alert(JSON.stringify(error));
                    });
            }
        }

        setPin() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
            (<any>scope).PinAct = true;
            (<any>scope).IsPinAction = true;
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
            for (var i = 0; i < (<any>scope).PinHotspots.length; i++) {
                if ((<any>scope).PinHotspots[i].Type == 3) {
                    hotSpCircle = (<any>scope).PinHotspots[i];
                    break;
                }
            }
            var size = 8;
            if (self.hashPinedHashTable[sel.Dto.Id]) {
                size = 0;
            }
            (<any>self).createHotspot(hotSpCircle, centerX, centerY, size, size, color, null, null, null, null, sel.Dto.Id, true);
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
        }

        reloadSetPin() {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            var self = <PlanController>scope.Controller;
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
            for (var i = 0; i < (<any>scope).PinHotspots.length; i++) {
                if ((<any>scope).PinHotspots[i].Type == 3) {
                    hotSpCircle = (<any>scope).PinHotspots[i];
                    break;
                }
            }
            var doPin = false;
            if (!self.hashPinedHashTable[sel.Dto.Id]) {
                doPin = true;
            }
            (<any>self).createHotspot(hotSpCircle, centerX, centerY, 0, 0, color, null, null, null, null, sel.Dto.Id, doPin);
        }
      

        // CANVAS UTILS
        initFabric(successFunction: Function) {
            var self = this;
            // initialize canvas 
            this.canvas = new fabric.Canvas('respondCanvas'); 
            var g = document.getElementById("canv-container");
            g.addEventListener("touchstart", (<any>this).dropHp, false);
            var wd: number = 0.8 * $(window).width();
            var ht: number = wd * 9 / 16;
            var wd = g.clientWidth;
            var ht = g.clientHeight;
            this.canvas.setWidth(wd);
            this.canvas.setHeight(ht);


            this.initialCanvasLeft = document.getElementById("respondCanvas").getBoundingClientRect().left;        
            // set background image
            fabric.Image.fromURL(this.getPlanImage(this.$scope.CurrentPlan), (img: fabric.IImage) => {
                // compute the width and height of the background
                // recompote canvas size
                var width = img.width;
                var height = img.height;

                if ((<any>this.$scope.CurrentPlan).CanUseFullCanvas) {
                    var ratio = (this.canvas.getWidth()) / width;
                    width = this.canvas.getWidth();
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
                if (successFunction) successFunction();
            });

            // set up canvas events
            this.canvas.on("mouse:down", (ev: any) => {
                // if the plan is in edit mode, we need to disregard this
                if (self.$scope.EditMode && !(<any>self).$scope.PinAct)
                    return;
                else if (self.$scope.EditMode && (<any>self).$scope.PinAct) {
                    var sel: Models.Hotspot = (<any>self).getSelectedHotspot();
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
                                color = (<any>this.$scope).PinnedLineColor;
                            }
                            if (sel.Dto.HotspotDisplayType.Type == 1 && (<any>this.$scope).PinnedLineColor != "#000000") {
                                color = (<any>this.$scope).PinnedLineColor;
                            }
                            var c = origPin.FabricJSObject.getCenterPoint();
                            centerX = c.x;
                            centerY = c.y;
                            var isNew: boolean = true;
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
                                strokeWidth: (<any>this.$scope).PinnedLineSize,
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
                            (<any>self.$scope).IsUnPinAction = true;
                            (<any>self.$scope).$apply();
                            self.canvas.add(self.drawedObject);
                            self.drawedObject.sendToBack();
                            self.drawedObject.moveTo(0);
                            self.drawedObject.sendBackwards(true);
                            self.canvas.renderAll();
                            if (isNew) {
                                var hotSpLine;
                                for (var i = 0; i < (<any>self.$scope).PinHotspots.length; i++) {
                                    if ((<any>self.$scope).PinHotspots[i].Type == 2) {
                                        hotSpLine = (<any>self.$scope).PinHotspots[i];
                                        break;
                                    }
                                }
                                (<any>self).createHotspot(hotSpLine, centerX, centerY, (<any>this.$scope).PinnedLineSize, 1, color, null, null, null, null, sel.Dto.Id, false);
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
                            if (self.$scope.CurrentPlanHotspots[i].FabricJSObject == <fabric.IObject><any>object) {
                                // found the object
                                // we should set the selected hotspot
                                // and show the modal for the selected hotspot
                                self.$scope.ActiveHotspot = self.$scope.CurrentPlanHotspots[i];
                                self.$scope.ActiveHotspot.initActiveFile();
                                self.$scope.$apply();
                                // show dialog
                                (<any>jQuery("#view-spot-modal")).modal("show");
                                break;
                            }
                        }
                    }
                }
            });
            this.canvas.on("mouse:up", (ev: any) => {
                if (self.drawedObject) {
                    //update onj to db
                    var sel = (<any>self).getSelectedHotspot();
                    if (!sel)
                        return;
                    if (sel.Dto.HotspotDisplayType.Type > 1) {
                        self.$scope.HasSelectedSpot = false;
                        self.$scope.$apply();
                        return;
                    }
                    if (self.hashPinedLineTable2[sel.Dto.Id]) {
                        var origPin = self.hashPinedHashTable[sel.Dto.Id];
                        var dto: RapApp.Models.Hotspot = self.hashPinedLineTable2[sel.Dto.Id];
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
                                    centerX1 = centerX1 / this.canvas.getWidth();
                                }
                                if (centerY1 > 1) {
                                    centerY1 = centerY1 / this.canvas.getHeight();
                                }
                                if (centerX2 > 1) {
                                    centerX2 = centerX2 / this.canvas.getWidth();
                                }
                                if (centerY2 > 1) {
                                    centerY2 = centerY2 / this.canvas.getHeight();
                                }

                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.x1 = centerX1;
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.x2 = centerX2;

                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.y1 = centerY1;
                                self.$scope.CurrentPlanHotspots[i].DisplayDetails.Coords.y2 = centerY2;
                                // stirngify to dto
                                self.$scope.CurrentPlanHotspots[i].Dto.DisplayDetails = JSON.stringify(self.$scope.CurrentPlanHotspots[i].DisplayDetails);
                                // save to storage
                                TKWApp.Data.DataManager.Collections["Hotspots"].update(self.$scope.CurrentPlanHotspots[i].Dto)
                                    .then((data) => {

                                    }, (error) => {
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
            this.canvas.on('mouse:move', (e: fabric.IEvent) => {
                if (self.$scope.EditMode && (<any>self).$scope.PinAct) {
                    if (!self.drawedObject) {
                        return;
                    }
                    var sel = (<any>self).getSelectedHotspot();
                    if (sel)
                    {
                        (<any>self).$scope.IsUnPinAction = true;
                        if (self.hashPinedHashTable[sel.Dto.Id]) {
                            var pointer = self.canvas.getPointer(e.e);
                            self.drawedObject.set({ x2: pointer.x, y2: pointer.y });

                            self.drawedObject.bringForward(true);
                            self.drawedObject.bringToFront();
                            self.canvas.renderAll()
                        }
                    }
                } 
            });
            this.canvas.on('object:selected', (ev) => {
                (<any>this.$scope).HideEditSpot = false;
                (<any>this.$scope).ShowCustomizeObject = false;
                (<any>this.$scope).PinnedLineColor = "#000000";
                (<any>this.$scope).PinnedLineSize = 3;
                if (!self.$scope.EditMode)
                    return;
                var sel = (<any>self).getSelectedHotspot();
                if (!sel) {
                    (<any>this.$scope).IsUnPinAction = false;
                    (<any>this.$scope).PinAct = false;
                    (<any>this.$scope).IsPinAction = false;
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

                    (<any>this.$scope).HideEditSpot = true;
                }
                // show delete object button
                $('#main').width('100%');
                $('#sitekey').width('0%');
                $('#sitekey').hide();
                $("#sitekeyPoint").width('0%')
                $('#sitekeyPoint').hide();
                var doPin: boolean = false;
                if (sel) {
                    if (sel.Dto.Id == sel.Dto.BeaconuuId) {
                        (<any>this.$scope).PinAct = true;
                        (<any>this.$scope).IsPinAction = true;
                        doPin = true;
                    }
                    if (sel.Dto.HotspotDisplayType.Type <= 1) {
                        (<any>this.$scope).IsPinAction = true;
                        if (!self.hashPinedLineTable[sel.Dto.Id]) {
                            (<any>this.$scope).IsUnPinAction = false;
                        }
                    }
                }
                if (doPin) {
                    (<any>this.$scope).reloadSetPin();
                    var hps: Models.Hotspot[] = self.$scope.CurrentPlanHotspots;
                    if (hps) {
                        for (var i = 0; i < hps.length; i++) {
                            if (hps[i].Dto.BeaconuuId == sel.Dto.Id && hps[i].Dto.HotspotDisplayType.Type == 2) {
                                (<any>this.$scope).PinnedLineColor = hps[i].DisplayDetails.Color;
                                (<any>this.$scope).PinnedLineSize = hps[i].DisplayDetails.Size.width;
                                break;
                            }
                        }
                    }
                }
                self.$scope.HasSelectedSpot = true;
                self.$scope.$apply();
            });
            this.canvas.on('selection:cleared', (ev) => {
                // hide delete object button
                (<any>this.$scope).IsUnPinAction = false;
                (<any>this.$scope).PinAct = false;
                (<any>this.$scope).IsPinAction = false;
                self.$scope.HasSelectedSpot = false;
                self.$scope.$apply();
            });
            this.canvas.on('object:modified', (ev) => {
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
                        if (
                            self.$scope.CurrentPlanHotspots[i].DisplayDetails.Position.x != normX ||
                            self.$scope.CurrentPlanHotspots[i].DisplayDetails.Position.y != normY ||
                            self.$scope.CurrentPlanHotspots[i].DisplayDetails.Size.width != normWidth ||
                            self.$scope.CurrentPlanHotspots[i].DisplayDetails.Size.height != normHeight ||
                            self.$scope.CurrentPlanHotspots[i].DisplayDetails.Rotation != rotation
                        ) {
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
                                .then((data) => {
                                }, (error) => {
                                    alert(JSON.stringify(error));
                                });
                            break;
                        }
                    }
                }
            });
        }
        // a new hotspot started dragging
        // we need to set it as current
        hotspotDragging(ev: JQueryEventObject, draggable: any, hotspotDisplayType: Models.IHotspotDisplayType) {
            var scope: Models.ISinglePlan = <Models.ISinglePlan>(<any>this).$parent;
            if (!scope.EditMode)
                return;
            scope.SelectedHotspotDisplayType = hotspotDisplayType;

        }
        // hotspot was dropped into the canvas...
        // need to create a default spot in that location
        hotspotDropped(ev: JQueryEventObject, droppable: any) {
            var scope: Models.ISinglePlan = <Models.ISinglePlan><any>this;
            // get real position
            var positionY = droppable.offset.top - document.getElementById("respondCanvas").getBoundingClientRect().top;
            var positionX = droppable.offset.left - document.getElementById("respondCanvas").getBoundingClientRect().left;
            var normX = positionX / (<PlanController>scope.Controller).canvas.getWidth();
            var normY = positionY / (<PlanController>scope.Controller).canvas.getHeight();  
            var w = 60, h = 60;                                                                            
            var normWidth = w / (<PlanController>scope.Controller).canvas.getWidth();
            var normHeight = h / (<PlanController>scope.Controller).canvas.getHeight();

            fabric.Object.prototype.selectable = true;
            if (scope.Controller.canvas) {
                scope.Controller.canvas.forEachObject(function (o) {
                    o.selectable = true;
                });
            }
            (<PlanController>scope.Controller).createHotspot(scope.SelectedHotspotDisplayType, normX, normY, normWidth, normHeight);
        }

        // initializes the fabric js object for the current
        // specified hotspot, and adds it to the canvas
        initFabricHotspot(spot: Models.Hotspot) {
            // check if the spot is already on the canvas
            if (spot.FabricJSObject) return;
            // spot not on the canvas - so we ned to add it
            var img = document.createElement("img");

            var self = this;
            img.onload = () => {
                var obj: fabric.IImage = new fabric.Image(img, null);
                // set rotation
                
                obj.angle = spot.DisplayDetails.Rotation;
                if (spot.Dto.HotspotDisplayType.Type == 1) {
                    obj.width = spot.DisplayDetails.Size.width * this.canvas.getWidth();
                    obj.height = spot.DisplayDetails.Size.height * this.canvas.getHeight();
                    if (obj.width > 32)
                        obj.width = 32;
                    if (obj.height > 32)
                        obj.height = 32;
                    if (this.canvas.getWidth() < 1024) {
                        obj.width = obj.height = 16;
                    }
                }
                else {
                    // un-normalize size elements and set them
                    if ($("#sitekeyPoint").is(":hidden")) {
                        obj.width = spot.DisplayDetails.Size.width * this.canvas.getWidth();
                        obj.height = spot.DisplayDetails.Size.height * this.canvas.getHeight();
                    }
                    else {
                        obj.width = obj.width * 2;
                        obj.height = obj.height * 2;
                    }
                }
                // un-normalize position elements and set them
                obj.setPositionByOrigin(new fabric.Point(spot.DisplayDetails.Position.x * self.canvas.getWidth(),
                    spot.DisplayDetails.Position.y * self.canvas.getHeight()), "left", "top");
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
                        var formatted = CanvasUtils.wrapCanvasText(unformatted, self.canvas, spot.DisplayDetails.Size.width * this.canvas.getWidth(),
                            spot.DisplayDetails.Size.height * this.canvas.getHeight(), spot.DisplayDetails.TextAlign);
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
                var line = new fabric.Line([x1,y1,x2, y2],
                    {
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
        }

        deleteActiveFabricObject() {
            var obj = this.canvas.getActiveObject();
            this.canvas.remove(obj);
        }

        deleteFabricObject(obj) {
            this.canvas.remove(obj);
        }

        //mobile function
        pressHp(item:any) {
            var $scope = this;
            (<any>$scope).$parent.PressedHp = item;
            (<any>$scope).$parent.HasPressedHp = true;
        }

        dropHp(event: any) {
            var scope: any = angular.element(this).scope();
            if (scope.HasPressedHp) {
                var positionY = 0;
                var positionX = 0;
                var normX = positionX / (<PlanController>scope.Controller).canvas.getWidth();
                var normY = positionY / (<PlanController>scope.Controller).canvas.getHeight();
                var normWidth = 60 / (<PlanController>scope.Controller).canvas.getWidth();
                var normHeight = 60 / (<PlanController>scope.Controller).canvas.getHeight();
                (<PlanController>scope.Controller).createHotspot(scope.PressedHp, normX, normY, normWidth, normHeight);
                scope.HasPressedHp = false;
                scope.HasPressedHp = null;
            }
        }
    }

    function normalizeCanvas(canvas: fabric.ICanvas, hp: RapApp.Models.Hotspot) {
        if (canvas.getWidth() < hp.DisplayDetails.Position.x) {
            canvas.setWidth(hp.DisplayDetails.Position.x + 50);
        }
        if (canvas.getHeight() < hp.DisplayDetails.Position.y) {
            canvas.setHeight(hp.DisplayDetails.Position.y + 50);
        }
    }

    function isTextHp(hp: RapApp.Models.Hotspot) {
        if (!hp)
            return false;
        if (hp.Dto.HotspotDisplayType.FileName.indexOf("text") != -1)
            return true;
        else
            return false;
    }
}