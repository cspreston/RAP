module RapApp.Models {
    export interface ISearchModel extends ng.IScope, BaseModel {
        SearchText: string;

        SearchResult: ISearchResult;
    }
    export interface ISearchResult {
        Buildings: Array<IBuilding>;
        Users : Array<IUser>
        Files : Array<IFileWithBucket>
    }
}