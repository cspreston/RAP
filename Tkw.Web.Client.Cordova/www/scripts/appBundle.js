// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var Rap;
(function (Rap) {
    var App;
    (function (App) {
        var Hybrid;
        (function (Hybrid) {
            "use strict";
            var Application;
            (function (Application) {
                debugger;
                function initialize() {
                    document.addEventListener('deviceready', onDeviceReady, false);
                }
                Application.initialize = initialize;
                function onDeviceReady() {
                    // Handle the Cordova pause and resume events
                    document.addEventListener('pause', onPause, false);
                    document.addEventListener('resume', onResume, false);
                    // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
                }
                function onPause() {
                    // TODO: This application has been suspended. Save application state here.
                    console.log("Index.js on pause");
                    var path = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1, window.location.pathname.length) + window.location.search;
                    console.log("Index location " + path);
                    localStorage.removeItem("location");
                    localStorage.setItem("location", path);
                }
                function onResume() {
                    // TODO: This application has been reactivated. Restore application state here.
                }
            })(Application = Hybrid.Application || (Hybrid.Application = {}));
            window.onload = function () {
                Application.initialize();
            };
        })(Hybrid = App.Hybrid || (App.Hybrid = {}));
    })(App = Rap.App || (Rap.App = {}));
})(Rap || (Rap = {}));
//# sourceMappingURL=appBundle.js.map