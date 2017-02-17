(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('planViewer', {
        controller: PlanViewer,
        controllerAs: 'vc',
        templateUrl: '/AngularPartials/aws/planViewer.html',
        bindings: {
            plan: '<',
            fallbackImage: '<'
        }
    });

    PlanViewer.$inject = ['$state', '$stateParams'];

    function PlanViewer($state, $stateParams) {

        let vc = this;
        
        vc.viewer = null;
        vc.overlays = [];

        vc.$onInit = function () {

            console.log('Plan File: ', vc.plan);
            console.log('Fallback Image: ', vc.fallbackImage);


            var zoomSource = vc.plan.PlanFile.ZoomUrl ||
            {
                type: 'image',
                url: vc.plan.PlanFile.FileUrl || vc.fallbackImage
            };

            vc.viewer = OpenSeadragon({
                id: 'zoomViewer',
                prefixUrl: '/Content/Images/OpenSeaDragon/',
                tileSources: zoomSource,
                overlays: vc.overlays
            });

            vc.plan.Hotspots.forEach(overlay => {

                if (overlay.HotspotDisplayType.Type === 0) {

                    var img = document.createElement("img");
                    var display = JSON.parse(overlay.DisplayDetails);

                    img.src = './Content/Images/Hotspots/' + overlay.HotspotDisplayType.FileName;

                    vc.viewer.addOverlay({
                        element: img,
                        location: new OpenSeadragon.Point(display.Position.x.toFixed(3), display.Position.y.toFixed(3))
                    });
                }
            });
        };
    }
})();