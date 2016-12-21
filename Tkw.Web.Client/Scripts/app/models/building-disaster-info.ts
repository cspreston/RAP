module RapApp.Models {
    export interface IBuildingDisasterInfoList extends ng.IScope, BaseModel {
        BuildingDisasterInfos: Array<IBuildingDisasterInfo>;
        CurrentBuildingDisasterInfo: IBuildingDisasterInfo;
        EditBuildingDisasterInfo: IBuildingDisasterInfo;
        BuildingId: string;
    }
    export interface IBuildingDisasterInfo {
        Id: string;
        Description: string;
        Name: string;
        DisasterInfoThumbnailFileId: string;
        DisasterInfoFileId: string;
        BuildingId: string;
    }
}