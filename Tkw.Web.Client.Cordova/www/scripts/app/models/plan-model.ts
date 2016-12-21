module RapApp.Models {
    export interface ISinglePlan extends ng.IScope, BaseModel {
        PlanId: string;
        BuildingId: string;
        CurrentPlan: IBuildingPlan;

        CurrentPlanHotspots: Array<Hotspot>;
        HotspotDisplayTypes: Array<IHotspotDisplayType>;
        HotspotActionTypes: Array<IHotspotActionType>;

        ActiveHotspot: Hotspot;
        SelectedHotspot: Hotspot;
        SelectedHotspotText: boolean;
        SelectedHotspotDisplayType: IHotspotDisplayType;

        HasSelectedSpot: boolean;
        
        DefaultPlanImage: string;

        DefaultSpotImage: string;

        EditMode: boolean;

        AddHotspotModel: BuildHotspotUploadModel;

        OtherViews: Array<IBuildingPlan>
    }    

    export interface ISinglePlanEdit extends ng.IScope, BaseModel {
        PlanId: string;
        BuildingId: string;
        CurrentPlan: IBuildingPlan;

        // CURRENTLY SELECTED DRAWED OBJECT
        SelectedObject: any;

        // EDIT PLAN DRAWING TOOLS
        FreeDrawingSelected: boolean;
        LineDrawingSelected: boolean;
        RectangleDrawingSelected: boolean;
        EllipsisDrawingSelected: boolean;
        FreeWhiteDrawingSelected: boolean;
        CropSelected: boolean;
        // DRAW SETTINGS
        LineWidth: number;       
        DrawingColor: string;
        FillingColor: string;
        FillingTransparency: number;
    }

    export interface PlanBulkInsert extends ng.IScope, BaseModel {
        BuildingId: string;
        InsertItems: Array<PlanBulkInsertItem>;

        SelectedInsertItem: PlanBulkInsertItem;
    }

    export interface PlanBulkInsertItem extends ng.IScope, BaseModel {
        Id: string;
        BuildingId: string;
        Name: string;
        Description: string;
        PlanImageSrc: string;
        Import: boolean;
    }
}