module RapApp.Models {
    export interface ITenantClientModel extends ng.IScope, BaseModel {
        Clients: Array<ITenantClient>;
        Tenants: Array<ITenant>;
        EditClient: ITenantClient;
    }

    export interface ITenantClient extends ITenant {
        TenantId: string;
        DataBase: string;
    }
}