var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var OfflineBuildingsController = (function (_super) {
            __extends(OfflineBuildingsController, _super);
            // initializes the controller
            function OfflineBuildingsController($scope) {
                this.$scope = $scope;
                TKWApp.Configuration.ConfigurationManager.WorkMode = TKWApp.Configuration.WorkMode.OFFLINE;
                _super.call(this);
                // initialize scope
                $scope.Controller = this;
                $scope.UserName = TKWApp.Data.AuthenticationManager.AuthenticationToken.getUserName();
                $scope.Tenant = "";
                if (TKWApp.Data.AuthenticationManager.AuthenticationToken.getUserType() === "Root") {
                    $scope.Tenant = " / Company: " + TKWApp.Data.AuthenticationManager.AuthenticationToken.getTenant();
                }
                $scope.isInRole = true;
                if (!TKWApp.Data.AuthenticationManager.isInRole("Root") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Company Admin") &&
                    !TKWApp.Data.AuthenticationManager.isInRole("Client Admin")) {
                    $scope.isInRole = false;
                }
                $scope.result1 = '';
                $scope.options1 = null;
                $scope.details1 = '';
                $scope.DefaultBuildingImage = "./Content/Images/default-building.png";
                $scope.DefaultPlanImage = "./Content/Images/default-plan.jpg";
                $scope.Buildings = null;
                $scope.TotalCount = 0;
                // add methods to the scope
                $scope.getFeaturedImage = this.getFeaturedImage;
                $scope.getBuildingImage = this.getBuildingImage;
                $scope.getBuildingUrl = this.getBuildingUrl;
                $scope.goOnline = this.goOnline;
                this.loadBuildings();
            }
            OfflineBuildingsController.prototype.goOnline = function () {
                var self = this;
                if (self.Buildings.length > 0) {
                    if (confirm("If you switch to online mode all changes made offline will be kept. Confirm action?")) {
                        self.navigateUrl('Dashboard');
                    }
                }
                else {
                    self.navigateUrl('Dashboard');
                }
            };
            // loads all images the current user has access to
            OfflineBuildingsController.prototype.loadBuildings = function () {
                var self = this;
                this.$scope.IsLoading = true;
                return TKWApp.Data.DataManager.Collections["OfflineBuildings"].search(null).then(function (data) {
                    self.$scope.Buildings = data;
                    self.$scope.IsLoading = false;
                    self.$scope.TotalCount = data.length;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    window.Pleasure.listenClickableCards();
                }, function (error) {
                    // display an error
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                });
            };
            // returns the url for the building's featured image
            OfflineBuildingsController.prototype.getFeaturedImage = function (b) {
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
            }; // returns the url for the building's featured image
            OfflineBuildingsController.prototype.getBuildingImage = function (bi) {
                return RapApp.FileUtils.getImageUrl(bi.BucketPath, bi.BucketName, bi.FileName);
            };
            OfflineBuildingsController.prototype.getBuildingUrl = function (buildingId) {
                var url = TKWApp.HardRouting.ApplicationRoutes.Routes["OfflineSite"];
                url += "?id=" + buildingId;
                return url;
            };
            return OfflineBuildingsController;
        })(Controllers.BaseController);
        Controllers.OfflineBuildingsController = OfflineBuildingsController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
