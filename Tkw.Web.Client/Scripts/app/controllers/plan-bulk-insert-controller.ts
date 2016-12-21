module RapApp.Controllers {    
    export class PlanBulkInsertController extends BaseController {
        public $scope: RapApp.Models.PlanBulkInsert;
        public BuildingId: string;
        public Uploader: TKWApp.Services.FileUploader;
        // initializes the controller
        constructor($scope: RapApp.Models.PlanBulkInsert) {  
                   
            super();   
            this.$scope = $scope;
            // get the current plan id
            this.BuildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            this.$scope.BuildingId = this.BuildingId;
            // init uploader
            this.Uploader = new TKWApp.Services.FileUploader();
            this.Uploader.registerUploader(<HTMLInputElement>document.getElementById("pdfFileUpload"));
            
            // set scope methods            
            var self = this;
            (<any>this.$scope).selectInsertItem = (item) => {
                this.$scope.SelectedInsertItem = item;
            };

            (<any>this.$scope).checkAll = () => {
                var val =(<any>document.getElementById('chkAll')).checked;
                $.each(this.$scope.InsertItems, function (i, item) {
                    item.Import = val;
                });
            };
            (<any>this.$scope).checkItem = (item) => {
                if (!item.Import) {
                    (<any>document.getElementById('chkAll')).checked = false;
                }
                else {
                    var allChecked = true;
                    $.each(this.$scope.InsertItems, function (i, item) {
                        if (!item.Import)
                            allChecked = false;
                    });
                    (<any>document.getElementById('chkAll')).checked = allChecked;
                }
            };

            (<any>this.$scope).saveAndReturn = (item) => {
                this.$scope.IsSaving = true;
                this.$scope.IsLoading = true;
                TKWApp.Data.DataManager.getFunction("PerformBuildingPlanBulkInsert").execute({ "": this.$scope.InsertItems }).then((data) => {
                    // success
                    // the plans were saved
                    // we need to redirect to the site page
                    TKWApp.HardRouting.ApplicationRoutes.redirect("Site", this.$scope.BuildingId +"#/views");
                }, (error) => {
                    // error
                    alert(JSON.stringify(error));
                    this.$scope.IsSaving = false;
                    this.$scope.IsLoading = true;
                    this.scopeApply();
                });
            };
            
            (<any>this.$scope).uploadPdf = () => {
                if (this.Uploader.files && this.Uploader.files.length == 1) {
                    // upload the pdf
                    this.$scope.IsSaving = true;
                    var url = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/BulkPlanInsertUpload";
                    var operationProgress: TKWApp.Services.OperationProgress = this.Uploader.uploadFile(this.Uploader.files[0], url, {
                        "BuildingId": this.BuildingId
                    });

                    operationProgress.finished((response) => {
                        // here we should get the data                        
                        self.$scope.IsSaving = false;
                        // set the scope list
                        
                        self.$scope.InsertItems = JSON.parse(response);

                        // try apply
                        self.scopeApply();
                    });

                    operationProgress.error(() => {
                        self.$scope.IsSaving = false;
                        alert("PDF file could not be uploaded...");
                    });
                 
                }
                else {
                    alert("You must select a PDF file to be uploaded.");
                }
            }
        }                       
    }
}