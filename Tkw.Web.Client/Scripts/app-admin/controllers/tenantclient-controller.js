var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var TenantClientController = (function (_super) {
            __extends(TenantClientController, _super);
            function TenantClientController($scope) {
                this.$scope = $scope;
                _super.call(this);
                var itemTenant;
                $scope.Tenants = new Array();
                $scope.pageIndex = 1;
                $scope.pageSize = 25;
                $scope.isInRole = false;
                if (TKWApp.Data.AuthenticationManager.isInRole('Root') ||
                    TKWApp.Data.AuthenticationManager.isInRole('Company Admin')) {
                    $scope.isInRole = true;
                }
                $scope.itemTenant = null;
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
                $scope.loadClients = function () {
                    $scope.IsLoading = true;
                    $scope.Clients = new Array();
                    TKWApp.Data.DataManager.Collections["TenantClients"].search(null).then(function (data) {
                        $scope.IsLoading = false;
                        $scope.$apply();
                        jQuery("#add-client-modal").modal("hide");
                        $scope.Clients = data;
                        $("#grid").empty();
                        $("#grid").kendoGrid({
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
                                pageSize: $scope.pageSize,
                                page: $scope.pageIndex
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
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadClients();
                $scope.addNewClient = function () {
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
                };
                $scope.insertClient = function () {
                    $scope.IsLoading = true;
                    $scope.EditClient.TenantId = $scope.itemTenant.Id;
                    TKWApp.Data.DataManager.Collections["TenantClients"].create($scope.EditClient).then(function (data) {
                        $scope.loadClients();
                    }, function (error) {
                        alert(JSON.stringify(error));
                        $scope.IsLoading = false;
                        $scope.$apply();
                    });
                };
                $scope.updateClient = function () {
                    TKWApp.Data.DataManager.Collections["TenantClients"].update($scope.EditClient).then(function (data) {
                    }, function (success) {
                        if (success.status === 200) {
                            $scope.loadClients();
                            jQuery("#edit-client-modal").modal("hide");
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.Message));
                        }
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.deleteClient = function () {
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["TenantClients"].delete($scope.EditClient.Id).then(function (data) {
                    }, function (success) {
                        if (success.status === 200) {
                            $scope.loadClients();
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.Message));
                        }
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                    jQuery("#delete-client-modal").modal("hide");
                    $scope.IsLoading = false;
                };
                $scope.loadTenants = function () {
                    TKWApp.Data.DataManager.Collections["Tenants"].search(null).then(function (data) {
                        $scope.Tenants = data;
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadTenants();
                function showClientDetail(e) {
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    if (dataItem) {
                        $scope.pageIndex = this.dataSource.page();
                        $scope.pageSize = this.dataSource.pageSize();
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
                    jQuery("#edit-client-modal").modal("show");
                    $scope.$apply();
                }
                ;
                function confirmDeleteClient(e) {
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    $scope.pageIndex = this.dataSource.page();
                    $scope.pageSize = this.dataSource.pageSize();
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
                    jQuery("#delete-client-modal").modal("show");
                    $scope.$apply();
                }
                ;
            }
            return TenantClientController;
        })(Controllers.BaseController);
        Controllers.TenantClientController = TenantClientController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=tenantclient-controller.js.map