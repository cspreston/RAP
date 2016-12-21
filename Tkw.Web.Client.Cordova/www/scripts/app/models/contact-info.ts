module RapApp.Models {
    export interface IContactInfoList extends ng.IScope, BaseModel {
        ContactInfos: Array<IContactInfo>;
        CurrentContactInfo: IContactInfo;
        EditContactInfo: IContactInfo;
        BuildingId: string;
    }
    export interface IContactInfo {
        Id: string;
        BuildingId: string;
        Title: string;
        FirstName: string;
        LastName: string;
        Role: string;
        EmailAddress: string;
        Phone: string;
        MobilePhone: string;
        Address: string;
        SecondAddress: string;
        City: string;
        State: string;
        ZIP: string;
    }
}