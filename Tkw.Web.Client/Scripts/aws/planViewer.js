(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('planViewer', {
        controller: PlanViewer,
        controllerAs: 'vc',
        templateUrl: '/AngularPartials/aws/planViewer.html',
        bindings: {
            plan: '<',
            fallbackImage: '<',
            editMode: '<',
            updateHotspot: '&'
        }
    });

    PlanViewer.$inject = ['$scope', '$http'];

    function PlanViewer($scope, $http) {

        let vc = this;

        vc.parent = $scope.$parent;
        vc.viewer = null;
        vc.SelectedHotspot = {};
        vc.IsSaving = false;

        vc.$onInit = function () {

            console.log('Parent: ', vc.parent);

            getCurrentBuilding(vc.parent.BuildingId);

            $scope.$watch('vc.parent.CurrentPlan',
                function (newValue, oldValue) {
                    if (newValue) {
                        initCurrentPlan();
                    }
                });

            $scope.$watch('vc.parent.EditMode',
                function (newValue, oldValue) {
                    if (!newValue) {
                        clearHotspotFocus();
                    }
                });

            $scope.$watch('vc.SelectedHotspot',
                function (newValue, oldValue) {
                    //console.log('Selected Hotpsot: ', newValue);
                });
        };

        vc.editSelectedHotspot = function () {
            if (isTextHp(vc.parent.SelectedHotspot)) {
                $('#edit-spot-modal-text').modal('show');
            }
            else {
                $('#editHotspotModal').modal('show');
            }
        };

        vc.addHotspotAttachment = function () {
            $('#addHotspotAttachmentModal').modal('show');
        };

        vc.updateSelectedHotspot = function() {
            
            vc.IsSaving = true;

            var displayDetails = JSON.parse(vc.SelectedHotspot.Dto.DisplayDetails);
            var textHP = false;

            if (isTextHp(vc.SelectedHotspot)) {

                textHP = true;

                if (vc.selectedTextColor)
                    displayDetails.Color = vc.selectedTextColor.id;
                if (vc.selectedBgColor)
                    displayDetails.ForeColor = vc.selectedBgColor.id;
                if (vc.SelectedHotspot.Dto.Width)
                    displayDetails.Size.width = vc.SelectedHotspot.Dto.Width / 800;
                if (vc.SelectedHotspot.Dto.Height)
                    displayDetails.Size.height = vc.SelectedHotspot.Dto.Height / 600;
                if (vc.SelectedHotspot.Dto.FontSize)
                    displayDetails.FontSize = vc.SelectedHotspot.Dto.FontSize;
                if (vc.SelectedHotspot.Dto.TextAlign)
                    displayDetails.TextAlign = vc.selectedTextAlignment;

                vc.SelectedHotspot.Dto.DisplayDetails = JSON.stringify(displayDetails);
            }

            TKWApp.Data.DataManager.Collections['Hotspots'].update(vc.SelectedHotspot.Dto).then(
                function (data) {

                    /*file upload*/
                    if (false) { //vc.AddHotspotModel.Uploader.files.length > 0

                        var uploadUrl = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot/UploadFiles";
                        var files = vc.AddHotspotModel.Uploader.files;

                        for (var i = 0; i < files.length; i++) {

                            var progress = vc.AddHotspotModel.Uploader.uploadFile(scope.AddHotspotModel.Uploader.files[i],
                                uploadUrl,
                                {
                                    Name: scope.AddHotspotModel.Uploader.files[i].name,
                                    Description: "",
                                    HotspotId: scope.SelectedHotspot.Dto.Id,
                                    HotspotActionTypeId: scope.SelectedHotspot.Dto.HotspotActionTypeId
                                });
                            progress.progress(function (args) {
                            });
                            progress.finished(function(data) {
                                if (i == files.length) {
                                    scope.IsSaving = false;
                                    vc.parent.reloadHotspot(vc.SelectedHotspot);
                                    $("#editHotspotModal").modal("hide");
                                }
                            });
                            progress.error(function(err) {
                                scope.IsSaving = false;
                                $("#editHotspotModal").modal("hide");
                            });
                        }
                    }
                    else {
                        vc.IsSaving = false;
                        vc.SelectedHotspot.Dto.DisplayDetails = data.DisplayDetails;
                        vc.SelectedHotspot.DisplayDetails = JSON.parse(data.DisplayDetails);

                        if (!textHP)
                            $("#editHotspotModal").modal("hide");
                        else
                            $("#editTextHotspotModal").modal("hide");
                    }
                
                }, 
                function (sucess) {

                }, 
                function (error) {

                }
            );
        }

        vc.deleteSelectedSpot = function () {

            $('#deleteHotspotModal').modal('hide');

            var dto = vc.SelectedHotspot.Dto;

            TKWApp.Data.DataManager.Collections['Hotspots'].delete(dto.Id)
                .then(
                    function(data) {
                    },
                    function(success) {

                        var overlay = vc.viewer.getOverlayById(dto.Id);

                        if (overlay) {
                            overlay.destroy();
                        }

                        vc.SelectedHotspot = null;

                        vc.parent.reloadPlan();
                        vc.parent.$apply();
                    },
                    function(error) {
                    }
                );
        };

        vc.confirmDelete = function() {
            $('#deleteHotspotModal').modal('show');
        };

        vc.hotspotActionTypeAllowsAttachment = function() {
            if ($("#hotspotTypeSelect option[value='1']").attr("selected"))
                return false;
            else
                return true;
        }

        function getCurrentBuilding(buildingId) {
            
            var api = '/api/niv/Building/Get/' + buildingId;

            $http.get(api).then(
                function (response) {
                    
                    vc.CurrentBuilding = response.data;
                },
                function (error) {
                    console.log(error);
                }
            );
        }

        function initCurrentPlan() {
            
            var zoomSource = vc.parent.CurrentPlan.PlanFile.ZoomUrl ||
            {
                type: 'image',
                url: vc.parent.CurrentPlan.PlanFile.FileUrl || vc.parent.getPlanImage(vc.parent.CurrentPlan)
            };

            vc.viewer = OpenSeadragon({
                id: 'zoomViewer',
                prefixUrl: '/Content/Images/OpenSeaDragon/',
                tileSources: zoomSource,
                defaultZoomLevel: 1
            });

            var zoom = document.getElementById('zoomViewer');

            zoom.addEventListener('dragover',
                function (event) {
                    event.preventDefault();
                });

            zoom.addEventListener('drop',
                function (event) {

                    event.preventDefault();

                    var overlay = JSON.parse(event.dataTransfer.getData('text'));

                    if (overlay.New) {
                        createIconOverlay(overlay, event);
                    }
                    else {
                        switch (overlay.HotspotDisplayType.Type) {
                            case 0:
                                moveIconOverlay(overlay, event);
                                break;

                            case 1:
                                movePinOverlay(overlay, event);
                                break;

                            default:
                                break;
                        }
                    }

                });

            var dimensions = JSON.parse(vc.parent.CurrentPlan.PlanFile.Dimensions || '{"height":0, "width":0}');

            vc.parent.CurrentPlan.Hotspots.forEach(function(overlay) {

                switch (overlay.HotspotDisplayType.Type) {
                    case 0:
                        addIconOverlay(overlay);
                        break;

                    case 1:
                        addPinOverlay(overlay);

                    default:
                        break;
                }

            });

            $('#zoomViewerContainer').on('dragstart', '.zoom-hotspot-source', function (event) {

                var id = $(this).attr('id');
                var title = $(this).attr('title');
                var dataType = $(this).attr('data-type');
                var dataFileName = $(this).attr('data-file-name');

                var data = {
                    New: true,
                    Name: title,
                    Description: '',
                    HotspotDisplayType: {
                        Id: parseInt(id),
                        Type: parseInt(dataType),
                        FileName: dataFileName
                    },
                    DisplayDetails: "{}"
                };

                event.originalEvent.dataTransfer.setData('text', JSON.stringify(data));
            });
        }

        function createIconOverlay(overlay, event) {

            console.log('Create: ', overlay);

            var display = JSON.parse(overlay.DisplayDetails);
            var webPoint = new OpenSeadragon.Point(event.layerX - 32, event.layerY - 32);
            var viewportPoint = vc.viewer.viewport.pointFromPixel(webPoint);

            display.Point = viewportPoint;
            display.Position = {
                x: 0,
                y: 0
            };
            display.Size = {
                width: 0,
                height: 0
            };
            display.Rotation = 0;
            display.Color = null;
            display.Coords = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            };

            overlay.DisplayDetails = JSON.stringify(display);

            // save to database
            var hotspotDTO = {
                Id: null,
                HotspotDisplayTypeId: overlay.HotspotDisplayType.Id,
                HotspotDisplayType: overlay,
                HotspotActionTypeId: vc.parent.HotspotActionTypes[0].Id,
                HotspotActionType: vc.parent.HotspotActionTypes[0],
                Name: overlay.Name,
                BuildingPlanId: vc.parent.CurrentPlan.Id,
                BuildingId: vc.parent.CurrentPlan.BuildingId,
                Description: overlay.Description,
                DisplayDetails: JSON.stringify(display),
                BeaconuuId: null,
                Files: []
            };

            TKWApp.Data.DataManager.Collections['Hotspots'].create(hotspotDTO).then(
                function(data) {
                    
                    var hotspot = new RapApp.Models.Hotspot(data);

                    vc.parent.CurrentPlanHotspots.push(hotspot);

                    overlay.Id = hotspot.Dto.Id;
                    addIconOverlay(overlay);

                    setHotspotFocus(hotspot);

                    vc.editSelectedHotspot();
                },
                function(error) {
                    
                }
            );
        }

        function addIconOverlay(overlay) {
            
            var display = JSON.parse(overlay.DisplayDetails);

            var point = null;

            if (display.Point) {
                point = new OpenSeadragon.Point(display.Point.x, display.Point.y);
            }
            else {
                var elementPoint = new OpenSeadragon.Point(parseFloat(display.Position.x.toFixed(3)) * 800, parseFloat(display.Position.y.toFixed(3)) * 600 * 0.75);

                point = vc.viewer.viewport.viewerElementToViewportCoordinates(elementPoint);
                display.Point = point;
                overlay.DisplayDetails = JSON.stringify(display);
            }

            var img = document.createElement("img");
            img.id = overlay.Id;
            img.src = './Content/Images/Hotspots/' + overlay.HotspotDisplayType.FileName;
            img.width = '64';
            img.draggable = true;
            img.title = overlay.Name;
            img.classList.add('zoom-overlay');

            img.addEventListener('dragstart',
                function (event) {
                    if (!vc.parent.EditMode) {
                        event.preventDefault();
                    }
                    else {
                        event.dataTransfer.setData('text', JSON.stringify(overlay));
                    }
                });

            img.addEventListener('click', function () {

                var hotspot = getOverlayHotspot(overlay);

                if (hotspot) {

                    if (vc.parent.EditMode) {
                        setHotspotFocus(hotspot);
                    }
                    else {
                        vc.parent.ActiveHotspot = hotspot;
                        vc.parent.ActiveHotspot.initActiveFile();
                        vc.parent.$apply();

                        // show dialog
                        $('#view-spot-modal').modal('show');
                    }
                }
            });

            var mouseTracker = new OpenSeadragon.MouseTracker({
                element: img
            });

            vc.viewer.addOverlay({
                element: img,
                location: point
            });
        }

        function addPinOverlay(overlay) {

            var display = JSON.parse(overlay.DisplayDetails);

            var elementPoint = new OpenSeadragon.Point(parseFloat(display.Position.x.toFixed(3)) * 800, parseFloat(display.Position.y.toFixed(3)) * 600 * 0.75);
            var point = vc.viewer.viewport.viewerElementToViewportCoordinates(elementPoint);

            if (display.Point) {
                point = new OpenSeadragon.Point(display.Point.x, display.Point.y);
            }
            else {
                display.Point = point;
                overlay.DisplayDetails = JSON.stringify(display);
            }

            var img = document.createElement("img");
            img.id = overlay.Id;
            img.src = './Content/Images/Hotspots/' + overlay.HotspotDisplayType.FileName;
            img.width = '32';
            img.draggable = true;

            img.addEventListener('dragstart',
                function (event) {
                    if (!vc.editMode) {
                        event.preventDefault();
                    }
                    else {
                        event.dataTransfer.setData('text', JSON.stringify(overlay));
                    }
                });

            var mouseTracker = new OpenSeadragon.MouseTracker({
                element: img
            });

            vc.viewer.addOverlay({
                element: img,
                location: point
            });
        }

        function moveIconOverlay(overlay, event) {
            
            var display = JSON.parse(overlay.DisplayDetails);
            var webPoint = new OpenSeadragon.Point(event.layerX - 32, event.layerY - 32);
            var viewportPoint = vc.viewer.viewport.pointFromPixel(webPoint);

            display.Point = viewportPoint;
            overlay.DisplayDetails = JSON.stringify(display);

            vc.viewer.updateOverlay(overlay.Id, viewportPoint);

            vc.parent.updateHotspot(overlay);
        }

        function movePinOverlay(overlay, event) {

            var display = JSON.parse(overlay.DisplayDetails);
            var webPoint = new OpenSeadragon.Point(event.layerX - 16, event.layerY - 16);
            var viewportPoint = vc.viewer.viewport.pointFromPixel(webPoint);

            display.Point = viewportPoint;
            overlay.DisplayDetails = JSON.stringify(display);

            vc.viewer.updateOverlay(overlay.Id, viewportPoint);

            vc.parent.updateHotspot({ hotspot: overlay });
        }

        function getOverlayHotspot(overlay) {

            var hotspot = vc.parent.CurrentPlanHotspots.find(function (item) {
                return item.Dto.Id === overlay.Id;
            });

            return hotspot;
        }

        function setHotspotFocus(hotspot) {

            $('#zoomViewer img.zoom-overlay').css('border', '');
            $('#' + hotspot.Dto.Id).css('border', '3px solid red');

            $scope.$evalAsync(function() {
                vc.SelectedHotspot = hotspot;
            });
        }

        function clearHotspotFocus() {

            $('#zoomViewer img.zoom-overlay').css('border', '');

            $scope.$evalAsync(function () {
                vc.SelectedHotspot = null;
            });
        }

        function isTextHp(hotspot) {

            if (!hotspot) return false;

            if (hotspot.Dto.HotspotDisplayType.FileName.indexOf('text') !== -1) return true;

            return false;
        }
    }
})();