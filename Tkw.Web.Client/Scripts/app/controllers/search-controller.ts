module RapApp.Controllers {
    export class SearchController extends BaseController {
        // initializes the controller
        constructor($scope: Models.ISearchModel) {

            this.$scope = $scope;
            super();

            
          
            // attach functions
            (<any>this.$scope).performSearch = this.performSearch;
            (<any>this.$scope).getFeaturedImage = this.getFeaturedImage;
            (<any>this.$scope).getUserImage = this.getUserImage;
            (<any>this.$scope).searchKeyPressed = this.searchKeyPressed;
            (<any>$scope).getFileLinkToSave = this.getFileLinkToSave;
        }

        getFileLinkToSave(fi: any) {
            var fileLink = RapApp.FileUtils.getImageUrl(fi.BucketPath, fi.BucketName, fi.FileName);
            return fileLink;
        }
        performSearch() {
            var scope: Models.ISearchModel = <Models.ISearchModel><any>this;
            scope.IsLoading = true;
            TKWApp.Data.DataManager.Collections["Search"].find(scope.SearchText).then((data) => {
                scope.SearchResult = data;
                scope.IsLoading = false;
                scope.$apply();
            }, (error) => {
                scope.IsLoading = false;
                alert(JSON.stringify(error));
            });
        }

        searchKeyPressed(ev: KeyboardEvent) {
            var scope: Models.ISearchModel = <Models.ISearchModel><any>this;
            if (ev.keyCode == 13) {
                (<any>scope).performSearch();
            }
        }

        getUserImage(u: Models.IUser) {
            var scope: Models.ISearchModel = <Models.ISearchModel><any>this;
            return scope.DefaultUserImage;
        }

        getFeaturedImage(b: any) {
            // find featured image
            var featured = b.FeaturedImageId;
            // find featured image
            var url = null;
            for (var i = 0; i < b.BuildingImages.length; i++) {
                if (b.BuildingImages[i].Id === featured) {
                    url = RapApp.FileUtils.getImageUrl(b.BuildingImages[i].BucketPath, b.BuildingImages[i].BucketName, b.BuildingImages[i].FileName);
                }
            }
            if (!url && b.BuildingImages.length > 0) {
                // featured image is not in the list
                // normally this should never happen, but just in case
                // we consider the first image as featured
                url = RapApp.FileUtils.getImageUrl(b.BuildingImages[0].BucketPath, b.BuildingImages[0].BucketName, b.BuildingImages[0].FileName);
            }
            return url;
        }   
    }
} 