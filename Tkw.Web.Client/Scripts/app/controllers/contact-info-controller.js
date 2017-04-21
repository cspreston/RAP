var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var ContactInfoData = (function () {
            function ContactInfoData() {
            }
            ContactInfoData.Refresh = function (buildingId) {
                ContactInfoData.EditContactInfo.Id = "";
                ContactInfoData.EditContactInfo.BuildingId = buildingId;
                ContactInfoData.EditContactInfo.EmailAddress = "";
                ContactInfoData.EditContactInfo.Address = "";
                ContactInfoData.EditContactInfo.SecondAddress = "";
                ContactInfoData.EditContactInfo.FirstName = "";
                ContactInfoData.EditContactInfo.LastName = "";
                ContactInfoData.EditContactInfo.MobilePhone = "";
                ContactInfoData.EditContactInfo.Title = "";
                ContactInfoData.EditContactInfo.Phone = "";
                ContactInfoData.EditContactInfo.Role = "";
                ContactInfoData.EditContactInfo.City = "";
                ContactInfoData.EditContactInfo.State = "";
                ContactInfoData.EditContactInfo.ZIP = "";
            };
            ContactInfoData.EditContactInfo = {
                Id: "",
                BuildingId: "",
                Title: "",
                FirstName: "",
                LastName: "",
                Role: "",
                EmailAddress: "",
                Phone: "",
                MobilePhone: "",
                Address: "",
                SecondAddress: "",
                City: "",
                State: "",
                ZIP: "",
            };
            ContactInfoData.ContactInfos = new Array();
            return ContactInfoData;
        }());
        Controllers.ContactInfoData = ContactInfoData;
        var ContactInfoController = (function (_super) {
            __extends(ContactInfoController, _super);
            // initializes the controller
            function ContactInfoController($scope, loadAll, loadById) {
                _super.call(this, $scope);
                this.$scope = $scope;
                // initialize scope
                $scope.ContactInfos = null;
                $scope.createNew = this.createNew;
                $scope.insertContactInfo = this.insertContactInfo;
                $scope.removeContact = this.removeContact;
                var buildingId = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
                ContactInfoData.Refresh(buildingId);
                $scope.EditContactInfo = ContactInfoData.EditContactInfo;
                $scope.ContactInfos = ContactInfoData.ContactInfos;
                $scope.BuildingId = buildingId;
                if (loadAll)
                    this.loadContactInfos(buildingId);
            }
            ContactInfoController.prototype.createNew = function () {
                var scope = this;
                ContactInfoData.Refresh(scope.BuildingId);
            };
            ContactInfoController.prototype.removeContact = function (item) {
                var scope = this;
                TKWApp.Data.DataManager.Collections["ContactInfos"].delete(item.Id).then(function (data) {
                    ContactInfoData.ContactInfos.splice(ContactInfoData.ContactInfos.indexOf(item), 1);
                    scope.$apply();
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            ContactInfoController.prototype.insertContactInfo = function () {
                var scope = this;
                scope.EditContactInfo = ContactInfoData.EditContactInfo;
                TKWApp.Data.DataManager.Collections["ContactInfos"].create(scope.EditContactInfo).then(function (data) {
                    // add the new item to the list
                    ContactInfoData.ContactInfos.push(data);
                    scope.$apply();
                    // close the modal dialog
                    jQuery("#add_contact_info").modal("hide");
                }, function (error) {
                    // show bootstrap modal error
                    // for now we show a simple alert
                    alert(JSON.stringify(error));
                });
            };
            // loads all images the current user has access to
            ContactInfoController.prototype.loadContactInfos = function (buildingId) {
                var self = this;
                this.$scope.IsLoading = true;
                var query = new TKWApp.Data.Query();
                query.and().eq("BuildingId", buildingId).eq("BuildingId", buildingId);
                TKWApp.Data.DataManager.Collections["ContactInfos"].search(query).then(function (data) {
                    ContactInfoData.ContactInfos.splice(0, ContactInfoData.ContactInfos.length);
                    for (var i = 0; i < data.length; i++) {
                        ContactInfoData.ContactInfos.push(data[i]);
                    }
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                }, function (error) {
                    // display an error
                    self.$scope.IsLoading = false;
                    // after a jquery async ajax call, sometimes angular does not know to refresh the html
                    // this forces it to do so
                    self.$scope.$apply();
                });
            };
            return ContactInfoController;
        }(Controllers.BaseController));
        Controllers.ContactInfoController = ContactInfoController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
