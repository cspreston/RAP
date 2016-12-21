module RapApp.Models {
    export interface IRoleModel extends ng.IScope, BaseModel {
        Roles: Array<IRole>;
    }
    export interface IRole {
        Id: string;
        Name: string;
    }
}