module RapApp.Models {
    export interface ITenantUserModel extends ng.IScope, BaseModel {
        Users: Array<ITenantUser>;
        EditUser: ITenantUser;
        Tenants: Array<ITenant>;
    }

    export interface ITenantUser {
        Id: string;
        UserName: string;
        FirstName: string;
        LastName: string;
        Email: string;
        Password: string;
        ConfirmPassword: string;
        TenantId: string;
        Type: number;
        ClientIds: Array<string>;
    }
}