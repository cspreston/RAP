/// <reference path="Scripts/angular-ui/ui-bootstrap-tpls.js" />
/// <reference path="Scripts/angular-ui/ui-bootstrap-tpls.js" />
/// <reference path="Scripts/angular-ui/ui-bootstrap-tpls.js" />

require.config({
    baseUrl: '',
    waitSeconds: 200,
    // alias libraries paths
    paths: {
        'application-configuration': 'scripts/app/application-configuration',
        'angular': 'scripts/angular',
        'angular-route': 'scripts/angular-route',
        'angularAMD': 'scripts/angularAMD',
        'ui-bootstrap': 'scripts/angular-ui/ui-bootstrap-tpls',
        'blockUI': 'scripts/angular-block-ui',
        'ngload': 'scripts/ngload',
        'infinite-scroll': 'scripts/ng-infinite-scroll',
        'angular-sanitize': 'scripts/angular-sanitize',
        'ajaxService': 'Services/AjaxService',
        'alertService': 'Services/AlertService',
        'accountService': 'Services/AccountService',
        'mainService': 'Services/MainService',
    },

    // Add angular modules that does not support AMD out of the box, put it in a shim
    shim: {
        'angularAMD': ['angular'],
        'infinite-scroll': ['angular'],
        'angular-route': ['angular'],
        'blockUI': ['angular'],
        'angular-sanitize': ['angular'],
        'ui-bootstrap': ['angular'],
        'kendo-directives': ['angular'],
    },

    // kick start application
    deps: ['application-configuration']
});
