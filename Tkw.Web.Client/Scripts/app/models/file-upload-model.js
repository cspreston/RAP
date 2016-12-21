var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Models;
    (function (Models) {
        var FileUploadModel = (function () {
            function FileUploadModel(fileUploader, previewElement) {
                this.fileUploader = fileUploader;
                this.previewElement = previewElement;
                this.Uploader = new TKWApp.Services.FileUploader();
                this.Uploader.registerUploader(fileUploader);
                // on files changed we need to update the preview element
                var self = this;
                if (self.previewElement) {
                    this.Uploader.filesChanged = function () {
                        if (self.Uploader.files.length > 0) {
                            for (var i = 0; i < self.Uploader.files.length; i++) {
                                var file = self.Uploader.files[i];
                                //self.Uploader.previewInImage((<any>file).id, self.previewElement);
                                self.Uploader.previewInImage(file.id, self.previewElement);
                            }
                        }
                    };
                }
            }
            return FileUploadModel;
        })();
        Models.FileUploadModel = FileUploadModel;
        var BuildimgImageUploadModel = (function (_super) {
            __extends(BuildimgImageUploadModel, _super);
            function BuildimgImageUploadModel(fileUploader, previewElement) {
                _super.call(this, fileUploader, previewElement);
            }
            return BuildimgImageUploadModel;
        })(FileUploadModel);
        Models.BuildimgImageUploadModel = BuildimgImageUploadModel;
        var BuildFileUploadModel = (function (_super) {
            __extends(BuildFileUploadModel, _super);
            function BuildFileUploadModel(fileUploader, previewElement) {
                _super.call(this, fileUploader, previewElement);
            }
            return BuildFileUploadModel;
        })(FileUploadModel);
        Models.BuildFileUploadModel = BuildFileUploadModel;
        var BuildDisasterInfoUploadModel = (function (_super) {
            __extends(BuildDisasterInfoUploadModel, _super);
            function BuildDisasterInfoUploadModel(fileUploader, previewElement) {
                _super.call(this, fileUploader, previewElement);
            }
            return BuildDisasterInfoUploadModel;
        })(FileUploadModel);
        Models.BuildDisasterInfoUploadModel = BuildDisasterInfoUploadModel;
        var BuildimgPlanUploadModel = (function (_super) {
            __extends(BuildimgPlanUploadModel, _super);
            function BuildimgPlanUploadModel(fileUploader, previewElement) {
                _super.call(this, fileUploader, previewElement);
            }
            return BuildimgPlanUploadModel;
        })(FileUploadModel);
        Models.BuildimgPlanUploadModel = BuildimgPlanUploadModel;
        var BuildHotspotUploadModel = (function (_super) {
            __extends(BuildHotspotUploadModel, _super);
            function BuildHotspotUploadModel(fileUploader, previewElement) {
                _super.call(this, fileUploader, previewElement);
            }
            return BuildHotspotUploadModel;
        })(FileUploadModel);
        Models.BuildHotspotUploadModel = BuildHotspotUploadModel;
    })(Models = RapApp.Models || (RapApp.Models = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=file-upload-model.js.map