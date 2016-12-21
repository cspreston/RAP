module RapApp.Models {
    export interface IClientList extends ng.IScope, BaseModel {
        Clients: Array<IClient>;
        CurrentClient: IClient;
        BuildingId: string;
    }
    export interface IClient {
        Id: string;
        Name: string;
    }
}