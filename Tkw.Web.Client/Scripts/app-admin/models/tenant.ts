module RapApp.Models {
    export interface ITenantModel extends ng.IScope, BaseModel {
        Tenants: Array<ITenant>;
        EditTenant: ITenant;
    }

    export interface ITenant {
        Id: string;
        UserName: string;
        Name: string;
        Phone: string;
        Address: string;
        Website: string;
        Email: string;
        City: string;
        State: string;
        ZIP: string;
    }
}