var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var SearchController = (function (_super) {
            __extends(SearchController, _super);
            // initializes the controller
            function SearchController($scope) {
                _super.call(this, $scope);
                this.$scope = $scope;
                // attach functions
                this.$scope.performSearch = this.performSearch;
                this.$scope.getFeaturedImage = this.getFeaturedImage;
                this.$scope.getUserImage = this.getUserImage;
                this.$scope.searchKeyPressed = this.searchKeyPressed;
                $scope.getFileLinkToSave = this.getFileLinkToSave;
            }
            SearchController.prototype.getFileLinkToSave = function (fi) {
                var fileLink = RapApp.FileUtils.getImageUrl(fi.BucketPath, fi.BucketName, fi.FileName);
                return fileLink;
            };
            SearchController.prototype.performSearch = function () {
                var scope = this;
                scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["Search"].find(scope.SearchText).then(function (data) {
                    scope.SearchResult = data;
                    scope.IsLoading = false;
                    scope.$apply();
                }, function (error) {
                    scope.IsLoading = false;
                    alert(JSON.stringify(error));
                });
            };
            SearchController.prototype.searchKeyPressed = function (ev) {
                var scope = this;
                if (ev.keyCode == 13) {
                    scope.performSearch();
                }
            };
            SearchController.prototype.getUserImage = function (u) {
                var scope = this;
                return scope.DefaultUserImage;
            };
            SearchController.prototype.getFeaturedImage = function (b) {
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
            };
            return SearchController;
        })(Controllers.BaseController);
        Controllers.SearchController = SearchController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=search-controller.js.map