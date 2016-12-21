module RapApp.Controllers {
    export class TenantController extends BaseController {
        // initializes the controller
        constructor($scope: Models.ITenantModel) {

            super();
            this.$scope = $scope;

            (<any>$scope).isInRole = false;
            (<any>$scope).pageIndex = 1;
            (<any>$scope).pageSize = 25;

            if (TKWApp.Data.AuthenticationManager.isInRole('Root')) {
                (<any>$scope).isInRole = true;
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

            (<any>$scope).addNewTenant = () => {
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
                (<any>$scope).EditTenant.RawPassword ='';
            }

            (<any>$scope).insertTenant = () => {
                $scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["Tenants"].create($scope.EditTenant).then((data) => {
                    (<any>$scope).loadTenants();
                    $scope.IsLoading = false;
                    (<any>$scope).$apply();
                }, (error) => {
                    (<any>jQuery("#error-body")).html(error.responseJSON.ExceptionMessage);
                    (<any>jQuery("#error-modal")).modal("show");
                    $scope.IsLoading = false;
                    (<any>$scope).$apply();
                });
            }

            (<any>$scope).updateTenant = () => {
                $scope.IsLoading = true;
                (<any>$scope).ResponseError = "";
                (<any>$scope).EditTenant.RawPassword = $("#rawPass").val();
                TKWApp.Data.DataManager.Collections["Tenants"].update($scope.EditTenant).then((data) => {
                }, (success) => {
                    $scope.IsLoading = false;
                    if (success.status === 200) {
                        (<any>$scope).loadTenants();
                        (<any>jQuery("#edit-tenant-modal")).modal("hide");
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.ExceptionMessage));
                        (<any>jQuery("#error-modal")).modal("show");
                    }
                },
                    (error) => {
                        $scope.IsLoading = false;
                        (<any>$scope).ResponseError = error.ExceptionMessage;
                        (<any>jQuery("#error-modal")).modal("show");
                    });
            }

            (<any>$scope).loadTenants = () => {
                $scope.IsLoading = true;

                TKWApp.Data.DataManager.Collections["Tenants"].search(null).then((data) => {
                    $scope.IsLoading = false;
                    $scope.$apply();
                    $("#grid").empty();
                    (<any>$("#grid")).kendoGrid({
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
                    (<any>jQuery("#add-tenant-modal")).modal("hide");
                }, (error) => {
                    alert(JSON.stringify(error));
                });

            }

            (<any>$scope).loadTenants();

            function showDetails(e: any) {
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                (<any>$scope).pageIndex = this.dataSource.page();
                (<any>$scope).pageSize = this.dataSource.pageSize();

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
                (<any>jQuery("#edit-tenant-modal")).modal("show");
                $scope.IsLoading = false;
                $scope.$apply();
            };


            (<any>$scope).deleteTenant = () => {
                $scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["Tenants"].delete($scope.EditTenant.Id).then((data) => {
                }, (success) => {
                    if (success.status === 200) {
                        (<any>$scope).loadTenants();
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.Message));
                    }
                }, (error) => {
                    alert(JSON.stringify(error));

                });
                (<any>jQuery("#delete-tenant-modal")).modal("hide");
                $scope.IsLoading = false;
            }  

            function confirmDeleteTenant(e: any) {
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                (<any>$scope).pageIndex = this.dataSource.page();
                (<any>$scope).pageSize = this.dataSource.pageSize();
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
                (<any>jQuery("#delete-tenant-modal")).modal("show");
                $scope.$apply();
            };
        }
    }
}