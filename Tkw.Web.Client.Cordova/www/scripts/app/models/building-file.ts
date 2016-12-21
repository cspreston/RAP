module RapApp.Models {
    export interface IBuildingFileList extends ng.IScope, BaseModel {
        BuildingFiles: Array<IBuildingFile>;
        CurrentBuildingFile: IBuildingFile;
        EditBuildingFile: IBuildingFile;
        BuildingId: string;
    }
    export interface IBuildingFile {
        Id: string;
        Description: string;
        Name: string;
        FileThumbnailFileId: string;
        FileId: string;
        BuildingId: string;
        Type: number;
    }
}