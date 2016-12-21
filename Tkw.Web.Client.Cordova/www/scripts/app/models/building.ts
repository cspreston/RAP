module RapApp.Models {
    export interface IBuildingsList extends ng.IScope, BaseModel {
        Buildings: Array<IBuilding>;
        Clients: Array<IClient>;
        EditBuilding: IBuilding;

        DefaultBuildingImage: string;
        DefaultPlanImage: string;
    }
    export interface ISingleBuilding extends ng.IScope, BaseModel {
        BuildingId: string;
        CurrentBuilding: IBuilding;
        EditBuilding: IBuilding;

        Clients: Array<IClient>; 

        DefaultBuildingImage: string;
        DefaultPlanImage: string;

        AddBuildingImageModel: BuildimgImageUploadModel;
        AddPlanModel: BuildimgPlanUploadModel;
        AddFileModel: BuildFileUploadModel;
        AddDisasterInfoModel: BuildDisasterInfoUploadModel;
        AddPriceInfoInfoModel: BuildFileUploadModel;

        EditContactInfo: IContactInfo;
        EditPricingInfo: IPricingInfo;
        EditMetaDataFile: MetaDataFile;
    }
    export interface IBuilding {
        Id: string;
        Name: string;
        Description: string;
        Address: string;
        ZIP: string;
        ActorId: string;
        ActorName: string;
        EmergencyPhone: string;
        EmergencyEmail: string;
        BuildingType: string;
        ConstructionType: string;
        BuildingsNo: number;
        Actor: Object;
        UserIds: string;
        // TODO - add the rest of the attributes
        ContactInfos: Array<IContactInfo>;
        PricingInfos: Array<IPricingInfo>;
        BuildingFiles: Array<IBuildingFile>;
        BuildingDisasterInfos: Array<IBuildingDisasterInfo>;
        ShowPricing: boolean,
        ShowContact: boolean,
        ShowFiles: boolean,
        ShowDisaster: boolean,
        ShowFolders: boolean,
        Geopoints:string;
    }
    export interface IBuildingFolder {
        id: string;
        BuildingId: string;
        Name: string;
        ParentName: string;
        ContentPath: string;
        spriteCssClass: string;
        type: number,
        expanded: boolean,
        items: Array<IBuildingFolder>;
    }
    export interface MetaDataFile {
        id: string;
        BuildingId: string;
        Title: string;
        Description: string;
    }    
}