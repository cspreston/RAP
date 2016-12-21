var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var PlanBulkInsertController = (function (_super) {
            __extends(PlanBulkInsertController, _super);
            // initializes the controller
            function PlanBulkInsertController($scope) {
                var _this = this;
                _super.call(this);
                this.$scope = $scope;
                // get the current plan id
                this.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                this.$scope.BuildingId = this.BuildingId;
                // init uploader
                this.Uploader = new TKWApp.Services.FileUploader();
                this.Uploader.registerUploader(document.getElementById("pdfFileUpload"));
                // set scope methods            
                var self = this;
                this.$scope.selectInsertItem = function (item) {
                    _this.$scope.SelectedInsertItem = item;
                };
                this.$scope.checkAll = function () {
                    var val = document.getElementById('chkAll').checked;
                    $.each(_this.$scope.InsertItems, function (i, item) {
                        item.Import = val;
                    });
                };
                this.$scope.checkItem = function (item) {
                    if (!item.Import) {
                        document.getElementById('chkAll').checked = false;
                    }
                    else {
                        var allChecked = true;
                        $.each(_this.$scope.InsertItems, function (i, item) {
                            if (!item.Import)
                                allChecked = false;
                        });
                        document.getElementById('chkAll').checked = allChecked;
                    }
                };
                this.$scope.saveAndReturn = function (item) {
                    _this.$scope.IsSaving = true;
                    _this.$scope.IsLoading = true;
                    TKWApp.Data.DataManager.getFunction("PerformBuildingPlanBulkInsert").execute({ "": _this.$scope.InsertItems }).then(function (data) {
                        // success
                        // the plans were saved
                        // we need to redirect to the site page
                        TKWApp.HardRouting.ApplicationRoutes.redirect("Site", _this.$scope.BuildingId + "#/views");
                    }, function (error) {
                        // error
                        alert(JSON.stringify(error));
                        _this.$scope.IsSaving = false;
                        _this.$scope.IsLoading = true;
                        _this.scopeApply();
                    });
                };
                this.$scope.uploadPdf = function () {
                    if (_this.Uploader.files && _this.Uploader.files.length == 1) {
                        // upload the pdf
                        _this.$scope.IsSaving = true;
                        var url = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/BulkPlanInsertUpload";
                        var operationProgress = _this.Uploader.uploadFile(_this.Uploader.files[0], url, {
                            "BuildingId": _this.BuildingId
                        });
                        operationProgress.finished(function (response) {
                            // here we should get the data                        
                            self.$scope.IsSaving = false;
                            // set the scope list
                            self.$scope.InsertItems = JSON.parse(response);
                            // try apply
                            self.scopeApply();
                        });
                        operationProgress.error(function () {
                            self.$scope.IsSaving = false;
                            alert("PDF file could not be uploaded...");
                        });
                    }
                    else {
                        alert("You must select a PDF file to be uploaded.");
                    }
                };
            }
            return PlanBulkInsertController;
        })(Controllers.BaseController);
        Controllers.PlanBulkInsertController = PlanBulkInsertController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=plan-bulk-insert-controller.js.map