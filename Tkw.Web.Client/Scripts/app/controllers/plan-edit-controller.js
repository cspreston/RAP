var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var PlanEditController = (function (_super) {
            __extends(PlanEditController, _super);
            // initializes the controller
            function PlanEditController($scope) {
                var _this = this;
                _super.call(this, $scope);
                this.$scope = $scope;
                this.ZoomLevel = 1;
                $scope.ShowSaveCrop = false;
                // initialize undo list
                this.drawedObjects = new Array();
                var hashSweetHashTable = {};
                $scope.isInRole = true;
                if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                    $scope.isInRole = false;
                }
                // init ui
                // init sliders
                var lineWidthSlider = $('.nouislider-step-line-width').noUiSlider({
                    start: 1,
                    step: 1,
                    range: {
                        'min': 1,
                        'max': 50
                    },
                });
                $('.nouislider-step-line-width').Link('lower').to($('.nouislider-step-line-width-value'));
                var transparencySlider = $('.nouislider-step-transparency').noUiSlider({
                    start: 100,
                    step: 5,
                    range: {
                        'min': 0,
                        'max': 100
                    },
                });
                $('.nouislider-step-transparency').Link('lower').to($('.nouislider-step-transparency-value'));
                // set slider value
                var self = this;
                // set the canvas state after the line width was selected
                lineWidthSlider.on('set', function () {
                    var value = parseInt($('.nouislider-step-line-width-value').html());
                    self.$scope.LineWidth = value;
                    // set line width on canvas
                    if (self.canvas.freeDrawingLineWidth)
                        self.canvas.freeDrawingLineWidth = value;
                    if (self.$scope.FreeWhiteDrawingSelected) {
                        self.canvas.freeDrawingBrush.width = value;
                        self.canvas.freeDrawingBrush.shadowBlur = value;
                    }
                    else {
                        self.canvas.freeDrawingBrush.width = value;
                    }
                });
                transparencySlider.on('set', function () {
                    var value = parseFloat($('.nouislider-step-transparency-value').html()) / 100;
                    self.$scope.FillingTransparency = value;
                });
                // set the canvas state after the color was selected
                self.$scope.LineWidth = 1;
                self.$scope.DrawingColor = "#000000";
                self.$scope.FillingColor = "#FFFFFF";
                self.$scope.FillingTransparency = 100;
                $("#drawing-color").change(function () {
                    var value = $("#drawing-color").val();
                    if (self.canvas.freeDrawingColor)
                        self.canvas.freeDrawingColor = value;
                    else
                        self.canvas.freeDrawingBrush.color = value;
                    self.$scope.DrawingColor = value;
                    $("#line-color-val").html(value);
                });
                this.$scope.getPlanImage = this.getPlanImage;
                this.$scope.growCanvas = function () {
                    _this.ZoomLevel *= 1.2;
                    $("#respondCanvas").css("zoom", _this.ZoomLevel);
                };
                this.$scope.shrinkCanvas = function () {
                    _this.ZoomLevel /= 1.2;
                    $("#respondCanvas").css("zoom", _this.ZoomLevel);
                };
                // save plan
                this.$scope.saveAndReturn = function () {
                    _this.$scope.IsLoading = true;
                    fabric.Object.prototype.selectable = false;
                    // unselect selected object
                    if (self.canvas) {
                        fabric.Object.prototype.selectable = false;
                        self.canvas.deactivateAll().renderAll();
                    }
                    var data = _this.canvas.toDataURL().replace('data:image/png;base64,', '');
                    var data = JSON.stringify({
                        Id: _this.PlanId,
                        Value: data
                    });
                    $.ajax({
                        headers: {
                            "Authorization": "Bearer " + TKWApp.Data.AuthenticationManager.AuthenticationToken.getToken(),
                        },
                        type: "POST",
                        url: TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/EditPlan/",
                        processData: false,
                        data: data,
                        contentType: "application/json; charset=utf-8",
                        success: function (msg) {
                            self.$scope.IsLoading = false;
                            self.$scope.$apply();
                            jQuery("#savePlanSuccess").click();
                        },
                        error: function (err) {
                            alert(err);
                            self.$scope.IsLoading = false;
                            self.$scope.$apply();
                        }
                    });
                };
                // save plan
                this.$scope.saveCrop = function (fullSize) {
                    var self = _this;
                    if (self.drawedObjects) {
                        var i = self.drawedObjects.length;
                        for (i; i > 0; i--) {
                            var obj = self.drawedObjects[i - 1];
                            obj.selectable = false;
                        }
                    }
                    var obj = _this.getLastCropObj();
                    if (obj) {
                        var cropped = new Image();
                        obj.stroke = 'transparent';
                        obj.selectable = false;
                        obj.hasControls = false;
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.discardActiveObject();
                        cropped.src = self.canvas.toDataURL({
                            left: obj.left,
                            top: obj.top,
                            width: obj.width * obj.scaleX,
                            height: obj.height * obj.scaleY
                        });
                        cropped.onload = function () {
                            var image = new fabric.Image(cropped, null);
                            image.left = obj.left;
                            image.top = obj.top;
                            if (fullSize) {
                                image.left = image.top = 0;
                            }
                            image.height = obj.height * obj.scaleY;
                            image.width = obj.width * obj.scaleX;
                            image.setCoords();
                            var orgImg = self.canvas.backgroundImage;
                            hashSweetHashTable[obj] = orgImg;
                            if (fullSize) {
                                var cnvWidth = self.canvas.getWidth();
                                var cnvHeight = self.canvas.getHeight();
                                var ratio = self.canvas.getWidth() / cnvWidth;
                                image.width = cnvWidth;
                                image.height = ratio * cnvHeight;
                            }
                            self.canvas.setBackgroundImage(image, null);
                            self.canvas.renderAll();
                        };
                        self.canvas.renderAll();
                    }
                    $scope.ShowSaveCrop = false;
                };
                this.$scope.removeCrop = function () {
                    var self = _this;
                    if (self.drawedObjects) {
                        var i = self.drawedObjects.length;
                        for (i; i > 0; i--) {
                            var obj = self.drawedObjects[i - 1];
                            obj.selectable = false;
                        }
                    }
                    var obj = _this.getLastCropObj();
                    if (obj) {
                        obj.selectable = false;
                        obj.stroke = 'transparent';
                        obj.set("fill", "#FFFFFF");
                        self.canvas.renderAll();
                    }
                    $scope.ShowSaveCrop = false;
                };
                // DELETE SELECTED OBJECT
                this.$scope.deleteSelected = function () {
                    $scope.cancelAllTools();
                    var cnv = _this.canvas.getActiveObject();
                    if (cnv && cnv.name) {
                        if (cnv.name.indexOf("cropObj") != -1) {
                            $scope.ShowSaveCrop = false;
                            $("#contextual_buttons").css({ "left": -50 + "px", "top": -50 + "px" });
                            var i = self.drawedObjects.length;
                            for (i; i > 0; i--) {
                                var obj = self.drawedObjects[i - 1];
                                if (obj.name === cnv.name) {
                                    self.canvas.remove(obj);
                                }
                            }
                            if (hashSweetHashTable[cnv]) {
                                self.canvas.setBackgroundImage(hashSweetHashTable[cnv], self.canvas.renderAll.bind(self.canvas));
                            }
                        }
                    }
                    else {
                        _this.canvas.remove(cnv);
                    }
                    _this.canvas.renderAll();
                };
                // undo last object
                this.$scope.undoLastObject = function () {
                    self.drawedObjects = _this.canvas.getObjects();
                    if (!self.drawedObjects || self.drawedObjects.length == 0)
                        return;
                    var cnv = self.drawedObjects[self.drawedObjects.length - 1];
                    if (cnv && cnv.name) {
                        if (cnv.name.indexOf("cropObj") != -1) {
                            $scope.ShowSaveCrop = false;
                            $("#contextual_buttons").css({ "left": -50 + "px", "top": -50 + "px" });
                            var i = self.drawedObjects.length;
                            for (i; i > 0; i--) {
                                var obj = self.drawedObjects[i - 1];
                                if (obj.name === cnv.name) {
                                    self.canvas.remove(obj);
                                    if (self.$scope.$$phase != '$apply' && self.$scope.$$phase != '$digest')
                                        self.$scope.$apply();
                                }
                            }
                            if (hashSweetHashTable[cnv]) {
                                self.canvas.setBackgroundImage(hashSweetHashTable[cnv], self.canvas.renderAll.bind(self.canvas));
                            }
                        }
                    }
                    else {
                        var obj = self.drawedObjects[self.drawedObjects.length - 1];
                        self.canvas.remove(obj);
                    }
                    self.canvas.renderAll();
                    // cancell all tools
                    _this.$scope.cancelAllTools();
                };
                // cancel all selected tools
                this.$scope.cancelAllTools = function () {
                    _this.$scope.FreeDrawingSelected = false;
                    _this.$scope.LineDrawingSelected = false;
                    _this.$scope.RectangleDrawingSelected = false;
                    _this.$scope.EllipsisDrawingSelected = false;
                    _this.$scope.CropSelected = false;
                    _this.$scope.FreeWhiteDrawingSelected = false;
                    fabric.Object.prototype.selectable = true;
                    _this.canvas.forEachObject(function (element, index, arr) {
                        element.selectable = true;
                    });
                };
                this.$scope.selectTool = function () {
                    $scope.FreeTool = true;
                    _this.$scope.FreeDrawingSelected = false;
                    _this.$scope.LineDrawingSelected = false;
                    _this.$scope.RectangleDrawingSelected = false;
                    _this.$scope.EllipsisDrawingSelected = false;
                    _this.$scope.CropSelected = false;
                    _this.$scope.FreeWhiteDrawingSelected = false;
                    _this.canvas.isDrawingMode = false;
                    if (_this.drawedObjects) {
                        var obj = _this.drawedObjects[self.drawedObjects.length - 1];
                        if (obj)
                            _this.canvas.setActiveObject(obj);
                    }
                };
                // select free draw tool
                this.$scope.freeDraw = function () {
                    $scope.ShowSaveCrop = false;
                    $scope.FreeTool = false;
                    if (!_this.$scope.FreeDrawingSelected) {
                        _this.$scope.cancelAllTools();
                        _this.canvas.isDrawingMode = true;
                        $('.nouislider-step-line-width-value').html("1");
                        $('.noUi-origin').css("left", "0");
                        self.$scope.LineWidth = 0;
                        var value = $("#drawing-color").val();
                        if (self.canvas.freeDrawingColor)
                            self.canvas.freeDrawingColor = value;
                        else
                            self.canvas.freeDrawingBrush.color = $("#drawing-color").val();
                        self.canvas.globalCompositeOperation = 'destination-out';
                        self.canvas.freeDrawingBrush.width = 1;
                        self.canvas.freeDrawingBrush.shadowBlur = 10;
                        _this.$scope.FreeDrawingSelected = true;
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.discardActiveObject();
                    }
                    else {
                        _this.$scope.cancelAllTools();
                        _this.canvas.isDrawingMode = false;
                        self.canvas.renderAll();
                    }
                };
                this.$scope.freeWhiteDraw = function () {
                    $scope.ShowSaveCrop = false;
                    $scope.FreeTool = false;
                    if (!_this.$scope.FreeWhiteDrawingSelected) {
                        _this.$scope.cancelAllTools();
                        _this.canvas.isDrawingMode = true;
                        $('.nouislider-step-line-width-value').html("25");
                        $('.noUi-origin').css("left", "50%");
                        self.$scope.LineWidth = 25;
                        _this.$scope.FreeWhiteDrawingSelected = true;
                        self.canvas.freeDrawingBrush.color = "#FFFFFF";
                        self.canvas.globalCompositeOperation = 'destination-out';
                        self.canvas.freeDrawingBrush.width = self.$scope.LineWidth;
                        self.canvas.freeDrawingBrush.shadowBlur = self.$scope.LineWidth;
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.discardActiveObject();
                    }
                    else {
                        _this.$scope.cancelAllTools();
                        _this.canvas.isDrawingMode = false;
                        self.canvas.renderAll();
                    }
                };
                // select line draw tool
                this.$scope.lineDraw = function () {
                    $scope.ShowSaveCrop = false;
                    _this.canvas.isDrawingMode = false;
                    $scope.FreeTool = false;
                    if (!_this.$scope.LineDrawingSelected) {
                        $('.nouislider-step-line-width-value').html("1");
                        $('.noUi-origin').css("left", "0");
                        self.$scope.LineWidth = 1;
                        _this.$scope.cancelAllTools();
                        _this.$scope.LineDrawingSelected = true;
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.discardActiveObject();
                    }
                    else {
                        _this.$scope.cancelAllTools();
                    }
                };
                // select rect draw tool
                this.$scope.rectDraw = function () {
                    $scope.ShowSaveCrop = false;
                    _this.canvas.isDrawingMode = false;
                    $scope.FreeTool = false;
                    if (!_this.$scope.RectangleDrawingSelected) {
                        _this.$scope.cancelAllTools();
                        $('.nouislider-step-line-width-value').html("1");
                        $('.noUi-origin').css("left", "0");
                        self.$scope.LineWidth = 1;
                        _this.$scope.RectangleDrawingSelected = true;
                        fabric.Object.prototype.selectable = false;
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.discardActiveObject();
                    }
                    else {
                        _this.$scope.cancelAllTools();
                    }
                };
                // select ellipsis draw tool
                this.$scope.ellipsisDraw = function () {
                    $scope.ShowSaveCrop = false;
                    _this.canvas.isDrawingMode = false;
                    $scope.FreeTool = false;
                    if (!_this.$scope.EllipsisDrawingSelected) {
                        _this.$scope.cancelAllTools();
                        $('.nouislider-step-line-width-value').html("1");
                        $('.noUi-origin').css("left", "0");
                        self.$scope.LineWidth = 1;
                        _this.$scope.EllipsisDrawingSelected = true;
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.discardActiveObject();
                    }
                    else {
                        _this.$scope.cancelAllTools();
                    }
                };
                //select crop tool
                this.$scope.cropImage = function () {
                    $scope.ShowSaveCrop = false;
                    _this.canvas.isDrawingMode = false;
                    $scope.FreeTool = false;
                    if (!_this.$scope.CropSelected) {
                        _this.$scope.cancelAllTools();
                        _this.$scope.CropSelected = true;
                        $scope.ShowSaveCrop = true;
                        fabric.Object.prototype.selectable = false;
                        _this.canvas.forEachObject(function (element, index, arr) {
                            element.selectable = false;
                        });
                        _this.canvas.discardActiveObject();
                    }
                    else {
                        _this.$scope.cancelAllTools();
                    }
                };
                // get the current plan id
                this.PlanId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                this.$scope.PlanId = this.PlanId;
                // load current plan
                this.loadPlan(this.PlanId);
            }
            PlanEditController.prototype.loadPlan = function (id) {
                var _this = this;
                var self = this;
                this.$scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["BuildingPlans"].find(id).then(function (data) {
                    self.$scope.CurrentPlan = data;
                    self.$scope.BuildingId = data.BuildingId;
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                    _this.initFabric(function () {
                    });
                    // catch canvas selected object event
                    _this.canvas.on('object:selected', function (e) {
                        self.$scope.cancelAllTools();
                        self.$scope.SelectedObject = self.canvas.getActiveObject();
                        if (self.$scope.$$phase != '$apply' && self.$scope.$$phase != '$digest')
                            self.$scope.$apply();
                    });
                    _this.canvas.on('selection:cleared', function (e) {
                        //(<any>self.$scope).cancelAllTools();
                        self.$scope.SelectedObject = null;
                        if (self.$scope.$$phase != '$apply' && self.$scope.$$phase != '$digest')
                            self.$scope.$apply();
                    });
                    // in order to free draw lines/rectangles we need to hook up to the canvas events
                    _this.canvas.on('mouse:down', function (e) {
                        if (!self.$scope.FreeDrawingSelected &&
                            !self.$scope.RectangleDrawingSelected &&
                            !self.$scope.EllipsisDrawingSelected &&
                            !self.$scope.LineDrawingSelected &&
                            !self.$scope.FreeWhiteDrawingSelected &&
                            !self.$scope.CropSelected)
                            return;
                        var mouse = self.canvas.getPointer(e.e);
                        var x = mouse.x;
                        var y = mouse.y;
                        if (self.$scope.LineDrawingSelected) {
                            // need to start a new line
                            //x1 = 0; y1 = 0; x2 = 100; y2 = 100;
                            self.drawedObjectOrig = new fabric.Point(x, y);
                            self.drawedObject = new fabric.Line([x, y, x, y], {
                                originX: 'center',
                                originY: 'center',
                                strokeWidth: self.$scope.LineWidth,
                                stroke: self.$scope.DrawingColor
                            });
                            self.canvas.add(self.drawedObject);
                            self.canvas.renderAll();
                        }
                        if (self.$scope.RectangleDrawingSelected) {
                            self.drawedObjectOrig = new fabric.Point(x, y);
                            var z;
                            self.drawedObject = new fabric.Rect({
                                left: x,
                                top: y,
                                width: 1,
                                height: 1,
                                fill: self.hexToRgb(self.$scope.FillingColor, self.$scope.FillingTransparency),
                                strokeWidth: self.$scope.LineWidth,
                                stroke: self.$scope.DrawingColor
                            });
                            self.canvas.add(self.drawedObject);
                            self.canvas.renderAll();
                        }
                        if (self.$scope.EllipsisDrawingSelected) {
                            self.drawedObjectOrig = new fabric.Point(x, y);
                            var zz;
                            self.drawedObject = new fabric.Ellipse({
                                left: x,
                                top: y,
                                width: 1,
                                height: 1,
                                rx: 1,
                                ry: 1,
                                fill: self.hexToRgb(self.$scope.FillingColor, self.$scope.FillingTransparency),
                                strokeWidth: self.$scope.LineWidth,
                                stroke: self.$scope.DrawingColor
                            });
                            self.canvas.add(self.drawedObject);
                            self.canvas.renderAll();
                        }
                        if (self.$scope.CropSelected) {
                            self.drawedObjectOrig = new fabric.Point(x, y);
                            var z;
                            self.drawedObject = new fabric.Rect({
                                left: x,
                                top: y,
                                width: 1,
                                height: 1,
                                fill: 'transparent',
                                stroke: '#000',
                                strokeDashArray: [2, 2],
                                name: "cropObj_" + self.drawedObjects.length,
                                hasRotatingPoint: false,
                                lockRotation: true
                            });
                            self.canvas.bringToFront(self.drawedObject);
                            self.canvas.add(self.drawedObject);
                            self.canvas.renderAll();
                        }
                    });
                    _this.canvas.on('mouse:move', function (e) {
                        if (!self.$scope.FreeDrawingSelected &&
                            !self.$scope.RectangleDrawingSelected &&
                            !self.$scope.EllipsisDrawingSelected &&
                            !self.$scope.LineDrawingSelected &&
                            !self.$scope.FreeWhiteDrawingSelected &&
                            !self.$scope.CropSelected)
                            return;
                        var pointer = self.canvas.getPointer(e.e);
                        if (self.$scope.LineDrawingSelected) {
                            if (!self.drawedObject)
                                return;
                            self.drawedObject.set({ x2: pointer.x, y2: pointer.y });
                            self.canvas.renderAll();
                        }
                        if (self.$scope.RectangleDrawingSelected) {
                            if (!self.drawedObject)
                                return;
                            self.drawedObject.set({ width: Math.abs(self.drawedObjectOrig.x - pointer.x) });
                            self.drawedObject.set({ height: Math.abs(self.drawedObjectOrig.y - pointer.y) });
                            self.canvas.renderAll();
                        }
                        if (self.$scope.EllipsisDrawingSelected) {
                            if (!self.drawedObject)
                                return;
                            self.drawedObject.set({ rx: Math.abs(self.drawedObjectOrig.x - pointer.x) / 2 });
                            self.drawedObject.set({ ry: Math.abs(self.drawedObjectOrig.y - pointer.y) / 2 });
                            self.canvas.renderAll();
                        }
                        if (self.$scope.CropSelected) {
                            if (!self.drawedObject)
                                return;
                            self.drawedObject.set({ width: Math.abs(self.drawedObjectOrig.x - pointer.x) });
                            self.drawedObject.set({ height: Math.abs(self.drawedObjectOrig.y - pointer.y) });
                            self.$scope.SelectedObject = self.drawedObject;
                            self.canvas.renderAll();
                        }
                    });
                    _this.canvas.on('mouse:up', function (e) {
                        // add object to undo array
                        if (self.drawedObject) {
                            if (self.$scope.CropSelected) {
                                var left = (self.drawedObject.getLeft() + 10) + self.canvas.calcOffset()._offset.left;
                                var top = (self.drawedObject.getTop() + 5) + self.canvas.calcOffset()._offset.top;
                                $("#contextual_buttons").css({ "left": left + "px", "top": top + "px" });
                            }
                            self.canvas.remove(self.drawedObject);
                            self.canvas.renderAll();
                            self.canvas.add(self.drawedObject);
                            self.drawedObjects.push(self.drawedObject);
                            self.drawedObject = null;
                            _this.$scope.cancelAllTools();
                            _this.$scope.selectTool();
                        }
                        else {
                            self.$scope.SelectedObject = null;
                        }
                    });
                }, function (error) {
                    alert(JSON.stringify(error));
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                });
            };
            PlanEditController.prototype.getPlanImage = function (plan) {
                var fileLink = RapApp.FileUtils.getImageUrl(plan.PlanThumbnailFile.BucketPath, plan.PlanThumbnailFile.BucketName, plan.PlanThumbnailFile.FileName);
                return fileLink;
            };
            PlanEditController.prototype.initFabric = function (successFunction) {
                var _this = this;
                debugger;
                var self = this;
                // initialize canvas
                this.canvas = new fabric.Canvas('respondCanvas');
                // generate canvas size
                var wd = 0.8 * $(window).width();
                var ht = wd * 9 / 16;
                var g = document.getElementById("canv-container");
                var wd = g.clientWidth;
                var ht = g.clientHeight;
                this.canvas.setWidth(wd);
                this.canvas.setHeight(ht);
                this.initialCanvasLeft = document.getElementById("respondCanvas").getBoundingClientRect().left;
                // set background image
                fabric.Image.fromURL(this.getPlanImage(this.$scope.CurrentPlan), function (img) {
                    var width = img.width;
                    var height = img.height;
                    var ratio = (_this.canvas.getWidth()) / width;
                    width = _this.canvas.getWidth();
                    height = ratio * img.height;
                    self.canvas.setHeight(height);
                    self.canvas.calcOffset();
                    // set background
                    img.set({ width: width, height: height, originX: 'left', originY: 'top' });
                    self.canvas.setBackgroundImage(img, self.canvas.renderAll.bind(self.canvas));
                    if (successFunction)
                        successFunction();
                    if (successFunction)
                        successFunction();
                });
            };
            PlanEditController.prototype.getLastCropObj = function () {
                var self = this;
                if (self.drawedObjects) {
                    var i = self.drawedObjects.length;
                    for (i; i > 0; i--) {
                        var obj = self.drawedObjects[i - 1];
                        if (obj.name.indexOf("cropObj") != -1)
                            return obj;
                    }
                }
                return null;
            };
            // UTIL FUNCTIONS
            PlanEditController.prototype.hexToRgb = function (hex, alpha) {
                // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
                var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                var res = result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
                if (res != null) {
                    var rgba = "rgba(" + res.r + "," + res.g + "," + res.b + "," + alpha + ")";
                    return rgba;
                }
                return null;
            };
            return PlanEditController;
        })(Controllers.BaseController);
        Controllers.PlanEditController = PlanEditController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=plan-edit-controller.js.map