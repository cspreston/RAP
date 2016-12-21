var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var TenantController = (function (_super) {
            __extends(TenantController, _super);
            // initializes the controller
            function TenantController($scope) {
                this.$scope = $scope;
                _super.call(this);
                $scope.isInRole = false;
                $scope.pageIndex = 1;
                $scope.pageSize = 25;
                if (TKWApp.Data.AuthenticationManager.isInRole('Root')) {
                    $scope.isInRole = true;
                }
                $scope.EditTenant = {
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
                };
                $scope.addNewTenant = function () {
                    $scope.EditTenant = {
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
                    };
                    $("#rawPass").val('');
                    $scope.EditTenant.RawPassword = '';
                };
                $scope.insertTenant = function () {
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["Tenants"].create($scope.EditTenant).then(function (data) {
                        $scope.loadTenants();
                        $scope.IsLoading = false;
                        $scope.$apply();
                    }, function (error) {
                        jQuery("#error-body").html(error.responseJSON.ExceptionMessage);
                        jQuery("#error-modal").modal("show");
                        $scope.IsLoading = false;
                        $scope.$apply();
                    });
                };
                $scope.updateTenant = function () {
                    $scope.IsLoading = true;
                    $scope.ResponseError = "";
                    $scope.EditTenant.RawPassword = $("#rawPass").val();
                    TKWApp.Data.DataManager.Collections["Tenants"].update($scope.EditTenant).then(function (data) {
                    }, function (success) {
                        $scope.IsLoading = false;
                        if (success.status === 200) {
                            $scope.loadTenants();
                            jQuery("#edit-tenant-modal").modal("hide");
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.ExceptionMessage));
                            jQuery("#error-modal").modal("show");
                        }
                    }, function (error) {
                        $scope.IsLoading = false;
                        $scope.ResponseError = error.ExceptionMessage;
                        jQuery("#error-modal").modal("show");
                    });
                };
                $scope.loadTenants = function () {
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["Tenants"].search(null).then(function (data) {
                        $scope.IsLoading = false;
                        $scope.$apply();
                        $("#grid").empty();
                        $("#grid").kendoGrid({
                            dataSource: {
                                data: data,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "string;" },
                                            UserName: { type: "string" },
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
                                { field: "UserName", title: "Admin username" },
                                { field: "Name", title: "Company" },
                                { field: "Phone", title: "Phone" },
                                { field: "Email", title: "Email" },
                                { field: "City", title: "City" },
                                { field: "CreateDate", title: "Created At", template: "#= kendo.toString(CreateDate, 'g') #" },
                                { command: { name: "Edit", text: "", title: "Update", imageClass: "k-icon k-i-pencil", click: showDetails }, title: "", width: "80px" },
                                { command: { name: "Delete", text: "", title: "Delete", imageClass: "k-icon k-i-close", click: confirmDeleteTenant }, title: "", width: "80px" },
                            ]
                        });
                        jQuery("#add-tenant-modal").modal("hide");
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadTenants();
                function showDetails(e) {
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    $scope.pageIndex = this.dataSource.page();
                    $scope.pageSize = this.dataSource.pageSize();
                    $scope.EditTenant = {
                        Id: dataItem.Id,
                        UserName: dataItem.UserName,
                        Name: dataItem.Name,
                        Phone: dataItem.Phone,
                        Address: dataItem.Address,
                        Website: dataItem.Website,
                        Email: dataItem.Email,
                        City: dataItem.City,
                        State: dataItem.State,
                        ZIP: dataItem.Zip,
                    };
                    jQuery("#edit-tenant-modal").modal("show");
                    $scope.IsLoading = false;
                    $scope.$apply();
                }
                ;
                $scope.deleteTenant = function () {
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["Tenants"].delete($scope.EditTenant.Id).then(function (data) {
                    }, function (success) {
                        if (success.status === 200) {
                            $scope.loadTenants();
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.Message));
                        }
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                    jQuery("#delete-tenant-modal").modal("hide");
                    $scope.IsLoading = false;
                };
                function confirmDeleteTenant(e) {
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    $scope.pageIndex = this.dataSource.page();
                    $scope.pageSize = this.dataSource.pageSize();
                    $scope.EditTenant = {
                        Id: dataItem.Id,
                        UserName: dataItem.UserName,
                        Name: dataItem.Name,
                        Phone: dataItem.Phone,
                        Address: dataItem.Address,
                        Website: dataItem.Website,
                        Email: dataItem.Email,
                        City: dataItem.City,
                        State: dataItem.State,
                        ZIP: dataItem.Zip,
                    };
                    jQuery("#delete-tenant-modal").modal("show");
                    $scope.$apply();
                }
                ;
            }
            return TenantController;
        })(Controllers.BaseController);
        Controllers.TenantController = TenantController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=tenant-controller.js.map