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
                //if (window.location.href.indexOf("52.21.240.181") >= 0) this.ServerUri = "http://52.21.240.181:8888";
                this.WorkMode = WorkMode.ONLINE;
                this.AppType = ApplicationType.WEB;
                this.ServerUri = "http://readyactionplan.com/api/niv";
                if (Configuration.IsMobile.any()) {
                    // this is a mobile device - return the mobile workmode
                    this.AppType = ApplicationType.MOBILE;
                }
            }
            return ConfigurationManagerClass;
        })();
        Configuration.ConfigurationManagerClass = ConfigurationManagerClass;
        /// Singleton for configuration manager, to be used accross the website
        Configuration.ConfigurationManager = new TKWApp.Configuration.ConfigurationManagerClass();
    })(Configuration = TKWApp.Configuration || (TKWApp.Configuration = {}));
})(TKWApp || (TKWApp = {}));
//# sourceMappingURL=configuration.js.map