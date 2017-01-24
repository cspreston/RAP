(function () {

    let app = angular.module('CTR-RAP-AWS');

    app.component('planEditor', {
        controller: PlanEditor,
        controllerAs: 'ec',
        templateUrl: '/AngularPartials/aws/planEditor.html'
    });

    PlanEditor.$inject = ['$state', '$stateParams', '$http'];

    function PlanEditor($state, $stateParams, $http) {

        let ec = this;
        
        console.log($stateParams);
        ec.dziUrl = $stateParams.dzi;

        ec.$onInit = function () {

            var viewer = OpenSeadragon({
                id: 'zoomViewer',
                tileSources: ec.dziUrl
            });
        };
    }
})();