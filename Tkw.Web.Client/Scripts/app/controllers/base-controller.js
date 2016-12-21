var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        function endsWith(str, end) {
            return str.indexOf(end, str.length - end.length) !== -1;
        }
        var BaseController = (function () {
            function BaseController() {
                this.$scope.Message = {
                    Title: null,
                    Text: null,
                    HasOkButton: true,
                    HasCloseButton: false,
                    HasSaveChangesButton: false,
                };
                (this.$scope).getUrl = this.getUrl;
                (this.$scope).navigateUrl = this.navigateUrl;
                (this.$scope).getFileIconCss = this.getFileIconCss;
                // set default images
                this.$scope.DefaultBuildingImage = "./Content/Images/default-building.png";
                this.$scope.DefaultPlanImage = "./Content/Images/default-building.png";
                this.$scope.DefaultUserImage = "./Content/Images/default-user-image.png";
                // set templates
                //(<any>(this.$scope)).Templates = {
                //    Sample : "./AngularPartials/index.html"
                //};
            }
            BaseController.prototype.scopeApply = function () {
                if (this.$scope.$$phase != '$apply' && this.$scope.$$phase != '$digest')
                    this.$scope.$apply();
            };
            BaseController.prototype.getUrl = function (key) {
                var url = TKWApp.HardRouting.ApplicationRoutes.get(key);
                return url;
            };
            BaseController.prototype.navigateUrl = function (key, id) {
                var url = this.getUrl(key);
                if (id) {
                    url += "?id=" + id;
                }
                window.location.href = url;
            };
            BaseController.prototype.getFileIconCss = function (fileName) {
                var str = fileName.toLowerCase();
                if (endsWith(str, ".bmp") || endsWith(str, ".png") || endsWith(str, ".jpg")) {
                    return "fa-file-image-o";
                }
                if (endsWith(str, ".mp4") || endsWith(str, ".ogg")) {
                    return "fa-file-video-o";
                }
                if (endsWith(str, ".mp3") || endsWith(str, ".wav")) {
                    return "fa-file-audio-o";
                }
                return "fa-file";
            };
            return BaseController;
        })();
        Controllers.BaseController = BaseController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=base-controller.js.map