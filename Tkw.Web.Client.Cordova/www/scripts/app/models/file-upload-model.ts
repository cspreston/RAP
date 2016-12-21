module RapApp.Models {
    export class FileUploadModel {
        public Description: string;
        public Name: string;
        public Uploader: TKWApp.Services.FileUploader;

        constructor(public fileUploader: HTMLInputElement, public previewElement: HTMLImageElement) {
            this.Uploader = new TKWApp.Services.FileUploader();
            this.Uploader.registerUploader(fileUploader);

            // on files changed we need to update the preview element
            var self = this;
            if (self.previewElement) {
                this.Uploader.filesChanged = () => {
                    if (self.Uploader.files.length > 0) {
                        for (var i = 0; i < self.Uploader.files.length; i++) {
                            var file = self.Uploader.files[i];
                            //self.Uploader.previewInImage((<any>file).id, self.previewElement);
                            self.Uploader.previewInImage((<any>file).id, self.previewElement);
                        }

                        // for now we only show the first file
                        // we do not allow selecting multiple files
                        //var file = self.Uploader.files[0];
                        //self.Uploader.previewInImage((<any>file).id, self.previewElement);
                    }
                }
            }
        }
    }

    export class BuildimgImageUploadModel extends FileUploadModel {
        public BuildingId: string;
        public Width: number;
        public Height: number;
        public KeepAspectRatio: boolean;
        fileUploader: HTMLInputElement;
        constructor(fileUploader: HTMLInputElement, previewElement: HTMLImageElement) {
            super(fileUploader, previewElement);
        }
    }

    export class BuildFileUploadModel extends FileUploadModel {
        public BuildingId: string;
        public FileName: string;
        public FileDescription: string;
        constructor(fileUploader: HTMLInputElement, previewElement: HTMLImageElement) {
            super(fileUploader, previewElement);
        }
    }

    export class BuildDisasterInfoUploadModel extends FileUploadModel {
        public BuildingId: string;
        public DisasterInfoName: string;
        public DisasterInfoDescription: string;
        constructor(fileUploader: HTMLInputElement, previewElement: HTMLImageElement) {
            super(fileUploader, previewElement);
        }
    }

    export class BuildimgPlanUploadModel extends FileUploadModel {
        public BuildingId: string;
        public PlanName: string;
        public PlanDescription: string;
        public Width: number;
        public Height: number;
        public KeepAspectRatio: boolean;
        constructor(fileUploader: HTMLInputElement, previewElement: HTMLImageElement) {
            super(fileUploader, previewElement);
        }
    }

    export class BuildHotspotUploadModel extends FileUploadModel {
        public BuildingId: string;
        public HotspotName: string;
        public HotspotDescription: string;
        constructor(fileUploader: HTMLInputElement, previewElement: HTMLImageElement) {
            super(fileUploader, previewElement);
        }
    }
}