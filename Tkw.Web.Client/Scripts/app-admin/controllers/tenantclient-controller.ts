module RapApp.Controllers {
    export class TenantClientController extends BaseController {

        constructor($scope: Models.ITenantClientModel) {
            this.$scope = $scope;
            super();
            var itemTenant: RapApp.Models.ITenant;
            $scope.Tenants = new Array<Models.ITenant>();

            (<any>$scope).pageIndex = 1;
            (<any>$scope).pageSize = 25;

            (<any>$scope).isInRole = false;
            if (TKWApp.Data.AuthenticationManager.isInRole('Root') ||
                TKWApp.Data.AuthenticationManager.isInRole('Company Admin')) {
                (<any>$scope).isInRole = true;
            }

            (<any>$scope).itemTenant = null;

            $scope.EditClient = {
                TenantId: "",
                Id: "",
                UserName: "",
                Name: "",
                Phone: "",
                Address: "",
                Website: "",
                Email: "",
                City: "",
                State: "",
                ZIP: "",
                DataBase:"",
            };

            (<any>$scope).loadClients = () => {
                $scope.IsLoading = true;
                $scope.Clients = new Array<Models.ITenantClient>();

                TKWApp.Data.DataManager.Collections["TenantClients"].search(null).then((data) => {
                    $scope.IsLoading = false;
                    $scope.$apply();
                    (<any>jQuery("#add-client-modal")).modal("hide");
                    $scope.Clients = data;
                    $("#grid").empty();
                    (<any>$("#grid")).kendoGrid({
                        dataSource: {
                            data: data,
                            schema: {
                                model: {
                                    fields: {
                                        Id: { type: "string" },
                                        DataBase: { type: "string" },
                                        Name: { type: "string" },
                                        Phone: { type: "string" },
                                        Address: { type: "string" },
                                        Website: { type: "string" },
                                        Email: { type: "string" },
                                        City: { type: "string" },
                                        State: { type: "string" },
                                        ZIP: { type: "string" },
                                        CreateDate: { type: "date" },
                                    }
                                },
                            },
                            pageSize: (<any>$scope).pageSize,
                            page: (<any>$scope).pageIndex 
                        },
                        height: 500,
                        scrollable: true,
                        sortable: true,
                        filterable: true,
                        pageable: {
                            input: true,
                            pageSizes: [5, 10, 25, 50, 100],
                            numeric: true
                        },
                        selectable: "row",
                        allowCopy: {
                            delimeter: ",",
                        },
                        columns: [
                            { field: "Id", title: "Id", hidden: true },
                            { field: "DataBase", title: "Company" },
                            { field: "Name", title: "Name" },
                            { field: "Phone", title: "Phone" },
                            { field: "Email", title: "Email" },
                            { field: "City", title: "City" },
                            { field: "CreateDate", title: "Created At", template: "#= kendo.toString(CreateDate, 'g') #" },
                            { command: { name: "Edit", text: "", title: "Update", imageClass: "k-icon k-i-pencil", click: showClientDetail }, title: "", width: "80px" },
                            { command: { name: "Delete", text: "", title: "Delete", imageClass: "k-icon k-i-close", click: confirmDeleteClient }, title: "", width: "75px" },
                        ]
                    });
                  
                }, (error) => {
                    alert(JSON.stringify(error));
                });
            }

            (<any>$scope).loadClients();

            (<any>$scope).addNewClient = () => {
                $scope.EditClient = {
                    TenantId: "",
                    Id: "",
                    UserName: "",
                    Name: "",
                    Phone: "",
                    Address: "",
                    Website: "",
                    Email: "",
                    City: "",
                    State: "",
                    ZIP: "",
                    DataBase: "",
                };
            }
       
            (<any>$scope).insertClient = () => {
                $scope.IsLoading = true;
                $scope.EditClient.TenantId = (<any>$scope).itemTenant.Id;
                TKWApp.Data.DataManager.Collections["TenantClients"].create($scope.EditClient).then((data) => {
                    (<any>$scope).loadClients();
                }, (error) => {
                    alert(JSON.stringify(error));
                    $scope.IsLoading = false;
                    $scope.$apply();
                });
            }

            (<any>$scope).updateClient = () => {
                TKWApp.Data.DataManager.Collections["TenantClients"].update($scope.EditClient).then((data) => {

                }, (success) => {
                    if (success.status === 200) {
                        (<any>$scope).loadClients();
                        (<any>jQuery("#edit-client-modal")).modal("hide");
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.Message));
                    }
                },
                    (error) => {
                        alert(JSON.stringify(error));
                    });
            } 
            
            (<any>$scope).deleteClient = () => {
                $scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["TenantClients"].delete($scope.EditClient.Id).then((data) => {
                }, (success) => {
                    if (success.status === 200) {
                        (<any>$scope).loadClients();
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.Message));
                    }
                }, (error) => {
                    alert(JSON.stringify(error));
                   
                });
                (<any>jQuery("#delete-client-modal")).modal("hide");
                $scope.IsLoading = false;
            }      

            (<any>$scope).loadTenants = () => {
                TKWApp.Data.DataManager.Collections["Tenants"].search(null).then((data) => {
                    $scope.Tenants = data;
                }, (error) => {
                    alert(JSON.stringify(error));
                });
            }

            (<any>$scope).loadTenants();

            function showClientDetail(e: any) {
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                if (dataItem) {
                    (<any>$scope).pageIndex = this.dataSource.page();
                    (<any>$scope).pageSize = this.dataSource.pageSize();
                    $scope.EditClient = {
                        TenantId: "",
                        Id: dataItem.Id,
                        UserName: '',
                        Name: dataItem.Name,
                        Phone: dataItem.Phone,
                        Address: dataItem.Address,
                        Website: dataItem.Website,
                        Email: dataItem.Email,
                        City: dataItem.City,
                        State: dataItem.State,
                        ZIP: dataItem.Zip,
                        DataBase: dataItem.DataBase,
                    };
                }
                (<any>jQuery("#edit-client-modal")).modal("show");
                $scope.$apply();
            };

            function confirmDeleteClient(e: any) {
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                (<any>$scope).pageIndex = this.dataSource.page();
                (<any>$scope).pageSize = this.dataSource.pageSize();
                $scope.EditClient = {
                    TenantId: "",
                    Id: dataItem.Id,
                    UserName: '',
                    Name: dataItem.Name,
                    Phone: dataItem.Phone,
                    Address: dataItem.Address,
                    Website: dataItem.Website,
                    Email: dataItem.Email,
                    City: dataItem.City,
                    State: dataItem.State,
                    ZIP: dataItem.Zip,
                    DataBase: dataItem.DataBase,
                };
                (<any>jQuery("#delete-client-modal")).modal("show");
                $scope.$apply();
            };
        }
    }
}