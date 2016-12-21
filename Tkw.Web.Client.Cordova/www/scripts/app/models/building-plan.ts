module RapApp.Models {
    export interface IBuildingPlanList extends ng.IScope, BaseModel {
        BuildingPlans: Array<IBuildingPlan>;
        CurrentBuildingPlan: IBuildingPlan;
        EditBuildingPlan: IBuildingPlan;
        BuildingId: string;
    }
    export interface IBuildingPlan {
        Id: string;
        Description: string;
        Name: string;
        PlanThumbnailFileId: string;
        PlanFileId: string;
        BuildingId: string;
        BuildingName: string;
        Hotspots: Array<IHotspot>;
    }
}