var TKWApp;
(function (TKWApp) {
    var HardRouting;
    (function (HardRouting) {
        var UriUtils = (function () {
            function UriUtils() {
                this.UriParameters = new Array();
                var match, pl = /\+/g, // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); }, query = window.location.search.substring(1);
                while (match = search.exec(query))
                    this.UriParameters[decode(match[1])] = decode(match[2]);
            }
            return UriUtils;
        })();
        var ApplicationRoutesClass = (function () {
            function ApplicationRoutesClass() {
                this.Routes = null;
                this.UriUtils = new UriUtils();
                if (TKWApp.Configuration.ConfigurationManager.AppType == TKWApp.Configuration.ApplicationType.WEB) {
                    this.Routes = {
                        Login: TKWApp.Configuration.ConfigurationManager.ServerUri + "/login",
                        Reset: TKWApp.Configuration.ConfigurationManager.ServerUri + "/reset-password",
                        Dashboard: TKWApp.Configuration.ConfigurationManager.ServerUri + "/dashboard",
                        Site: TKWApp.Configuration.ConfigurationManager.ServerUri + "/site",
                        Plan: TKWApp.Configuration.ConfigurationManager.ServerUri + "/plan",
                        PlanEdit: TKWApp.Configuration.ConfigurationManager.ServerUri + "/plan-edit",
                        CopySite: TKWApp.Configuration.ConfigurationManager.ServerUri + "/copy-site",
                        ImportPlan: TKWApp.Configuration.ConfigurationManager.ServerUri + "/plan-bulk-create",
                        FileManager: TKWApp.Configuration.ConfigurationManager.ServerUri + "/filemanager",
                        // partials
                        LeftMenu: TKWApp.Configuration.ConfigurationManager.ServerUri + "/AngularPartials/left-menu.html",
                        AppMenu: TKWApp.Configuration.ConfigurationManager.ServerUri + "/AngularPartials/app-menu.html",
                        Search: TKWApp.Configuration.ConfigurationManager.ServerUri + "/AngularPartials/search.html",
                    };
                }
                if (TKWApp.Configuration.ConfigurationManager.AppType == TKWApp.Configuration.ApplicationType.MOBILE) {
                    this.Routes = {
                        Login: "login.html",
                        Dashboard: "dashboard.html",
                        Site: "site.html",
                        Plan: "plan.html",
                        PlanEdit: "plan-edit.html",
                        CopySite: "copy-site.html",
                        ImportPlan: "plan-bulk-create.html",
                        FileManager: "filemanager.html",
                        LeftMenu: "left-menu.html",
                        AppMenu: "app-menu.html",
                        Search: "search.html",
                        OfflineDashboard: "dashboard-offline.html",
                        OfflineSite: "site-offline.html",
                        OfflinePlan: "plan-offline.html",
                    };
                }
            }
            ApplicationRoutesClass.prototype.get = function (routeName) {
                return this.Routes[routeName];
            };
            ApplicationRoutesClass.prototype.redirect = function (routeName, id) {
                if (id === void 0) { id = null; }
                if (!id)
                    window.location.href = this.Routes[routeName];
                else
                    window.location.href = this.Routes[routeName] + "?id=" + id;
            };
            return ApplicationRoutesClass;
        })();
        HardRouting.ApplicationRoutes = new ApplicationRoutesClass();
    })(HardRouting = TKWApp.HardRouting || (TKWApp.HardRouting = {}));
})(TKWApp || (TKWApp = {}));
//# sourceMappingURL=application-routes.js.map