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

    PlanViewer.$inject = ['$scope', '$state', '$stateParams'];

    function PlanViewer($scope, $state, $stateParams) {

        let vc = this;
        
        vc.viewer = null;

        vc.$onInit = function () {

            console.log('Plan File: ', vc.plan);
            console.log('Fallback Image: ', vc.fallbackImage);
            console.log('Edit Mode: ', vc.editMode);
            console.log('Update Hotspot: ', vc.updateHotspot);

            $scope.$watch('vc.editMode',
                function(newValue, oldValue) {
                    console.log('Edit Mode: ', vc.editMode);
                });

            var zoomSource = vc.plan.PlanFile.ZoomUrl ||
            {
                type: 'image',
                url: vc.plan.PlanFile.FileUrl || vc.fallbackImage
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

                    switch(overlay.HotspotDisplayType.Type) {
                        case 0:
                            moveIconOverlay(overlay, event);
                            break;

                        case 1:
                            movePinOverlay(overlay, event);
                            break;

                        default:
                            break;
                    }
                });

            var dimensions = JSON.parse(vc.plan.PlanFile.Dimensions || '{"height":0, "width":0}');

            vc.plan.Hotspots.forEach(overlay => {

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
        };

        function addIconOverlay(overlay) {
            
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
            img.width = '64';
            img.draggable = true;
            img.title = overlay.Name;

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

            vc.updateHotspot({ hotspot: overlay });
        }

        function movePinOverlay(overlay, event) {

            var display = JSON.parse(overlay.DisplayDetails);
            var webPoint = new OpenSeadragon.Point(event.layerX - 16, event.layerY - 16);
            var viewportPoint = vc.viewer.viewport.pointFromPixel(webPoint);

            display.Point = viewportPoint;
            overlay.DisplayDetails = JSON.stringify(display);

            vc.viewer.updateOverlay(overlay.Id, viewportPoint);

            vc.updateHotspot({ hotspot: overlay });
        }
    }
})();