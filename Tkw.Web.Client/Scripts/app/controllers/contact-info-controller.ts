module RapApp.Controllers {
    export class ContactInfoData {      
        public static EditContactInfo: RapApp.Models.IContactInfo = {
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
        public static ContactInfos: Array<RapApp.Models.IContactInfo> = new Array<RapApp.Models.IContactInfo>();
        public static Refresh(buildingId:string) {
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
        }
    }
    export class ContactInfoController extends BaseController {
        // initializes the controller
        constructor($scope: RapApp.Models.IContactInfoList, loadAll: boolean, loadById: boolean) {
            
            super($scope);
            this.$scope = $scope;
            // initialize scope
            $scope.ContactInfos = null;
            (<any>$scope).createNew = this.createNew;
            (<any>$scope).insertContactInfo = this.insertContactInfo;
            (<any>$scope).removeContact = this.removeContact;

            var buildingId: string = TKWApp.HardRouting.ApplicationRoutes.UriUtils.UriParameters["id"];
            ContactInfoData.Refresh(buildingId);
            $scope.EditContactInfo = ContactInfoData.EditContactInfo;
            $scope.ContactInfos = ContactInfoData.ContactInfos;

            
            $scope.BuildingId = buildingId;
            if (loadAll)
                this.loadContactInfos(buildingId);
        }

        createNew() {
            var scope: RapApp.Models.IContactInfoList = <RapApp.Models.IContactInfoList><any>this;
            ContactInfoData.Refresh(scope.BuildingId);
        }

        removeContact(item) {
            var scope: RapApp.Models.IContactInfoList = <RapApp.Models.IContactInfoList><any>this;
            
            TKWApp.Data.DataManager.Collections["ContactInfos"].delete(item.Id).then(function (data) {
                ContactInfoData.ContactInfos.splice(ContactInfoData.ContactInfos.indexOf(item), 1);               
                scope.$apply();
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });
             
        }

        insertContactInfo() {
            var scope: RapApp.Models.IContactInfoList = <RapApp.Models.IContactInfoList><any>this;
            scope.EditContactInfo = ContactInfoData.EditContactInfo;
            TKWApp.Data.DataManager.Collections["ContactInfos"].create(scope.EditContactInfo).then(function (data) {
                // add the new item to the list
                ContactInfoData.ContactInfos.push(data);
                scope.$apply();
                
                // close the modal dialog
                (<any>jQuery("#add_contact_info")).modal("hide");
            }, function (error) {
                // show bootstrap modal error
                // for now we show a simple alert
                alert(JSON.stringify(error));
            });
        }

        // loads all images the current user has access to
        loadContactInfos(buildingId:string) {
          
            var self = this;
            this.$scope.IsLoading = true;
            var query = new TKWApp.Data.Query();
            query.and().eq("BuildingId", buildingId).eq("BuildingId", buildingId);

            TKWApp.Data.DataManager.Collections["ContactInfos"].search(query).then((data) => {
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
        }

    }
}