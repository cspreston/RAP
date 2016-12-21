module RapApp.Controllers {    
    export class PlanEditController extends BaseController {
        public $scope: RapApp.Models.ISinglePlanEdit;
        public PlanId: string;  
        public ZoomLevel: number;
        private drawedObject: fabric.IObject;
        private drawedObjectOrig: fabric.IPoint;
        private drawedObjects: Array<fabric.IObject>;
        private hashSweetHashTable: {};  
        // initializes the controller
        constructor($scope: RapApp.Models.ISinglePlanEdit) {  
            this.$scope = $scope;
            super();   
            this.ZoomLevel = 1;
            (<any>$scope).ShowSaveCrop = false;
            // initialize undo list
            this.drawedObjects = new Array<fabric.IObject>();
            var hashSweetHashTable = {};
            (<any>$scope).isInRole = true;
            if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                !TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                (<any>$scope).isInRole = false;
            }
            // init ui
            
            // init sliders
            var lineWidthSlider = (<any>$('.nouislider-step-line-width')).noUiSlider({
                start: 1,
                step: 1,
                range: {
                    'min': 1,
                    'max': 50
                },

            });
            (<any>$('.nouislider-step-line-width')).Link('lower').to($('.nouislider-step-line-width-value'));                     
            var transparencySlider = (<any>$('.nouislider-step-transparency')).noUiSlider({
                start: 100,
                step: 5,
                range: {
                    'min': 0,
                    'max': 100
                },

            });
            (<any>$('.nouislider-step-transparency')).Link('lower').to($('.nouislider-step-transparency-value'));                     
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
                    (<any>self.canvas).freeDrawingBrush.width = value;
                    (<any>self.canvas).freeDrawingBrush.shadowBlur = value;
                }
                else {
                    (<any>self.canvas).freeDrawingBrush.width = value;
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

            $("#drawing-color").change(() => {
                var value = $("#drawing-color").val();
                if (self.canvas.freeDrawingColor)
                    self.canvas.freeDrawingColor = value;
                else 
                    (<any>self.canvas).freeDrawingBrush.color = value;
                self.$scope.DrawingColor = value; 
                $("#line-color-val").html(value);
            });
      
            (<any>this.$scope).getPlanImage = this.getPlanImage;

            (<any>this.$scope).growCanvas = () => {

                this.ZoomLevel *= 1.2;
                $("#respondCanvas").css("zoom", this.ZoomLevel);
            };

            (<any>this.$scope).shrinkCanvas = () => {

                this.ZoomLevel /= 1.2;
                $("#respondCanvas").css("zoom", this.ZoomLevel);
            };

            // save plan
            (<any>this.$scope).saveAndReturn = () => {
                this.$scope.IsLoading = true;
                fabric.Object.prototype.selectable = false;
                // unselect selected object
                if (self.canvas) {
                    fabric.Object.prototype.selectable = false;
                    self.canvas.deactivateAll().renderAll();
                }
                var data = this.canvas.toDataURL().replace('data:image/png;base64,', '');
               
                var data = JSON.stringify(
                    {
                        Id: this.PlanId,
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
                        (<any>jQuery("#savePlanSuccess")).click();
                    },
                    error: function (err) {
                        alert(err);
                        self.$scope.IsLoading = false;
                        self.$scope.$apply();
                    }
                });
            }

            // save plan
            (<any>this.$scope).saveCrop = (fullSize: boolean) => {
                var self = this;
                if (self.drawedObjects) {
                    var i = self.drawedObjects.length;
                    for (i; i > 0; i--) {
                        var obj = self.drawedObjects[i - 1];
                        obj.selectable = false;
                    }
                }
                var obj: fabric.IObject = this.getLastCropObj();
                if (obj) {
                    var cropped = new Image();
                    obj.stroke = 'transparent';
                    obj.selectable = false;
                    obj.hasControls = false;
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.discardActiveObject();

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
                        hashSweetHashTable[<any>obj] = orgImg;
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
                
                (<any>$scope).ShowSaveCrop = false;
            }

            (<any>this.$scope).removeCrop = () => {
                var self = this;
                if (self.drawedObjects) {
                    var i = self.drawedObjects.length;
                    for (i; i > 0; i--) {
                        var obj = self.drawedObjects[i - 1];
                        obj.selectable = false;
                    }
                }
                var obj: fabric.IObject = this.getLastCropObj();
                if (obj) {
                    obj.selectable = false;
                    obj.stroke = 'transparent';
                    obj.set("fill", "#FFFFFF");
                    self.canvas.renderAll();
                }
                (<any>$scope).ShowSaveCrop = false;
            }

            // DELETE SELECTED OBJECT
            (<any>this.$scope).deleteSelected = () => {
                (<any>$scope).cancelAllTools();
                var cnv = this.canvas.getActiveObject();
                if (cnv && cnv.name) {
                    if (cnv.name.indexOf("cropObj") != -1) {
                        (<any>$scope).ShowSaveCrop = false;
                        $("#contextual_buttons").css({ "left": -50 + "px", "top": -50 + "px" });
                        var i = self.drawedObjects.length;
                        for (i; i > 0; i--) {
                            var obj = self.drawedObjects[i - 1];
                            if (obj.name === cnv.name) {
                                self.canvas.remove(obj);
                            }
                        }
                        if (hashSweetHashTable[<any>cnv]) {
                            self.canvas.setBackgroundImage(hashSweetHashTable[<any>cnv], self.canvas.renderAll.bind(self.canvas));
                        }
                    }
                }
                else {
                    this.canvas.remove(cnv);
                }
                this.canvas.renderAll();
            }

            // undo last object
            (<any>this.$scope).undoLastObject = () => {
                self.drawedObjects = this.canvas.getObjects();
                if (!self.drawedObjects || self.drawedObjects.length == 0)
                    return;
                var cnv = self.drawedObjects[self.drawedObjects.length - 1];
                if (cnv && cnv.name) {
                    if (cnv.name.indexOf("cropObj") != -1) {
                        (<any>$scope).ShowSaveCrop = false;
                        $("#contextual_buttons").css({ "left": -50 + "px", "top": -50 + "px" });
                        var i = self.drawedObjects.length;
                        for (i; i > 0; i--) {
                            var obj = self.drawedObjects[i - 1];
                            if (obj.name === cnv.name) {
                                self.canvas.remove(obj);
                                if (self.$scope.$$phase != '$apply' && self.$scope.$$phase != '$digest') self.$scope.$apply();
                            }
                        }
                        if (hashSweetHashTable[<any>cnv]) {
                            self.canvas.setBackgroundImage(hashSweetHashTable[<any>cnv], self.canvas.renderAll.bind(self.canvas));
                        }
                    }
                }
                else {
                    var obj = self.drawedObjects[self.drawedObjects.length - 1];
                    self.canvas.remove(obj);
                }
                self.canvas.renderAll();
                // cancell all tools
                (<any>this.$scope).cancelAllTools();
            };

            // cancel all selected tools
            (<any>this.$scope).cancelAllTools = () => { 
                this.$scope.FreeDrawingSelected = false;
                this.$scope.LineDrawingSelected = false;
                this.$scope.RectangleDrawingSelected = false;
                this.$scope.EllipsisDrawingSelected = false;
                this.$scope.CropSelected = false;
                this.$scope.FreeWhiteDrawingSelected = false;
                fabric.Object.prototype.selectable = true;
                this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                    element.selectable = true;
                });
            }

            (<any>this.$scope).selectTool = () => {
                (<any>$scope).FreeTool = true;
                this.$scope.FreeDrawingSelected = false;
                this.$scope.LineDrawingSelected = false;
                this.$scope.RectangleDrawingSelected = false;
                this.$scope.EllipsisDrawingSelected = false;
                this.$scope.CropSelected = false;
                this.$scope.FreeWhiteDrawingSelected = false;
                this.canvas.isDrawingMode = false;
                if (this.drawedObjects) {
                    var obj = this.drawedObjects[self.drawedObjects.length - 1];
                    if (obj)
                        this.canvas.setActiveObject(obj)
                }
            }

            // select free draw tool
            (<any>this.$scope).freeDraw = () => {
                (<any>$scope).ShowSaveCrop = false;
                (<any>$scope).FreeTool = false;
                if (!this.$scope.FreeDrawingSelected) {
                    (<any>this.$scope).cancelAllTools();
                    this.canvas.isDrawingMode = true;

                    $('.nouislider-step-line-width-value').html("1");
                    $('.noUi-origin').css("left", "0");
                    self.$scope.LineWidth = 0;
                    var value = $("#drawing-color").val();
                    if (self.canvas.freeDrawingColor)
                        self.canvas.freeDrawingColor = value;
                    else
                    (<any>self.canvas).freeDrawingBrush.color = $("#drawing-color").val();
                    (<any>self.canvas).globalCompositeOperation = 'destination-out';
                    (<any>self.canvas).freeDrawingBrush.width = 1;
                    (<any>self.canvas).freeDrawingBrush.shadowBlur = 10;
                    this.$scope.FreeDrawingSelected = true;
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.discardActiveObject();
                }
                else {
                    (<any>this.$scope).cancelAllTools();
                    this.canvas.isDrawingMode = false;
                    
                    self.canvas.renderAll();
                }
            }

            (<any>this.$scope).freeWhiteDraw = () => {
                (<any>$scope).ShowSaveCrop = false;
                (<any>$scope).FreeTool = false;
                if (!this.$scope.FreeWhiteDrawingSelected) {
                    (<any>this.$scope).cancelAllTools();
                    this.canvas.isDrawingMode = true;
                    $('.nouislider-step-line-width-value').html("25");
                    $('.noUi-origin').css("left", "50%");
                    self.$scope.LineWidth = 25;
                    this.$scope.FreeWhiteDrawingSelected = true;
                    (<any>self.canvas).freeDrawingBrush.color = "#FFFFFF";
                    (<any>self.canvas).globalCompositeOperation = 'destination-out';
                    (<any>self.canvas).freeDrawingBrush.width = self.$scope.LineWidth;
                    (<any>self.canvas).freeDrawingBrush.shadowBlur = self.$scope.LineWidth;

                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.discardActiveObject();
                }
                else {
                    (<any>this.$scope).cancelAllTools();
                    this.canvas.isDrawingMode = false;
                    self.canvas.renderAll();
                }
            }

            // select line draw tool
            (<any>this.$scope).lineDraw = () => {
                (<any>$scope).ShowSaveCrop = false;
                this.canvas.isDrawingMode = false;
                (<any>$scope).FreeTool = false;
                if (!this.$scope.LineDrawingSelected) {

                    $('.nouislider-step-line-width-value').html("1");
                    $('.noUi-origin').css("left", "0");
                    self.$scope.LineWidth = 1;

                    (<any>this.$scope).cancelAllTools();
                    this.$scope.LineDrawingSelected = true;
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.discardActiveObject();
                }
                else {
                    (<any>this.$scope).cancelAllTools();
                }
            }

            // select rect draw tool
            (<any>this.$scope).rectDraw = () => {
                (<any>$scope).ShowSaveCrop = false;
                this.canvas.isDrawingMode = false;
                (<any>$scope).FreeTool = false;
                if (!this.$scope.RectangleDrawingSelected) {
                    (<any>this.$scope).cancelAllTools();
                    $('.nouislider-step-line-width-value').html("1");
                    $('.noUi-origin').css("left", "0");
                    self.$scope.LineWidth = 1;
                    this.$scope.RectangleDrawingSelected = true;
                    fabric.Object.prototype.selectable = false;
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.discardActiveObject();
                }
                else {
                    (<any>this.$scope).cancelAllTools();
                }
            }

            // select ellipsis draw tool
            (<any>this.$scope).ellipsisDraw = () => {
                (<any>$scope).ShowSaveCrop = false;
                this.canvas.isDrawingMode = false;
                (<any>$scope).FreeTool = false;
                if (!this.$scope.EllipsisDrawingSelected) {
                    (<any>this.$scope).cancelAllTools();
                    $('.nouislider-step-line-width-value').html("1");
                    $('.noUi-origin').css("left", "0");
                    self.$scope.LineWidth = 1;
                    this.$scope.EllipsisDrawingSelected = true;
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.discardActiveObject();
                }
                else {
                    (<any>this.$scope).cancelAllTools();
                }
            }
             
            //select crop tool
            (<any>this.$scope).cropImage = () => {
                (<any>$scope).ShowSaveCrop = false;
                this.canvas.isDrawingMode = false;
                (<any>$scope).FreeTool = false;
                if (!this.$scope.CropSelected) {
                    (<any>this.$scope).cancelAllTools();
                    this.$scope.CropSelected = true;
                    (<any>$scope).ShowSaveCrop = true;
                    fabric.Object.prototype.selectable = false;
                    
                    this.canvas.forEachObject((element: fabric.IObject, index: number, arr: fabric.IObject[]) => {
                        element.selectable = false;
                    });
                    this.canvas.discardActiveObject();
                }
                else {
                   (<any>this.$scope).cancelAllTools();
                }
            }

            // get the current plan id
            this.PlanId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            this.$scope.PlanId = this.PlanId;

            // load current plan
            this.loadPlan(this.PlanId);  
        }       

        loadPlan(id) {
            var self = this;
            this.$scope.IsLoading = true;
            TKWApp.Data.DataManager.Collections["BuildingPlans"].find(id).then((data) => {

                self.$scope.CurrentPlan = data;
                self.$scope.BuildingId = data.BuildingId;

                self.$scope.IsLoading = false;
                // after a jquery async ajax call, sometimes angular does not know to refresh the html
                // this forces it to do so
                self.$scope.$apply();

                this.initFabric(() => {
                });   
                
                // catch canvas selected object event
                this.canvas.on('object:selected', (e: fabric.IEvent) => {
                    (<any>self.$scope).cancelAllTools();
                    self.$scope.SelectedObject = self.canvas.getActiveObject();
                    if (self.$scope.$$phase != '$apply' && self.$scope.$$phase != '$digest') self.$scope.$apply();
                });
                this.canvas.on('selection:cleared', (e: fabric.IEvent) => {
                    //(<any>self.$scope).cancelAllTools();
                    self.$scope.SelectedObject = null;
                    if (self.$scope.$$phase != '$apply' && self.$scope.$$phase != '$digest') self.$scope.$apply();
                });

                // in order to free draw lines/rectangles we need to hook up to the canvas events
                this.canvas.on('mouse:down', (e: fabric.IEvent) => {
                    if (!self.$scope.FreeDrawingSelected &&
                        !self.$scope.RectangleDrawingSelected &&
                        !self.$scope.EllipsisDrawingSelected &&
                        !self.$scope.LineDrawingSelected &&
                        !self.$scope.FreeWhiteDrawingSelected &&
                        !self.$scope.CropSelected)
                        return;
                    var mouse = self.canvas.getPointer(e.e);
                    var x: number = mouse.x;
                    var y: number = mouse.y;
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
                        var z: fabric.IRectOptions;

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
                        var zz: fabric.IEllipseOptions;

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
                        var z: fabric.IRectOptions;
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
                this.canvas.on('mouse:move', (e: fabric.IEvent) => {
                    if (!self.$scope.FreeDrawingSelected &&
                        !self.$scope.RectangleDrawingSelected &&
                        !self.$scope.EllipsisDrawingSelected &&
                        !self.$scope.LineDrawingSelected &&
                        !self.$scope.FreeWhiteDrawingSelected &&
                        !self.$scope.CropSelected)
                        return;
                    var pointer = self.canvas.getPointer(e.e);
                    if (self.$scope.LineDrawingSelected) {
                        if (!self.drawedObject) return;
                        self.drawedObject.set({ x2: pointer.x, y2: pointer.y });
                        self.canvas.renderAll();
                    }
                    if (self.$scope.RectangleDrawingSelected) {
                        if (!self.drawedObject) return;

                        self.drawedObject.set({ width: Math.abs(self.drawedObjectOrig.x - pointer.x) });
                        self.drawedObject.set({ height: Math.abs(self.drawedObjectOrig.y - pointer.y) });
                        self.canvas.renderAll();
                    }
                    if (self.$scope.EllipsisDrawingSelected) {
                        if (!self.drawedObject) return;

                        self.drawedObject.set({ rx: Math.abs(self.drawedObjectOrig.x - pointer.x) / 2 });
                        self.drawedObject.set({ ry: Math.abs(self.drawedObjectOrig.y - pointer.y) / 2 });
                        self.canvas.renderAll();
                    }
                    if (self.$scope.CropSelected) {
                        if (!self.drawedObject)
                            return;
                        self.drawedObject.set({ width: Math.abs(self.drawedObjectOrig.x - pointer.x) });
                        self.drawedObject.set({ height: Math.abs(self.drawedObjectOrig.y - pointer.y) });
                        (<any>self.$scope).SelectedObject = self.drawedObject;
                        self.canvas.renderAll();
                    }
                });
                this.canvas.on('mouse:up', (e: fabric.IEvent) => {
                    // add object to undo array
                    if (self.drawedObject) {
                        if (self.$scope.CropSelected) {
                            var left = (self.drawedObject.getLeft() + 10) + (<any>self.canvas.calcOffset())._offset.left;
                            var top = (self.drawedObject.getTop() + 5) + (<any>self.canvas.calcOffset())._offset.top;
                            $("#contextual_buttons").css({ "left": left + "px", "top": top + "px" });
                        }
                       
                        self.canvas.remove(self.drawedObject);
                        self.canvas.renderAll();
                        self.canvas.add(self.drawedObject);
                        self.drawedObjects.push(self.drawedObject);
                        self.drawedObject = null;
                        (<any>this.$scope).cancelAllTools();
                        (<any>this.$scope).selectTool();
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
        }      

        getPlanImage(plan: any) {
            var fileLink = RapApp.FileUtils.getImageUrl(plan.PlanThumbnailFile.BucketPath, plan.PlanThumbnailFile.BucketName, plan.PlanThumbnailFile.FileName);
            return fileLink;
        }        

        // FABRICJS UTILS
        private canvas: fabric.ICanvas;
        private initialCanvasLeft: number;

        initFabric(successFunction: Function) {
            debugger
            var self = this;
            // initialize canvas
            this.canvas = new fabric.Canvas('respondCanvas');
            // generate canvas size
            var wd: number = 0.8 * $(window).width();
            var ht: number = wd * 9 / 16;
            var g = document.getElementById("canv-container");
            var wd = g.clientWidth;
            var ht = g.clientHeight;
            this.canvas.setWidth(wd);
            this.canvas.setHeight(ht);

            this.initialCanvasLeft = document.getElementById("respondCanvas").getBoundingClientRect().left;        

            // set background image
            fabric.Image.fromURL(this.getPlanImage(this.$scope.CurrentPlan), (img: fabric.IImage) => {
                var width = img.width;
                var height = img.height;
                var ratio = (this.canvas.getWidth()) / width;
                width = this.canvas.getWidth();
                height = ratio * img.height;
                self.canvas.setHeight(height);
                self.canvas.calcOffset();
                // set background
                img.set({ width: width, height: height, originX: 'left', originY: 'top' });
                self.canvas.setBackgroundImage(img, self.canvas.renderAll.bind(self.canvas));
                if (successFunction) successFunction();

                if (successFunction) successFunction();
            });
        }
        
        getLastCropObj() {
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
        }
        // UTIL FUNCTIONS
        hexToRgb(hex:any, alpha:number) {
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
        }
        // UTIL FUNCTIONS
    }
}