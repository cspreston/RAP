module RapApp.Controllers {
    export class TenantUserController extends BaseController {

        constructor($scope: Models.ITenantUserModel) {
            this.$scope = $scope;
            super();
            var itemTenant: RapApp.Models.ITenant;

            (<any>$scope).selectedClients = [];
            (<any>$scope).isInRole = false;
            (<any>$scope).isSelectedRoot = false;
            (<any>$scope).isNotTenant = false;
            (<any>$scope).pageIndex = 1;
            (<any>$scope).pageSize = 25;

            if (TKWApp.Data.AuthenticationManager.isInRole('Root') ||
                TKWApp.Data.AuthenticationManager.isInRole('Company Admin') ||
                TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                (<any>$scope).isInRole = true;
            }

            (<any>$scope).addNewUser = () => {
                $scope.EditUser = {
                    Id: "",
                    UserName: "",
                    FirstName: "",
                    LastName: "",
                    Email: "",
                    Password: "",
                    ConfirmPassword: "",
                    TenantId: "",
                    ClientIds: [],
                    Type: 0,
                };
                (<any>$scope).itemTenant = null;
                (<any>$scope).selectedClients = [];
                (<any>$scope).loadTenants();
            }

            (<any>$scope).deleteUser = () => {
                $scope.IsLoading = true;
                $scope.$apply();
                TKWApp.Data.DataManager.Collections["TenantUsers"].delete($scope.EditUser.Id).then((data) => {
                }, (success) => {
                    if (success.status === 200) {
                        (<any>$scope).loadUsers();
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.Message));
                        $scope.IsLoading = false;
                        $scope.$apply();
                    }
                }, (error) => {
                    alert(JSON.stringify(error));
                    $scope.IsLoading = false;
                    $scope.$apply();
                });
                (<any>jQuery("#delete-user-modal")).modal("hide");
            }

            (<any>$scope).insertUser = () => {
                $scope.EditUser.TenantId = (<any>$scope).itemTenant.Id;
                $scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["TenantUsers"].create($scope.EditUser).then((data) => {
                    (<any>jQuery("#add-user-modal")).modal("hide");
                    (<any>$scope).loadUsers();
                }, (error) => {
                    if (error.responseJSON && error.responseJSON.Message) {
                        alert(JSON.stringify(error.responseJSON.Message));
                    }
                    else
                        alert(JSON.stringify(error));
                });
            }

            (<any>$scope).updateUser = () => {
                // $scope.EditUser.ClientIds = (<any>$scope).selectedClients;
                $scope.EditUser.Password = "Dummy.1";
                $scope.EditUser.ConfirmPassword = "Dummy.1";
                if (TKWApp.Data.AuthenticationManager.isInRole('Root')) {
                    if ((<any>$scope).itemTenant.Id) {
                        $scope.EditUser.TenantId = (<any>$scope).itemTenant.Id;
                    }
                }
                if ($scope.EditUser.Type != 3) {
                    $scope.EditUser.ClientIds = [];
                }
                TKWApp.Data.DataManager.Collections["TenantUsers"].update($scope.EditUser).then((data) => {
                }, (success) => {
                    if (success.status === 200) {
                        (<any>$scope).loadUsers();
                        (<any>jQuery("#edit-user-modal")).modal("hide");
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.Message));
                    }

                },
                    (error) => {
                        alert(JSON.stringify(error));
                    });
            }

            (<any>$scope).loadUsers = () => {
                $scope.IsLoading = true;
                TKWApp.Data.DataManager.Collections["TenantUsers"].search(null).then((data) => {
                    $scope.IsLoading = false;
                    $scope.$apply();
                    (<any>jQuery("#add-client-modal")).modal("hide");
                    (<any>jQuery("#edit-client-modal")).modal("hide");
                    $scope.Users = data;
                    $("#grid").empty();
                    (<any>$("#grid")).kendoGrid({
                        dataSource: {
                            data: data,
                            schema: {
                                model: {
                                    fields: {
                                        Id: { type: "string" },
                                        FirstName: { type: "string" },
                                        LastName: { type: "string" },
                                        UserName: { type: "string" },
                                        Email: { type: "string" },
                                        TenantName: { type: "string" },
                                        Type: { type: "string" },
                                        CreateDate: { type: "date" },
                                    }
                                },
                            },
                            pageSize:(<any>$scope).pageSize,
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
                            { field: "FirstName", title: "First Name" },
                            { field: "LastName", title: "Last Name" },
                            { field: "UserName", title: "User Name" },
                            { field: "Email", title: "Email" },
                            { field: "TenantName", title: "Company" },
                            { field: "CreateDate", title: "Created At", template: "#= kendo.toString(CreateDate, 'g') #" },
                            { command: { name: "Edit", text: "", title: "Update user", imageClass: "k-icon k-i-pencil", click: showUserDetail }, title: "", width: "80px" },
                            { command: { name: "Update", text: "", title: "Update passord", imageClass: "k-icon k-i-lock", click: showUserUpdatePassword }, title: "", width: "80px" },
                            { command: { name: "SetRole", text: "", title: "Set roles", imageClass: "k-icon k-i-search", click: showUserPermission }, title: "", width: "80px" },
                            { command: { name: "Delete", text: "", title: "Delet user ", imageClass: "k-icon k-i-close", click: confirmDeleteUser }, title: "", width: "75px" },
                        ]
                    });

                }, (error) => {
                    alert(JSON.stringify(error));
                });
            };

            (<any>$scope).loadTenants = () => {
                TKWApp.Data.DataManager.Collections["Tenants"].search(null).then((data) => {
                    $scope.Tenants = data;
                }, (error) => {
                    alert(JSON.stringify(error));
                });
            }

            (<any>$scope).updateUserPassword = () => {
                if (Object.prototype.toString.call(!$scope.EditUser.ClientIds) != '[object Array]') {
                    $scope.EditUser.ClientIds = [];
                }
                TKWApp.Data.DataManager.Collections["TenantUsers"].edit($scope.EditUser, "UpdatePassord").then((data) => {
                }, (success) => {
                    if (success.status === 200) {
                        (<any>jQuery("#edit-user-password-modal")).modal("hide");
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.Message));
                    }
                },
                    (error) => {
                        alert(JSON.stringify(error));
                    });
            }

            (<any>$scope).onChangeTenant = function (e) {
                (<any>$scope).selectedClients = [];
                var value = '';
                if (e) {
                    var dropdownlist = $("#tenantCmb").data("kendoDropDownList");
                    value = dropdownlist.value();
                }
                else {
                    value = (<any>$scope).itemTenant.Id;
                }
                loadClients(value);
                $scope.$apply();
            }

            function loadClients(value: string) {
                if (value != '') {
                    (<any>$scope).selectOptions = {
                        placeholder: "Select clients...",
                        dataTextField: "Name",
                        dataValueField: "Id",
                        valuePrimitive: false,
                        autoBind: false,
                        cache: false,
                        dataSource: {
                            serverFiltering: true,
                            transport: {
                                read: {
                                    url: TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/TenantClient/GetByTenantId?tenantId=" + value,
                                    beforeSend: function (req) {
                                        req.setRequestHeader('Authorization', "Bearer " + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token);
                                    },
                                    dataType: "json"
                                }
                            }
                        }
                    }
                }
                else {
                    (<any>$scope).itemTenant = null;
                    (<any>$scope).selectedClients = [];
                }
            };

            function showUserDetail(e: any) {
                (<any>$scope).selectedClients = [];
                (<any>$scope).isNotTenant = false;
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                if (dataItem) {
                    (<any>$scope).pageIndex = this.dataSource.page();
                    (<any>$scope).pageSize = this.dataSource.pageSize();
                    $scope.EditUser = {
                        Id: dataItem.Id,
                        UserName: dataItem.UserName,
                        FirstName: dataItem.FirstName,
                        LastName: dataItem.LastName,
                        Email: dataItem.Email,
                        Password: dataItem.Password,
                        ConfirmPassword: dataItem.ConfirmPassword,
                        TenantId: dataItem.TenantId,
                        ClientIds: dataItem.ClientIds,
                        Type: dataItem.Type,
                    };
                    (<any>$scope).itemTenant = {
                        Id: dataItem.TenantId,
                        Name: dataItem.TenantName,
                    };
                    (<any>$scope).onChangeTenant();
                    if (dataItem.ClientIds && dataItem.ClientIds.length > 0) {
                        for (var i = 0; i < dataItem.ClientIds.length; i++) {
                            (<any>$scope).selectedClients.push(dataItem.ClientIds[i]);
                        }
                        $scope.EditUser.ClientIds = (<any>$scope).selectedClients;
                    }
                    if ((<any>$scope).isInRole && dataItem.Type === "1") {
                        (<any>$scope).isSelectedRoot = true;
                        (<any>$scope).loadTenants();
                    }
                    else if ((<any>$scope).isInRole && dataItem.Type != "1") {
                        (<any>$scope).isSelectedRoot = false;
                    }
                    if (dataItem.Type == "3") {
                        (<any>$scope).isNotTenant = true;
                    }
                }
                if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                    TKWApp.Data.DataManager.Collections["Roles"].getFromUrl("GetRoles?userId=" + $scope.EditUser.Id).then((data) => {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].Activated) {
                                if (data[i].Activated) {
                                    if (data[i].Name == "Client Admin") {
                                        if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin') && data[i].RequestedUserName != TKWApp.Data.AuthenticationManager.AuthenticationToken.Username) {
                                            (<any>jQuery("#not-allowed-modal")).modal("show");
                                            return;
                                        }
                                    }
                                    else if (data[i].Name == "Company Admin") {
                                        (<any>jQuery("#not-allowed-modal")).modal("show");
                                        return;
                                    }
                                }
                            }
                        }
                        (<any>jQuery("#edit-user-modal")).modal("show");
                    }, (error) => {
                        alert(JSON.stringify(error));
                    });
                }
                else {
                    (<any>jQuery("#edit-user-modal")).modal("show");
                }
                $scope.$apply();
                return;
            };

            function showUserUpdatePassword(e: any) {
                (<any>$scope).selectedClients = [];
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                if (dataItem) {
                    (<any>$scope).pageIndex = this.dataSource.page();
                    (<any>$scope).pageSize = this.dataSource.pageSize();
                    $scope.EditUser = {
                        Id: dataItem.Id,
                        UserName: dataItem.UserName,
                        FirstName: dataItem.FirstName,
                        LastName: dataItem.LastName,
                        Email: dataItem.Email,
                        Password: dataItem.Password,
                        ConfirmPassword: dataItem.ConfirmPassword,
                        TenantId: dataItem.TenantId,
                        ClientIds: dataItem.ClientIds,
                        Type: dataItem.Type

                    };
                    (<any>$scope).itemTenant = {
                        Id: dataItem.TenantId,
                        Name: dataItem.TenantName,
                    };

                    if (dataItem.ClientIds && dataItem.ClientIds.length > 0) {
                        for (var i = 0; i < dataItem.ClientIds.length; i++) {
                            (<any>$scope).selectedClients.push(dataItem.ClientIds[i]);
                        }
                        $scope.EditUser.ClientIds = (<any>$scope).selectedClients;
                    }
                }
                if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                    TKWApp.Data.DataManager.Collections["Roles"].getFromUrl("GetRoles?userId=" + $scope.EditUser.Id).then((data) => {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].Activated) {
                                if (data[i].Name == "Client Admin") {
                                    if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin') && data[i].RequestedUserName != TKWApp.Data.AuthenticationManager.AuthenticationToken.Username) {
                                        (<any>jQuery("#not-allowed-modal")).modal("show");
                                        return;
                                    }
                                }
                                else if (data[i].Name == "Company Admin") {
                                    (<any>jQuery("#not-allowed-modal")).modal("show");
                                    return;
                                }
                            }
                        }
                        (<any>jQuery("#edit-user-password-modal")).modal("show");
                    }, (error) => {
                        alert(JSON.stringify(error));
                    });
                }
                else {
                    (<any>jQuery("#edit-user-password-modal")).modal("show");
                }
                $scope.$apply();
            };

            function showUserPermission(e: any) {
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                if (dataItem) {
                    (<any>$scope).pageIndex = this.dataSource.page();
                    (<any>$scope).pageSize = this.dataSource.pageSize();
                    $scope.EditUser = {
                        Id: dataItem.Id,
                        UserName: dataItem.UserName,
                        FirstName: dataItem.FirstName,
                        LastName: dataItem.LastName,
                        Email: dataItem.Email,
                        Password: dataItem.Password,
                        ConfirmPassword: dataItem.ConfirmPassword,
                        TenantId: dataItem.TenantId,
                        ClientIds: dataItem.ClientIds,
                        Type: dataItem.Type
                    };
                    (<any>$scope).itemTenant = {
                        Id: dataItem.TenantId,
                        Name: dataItem.TenantName,
                    };
                    if (dataItem.ClientIds && dataItem.ClientIds.length > 0) {
                        for (var i = 0; i < dataItem.ClientIds.length; i++) {
                            (<any>$scope).selectedClients.push(dataItem.ClientIds[i]);
                        }
                        $scope.EditUser.ClientIds = (<any>$scope).selectedClients;
                    }
                }
                (<any>$scope).loadRoles();
                $scope.$apply();
            };

            (<any>$scope).updateUserPermission = () => {
                $scope.IsLoading = true;
                var roleIds = [];
                for (var i = 0; i < (<any>$scope).Roles.length; i++) {
                    var role = (<any>$scope).Roles[i];
                    if (role.Activated)
                        roleIds.push(role.Id);
                }
                var data = { "": roleIds.toString() };
                TKWApp.Data.DataManager.Collections["TenantUsers"].edit(data, "SetUserPermissions?Id=" + $scope.EditUser.Id).then((data) => {
                }, (success) => {
                    $scope.IsLoading = false;
                    if (success.status === 200) {
                        (<any>jQuery("#edit-user-permission-modal")).modal("hide");
                    }
                    else {
                        alert(JSON.stringify(success.responseJSON.Message));
                    }
                    $scope.$apply();
                },
                    (error) => {
                        $scope.IsLoading = false;
                        $scope.$apply();
                        alert(JSON.stringify(error));
                    });
            }

            (<any>$scope).loadRoles = function (e) {
                (<any>$scope).Roles = [];
                TKWApp.Data.DataManager.Collections["Roles"].getFromUrl("GetRoles?userId=" + $scope.EditUser.Id).then((data) => {
                    if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].Activated) {
                                if (data[i].Name == "Client Admin" || data[i].Name == "Company Admin") {
                                    (<any>jQuery("#not-allowed-modal")).modal("show");
                                    return;
                                }
                            }
                            if (data[i].Name != "Company Admin" && data[i].Name != "Client Admin") {
                                (<any>$scope).Roles.push(data[i]);
                            }
                        }
                    }
                    else {
                        (<any>$scope).Roles = data;
                    }
                    (<any>jQuery("#edit-user-permission-modal")).modal("show");
                    $scope.$apply();
                }, (error) => {
                    alert(JSON.stringify(error));
                });
            }

            function confirmDeleteUser(e: any) {
                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                (<any>$scope).pageIndex = this.dataSource.page();
                (<any>$scope).pageSize = this.dataSource.pageSize();
                $scope.EditUser = {
                    Id: dataItem.Id,
                    UserName: dataItem.UserName,
                    FirstName: dataItem.Phone,
                    LastName: dataItem.Address,
                    Email: dataItem.Website,
                    Password: dataItem.Email,
                    ConfirmPassword: dataItem.Fax,
                    TenantId: dataItem.DataBase,
                    ClientIds: [],
                    Type: dataItem.Type
                };
                (<any>jQuery("#delete-user-modal")).modal("show");
                $scope.$apply();
            };

            (<any>$scope).loadUsers();

            (<any>$scope).selectRole = (role) => {
                for (var i = 0; i < (<any>$scope).Roles.length; i++) {
                    var rol = (<any>$scope).Roles[i];
                    if (rol.Id != role.Id) {
                        rol.Activated = false;
                    }
                }
            }
        }
    }
}