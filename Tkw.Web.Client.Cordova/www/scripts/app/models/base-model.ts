module RapApp.Models {
    export interface BaseModel extends ng.IScope {
        IsLoading: boolean;
        IsSaving: boolean;
        Message: MessageModel;
        Controller: any;

        DefaultBuildingImage: string;
        DefaultPlanImage: string;
        DefaultUserImage: string;
    }

    export interface MessageModel {
        Title: string;
        Text: string;
        HasOkButton: boolean;
        HasCloseButton: boolean;
        HasSaveChangesButton: boolean;
    }
  
    export interface IPosition {
        x: number;
        y: number;
    }
    export interface ICoords {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }
    export interface ISize {
        width: number;
        height: number;
    }
}