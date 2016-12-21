module RapApp.Models {
    export interface IPricingInfoList extends ng.IScope, BaseModel {
        PricingInfos: Array<IPricingInfo>;
        CurrentPricingInfo: IPricingInfo;
        EditPricingInfo: IPricingInfo;
        BuildingId: string;
    }
    export interface IPricingInfo {
        Id: string;
        BuildingId: string;
        Name: string;
        Description: string;
        UnitPrice: number;
        Quantity: number;
        Units: string;
    }
}