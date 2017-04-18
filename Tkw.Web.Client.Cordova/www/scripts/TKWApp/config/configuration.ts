module TKWApp.Configuration {
    /// client side configuration classes
    /// these will handle any kind of configuration we will need to add to the client business logic


    /// Is mobile check...
    export var IsMobile = {
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
            return (IsMobile.Android() || IsMobile.BlackBerry() || IsMobile.iOS() || IsMobile.Opera() || IsMobile.Windows());
        }
    };

    /// WorkMode - enum containing the 2 allowed workmodes
    export enum WorkMode {
        ONLINE = 1,
        OFFLINE = 2
    }

    export enum ApplicationType {
        WEB = 1,
        MOBILE = 2,
    }

    /// Configuration manager class - used to store all configuration options
    export class ConfigurationManagerClass {
        public WorkMode: WorkMode = WorkMode.ONLINE;
        public AppType: ApplicationType = ApplicationType.WEB;
        public ServerUri: string = "";
        constructor() {
            //if (window.location.href.indexOf("52.21.240.181") >= 0) this.ServerUri = "http://52.21.240.181:8888";
            
            if (IsMobile.any()) {
                // this is a mobile device - return the mobile workmode
                this.AppType = ApplicationType.MOBILE;
            }
        }
    }

    /// Singleton for configuration manager, to be used accross the website
    export var ConfigurationManager: TKWApp.Configuration.ConfigurationManagerClass
        = new TKWApp.Configuration.ConfigurationManagerClass();
}