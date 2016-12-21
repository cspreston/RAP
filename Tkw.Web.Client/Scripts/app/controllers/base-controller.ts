module RapApp.Controllers {
    function endsWith(str: string, end: string): boolean {
        return str.indexOf(end, str.length - end.length) !== -1;
    }
    export class BaseController {
        protected $scope: RapApp.Models.BaseModel;
        constructor() {
            this.$scope.Message = {
                Title: null,
                Text: null,
                HasOkButton: true,
                HasCloseButton: false,
                HasSaveChangesButton: false,
            };
            (<any>(this.$scope)).getUrl = this.getUrl;
            (<any>(this.$scope)).navigateUrl = this.navigateUrl;
            (<any>(this.$scope)).getFileIconCss = this.getFileIconCss;

            // set default images
            this.$scope.DefaultBuildingImage = "./Content/Images/default-building.png";
            this.$scope.DefaultPlanImage = "./Content/Images/default-building.png";
            this.$scope.DefaultUserImage = "./Content/Images/default-user-image.png";

            // set templates
            //(<any>(this.$scope)).Templates = {
            //    Sample : "./AngularPartials/index.html"
            //};
        }

        scopeApply() {
            if (this.$scope.$$phase != '$apply' && this.$scope.$$phase != '$digest')
                this.$scope.$apply();
        }

        getUrl(key: string) {
            var url = TKWApp.HardRouting.ApplicationRoutes.get(key);
            return url;
        }

        navigateUrl(key: string, id: string) {
            var url = this.getUrl(key);
            if (id) {
                url += "?id=" + id;
            }
            window.location.href = url;
        }

        getFileIconCss(fileName: string) {
            var str = fileName.toLowerCase();
            if (endsWith(str, ".bmp") || endsWith(str, ".png") || endsWith(str, ".jpg")) {
                return "fa-file-image-o";
            }
            if (endsWith(str, ".mp4") || endsWith(str, ".ogg") ) {
                return "fa-file-video-o";
            }
            if (endsWith(str, ".mp3") || endsWith(str, ".wav")) {
                return "fa-file-audio-o";
            }
            return "fa-file";
        }
    }
}