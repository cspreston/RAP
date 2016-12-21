//document.addEventListener("deviceready", getStorageSettings, false);
//function getStorageSettings() {

//    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
//    window.storageInfo = window.storageInfo || window.webkitStorageInfo;

//    var LocalFileSystem = null         // DOMFileSystem instance
//           , fsType = PERSISTENT       // PERSISTENT vs. TEMPORARY storage
//           , fsSize = 10 * 1024 * 1024 // size (bytes) of needed space
//    ;
//    function errorHandler(err) {
//        console.log(JSON.stringify(err));
//    }

//    window.requestFileSystem(PERSISTENT, 10 * 1024 * 1024 /*5MB*/, function (fs) {
//        LocalFileSystem = fs;
//        TKWApp.Configuration.ConfigurationManager.LocalUri = fs.root.toURL();
//        console.log("Root file: " + TKWApp.Configuration.ConfigurationManager.LocalUri);
//    }, errorHandler);
//}


var TKWApp;
(function (TKWApp) {
    var Configuration;
    (function (Configuration) {
        /// client side configuration classes
        /// these will handle any kind of configuration we will need to add to the client business logic
        /// Is mobile check...
        Configuration.IsMobile = {
            Android: function () {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function () {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function () {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function () {
                return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
            },
            any: function () {
                return (Configuration.IsMobile.Android() || Configuration.IsMobile.BlackBerry() || Configuration.IsMobile.iOS() || Configuration.IsMobile.Opera() || Configuration.IsMobile.Windows());
            }
        };
        /// WorkMode - enum containing the 2 allowed workmodes
        (function (WorkMode) {
            WorkMode[WorkMode["ONLINE"] = 1] = "ONLINE";
            WorkMode[WorkMode["OFFLINE"] = 2] = "OFFLINE";
        })(Configuration.WorkMode || (Configuration.WorkMode = {}));
        var WorkMode = Configuration.WorkMode;
        (function (ApplicationType) {
            ApplicationType[ApplicationType["WEB"] = 1] = "WEB";
            ApplicationType[ApplicationType["MOBILE"] = 2] = "MOBILE";
        })(Configuration.ApplicationType || (Configuration.ApplicationType = {}));
        var ApplicationType = Configuration.ApplicationType;
        /// Configuration manager class - used to store all configuration options
        var ConfigurationManagerClass = (function () {
            function ConfigurationManagerClass() {
                this.WorkMode = WorkMode.ONLINE;
                this.AppType = ApplicationType.MOBILE;
                this.ServerUri = "http://www.readyactionplan.com/";
                this.LocalUri = "";
                if (this.LocalUri == "") {
                    console.log("set in ctr");
                    this.LocalUri = window.localStorage.getItem("LocalUri");
                }

                if (Configuration.IsMobile.Android()) {
                    // debugger    file:///data/user/0/com.readyactionplan.rap/files/files/
                    // //this.LocalUri = 'file:///data/user/0/com.readyactionplan.rap/files/files/';
                }
                if (Configuration.IsMobile.iOS()) {
                    this.ServerUri = "https://www.readyactionplan.com/";
                }
            }
            return ConfigurationManagerClass;
        })();
        Configuration.ConfigurationManagerClass = ConfigurationManagerClass;
        /// Singleton for configuration manager, to be used accross the website
        Configuration.ConfigurationManager = new TKWApp.Configuration.ConfigurationManagerClass();
    })(Configuration = TKWApp.Configuration || (TKWApp.Configuration = {}));
})(TKWApp || (TKWApp = {}));
