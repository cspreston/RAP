var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var TenantUserController = (function (_super) {
            __extends(TenantUserController, _super);
            function TenantUserController($scope) {
                _super.call(this, $scope);
                this.$scope = $scope;
                var itemTenant;
                $scope.selectedClients = [];
                $scope.isInRole = false;
                $scope.isSelectedRoot = false;
                $scope.isNotTenant = false;
                $scope.pageIndex = 1;
                $scope.pageSize = 25;
                if (TKWApp.Data.AuthenticationManager.isInRole('Root') ||
                    TKWApp.Data.AuthenticationManager.isInRole('Company Admin') ||
                    TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                    $scope.isInRole = true;
                }
                $scope.addNewUser = function () {
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
                    $scope.itemTenant = null;
                    $scope.selectedClients = [];
                    $scope.loadTenants();
                };
                $scope.deleteUser = function () {
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["TenantUsers"].delete($scope.EditUser.Id).then(function (data) {
                    }, function (success) {
                        if (success.status === 200) {
                            $scope.loadUsers();
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.Message));
                            $scope.IsLoading = false;
                        }
                    }, function (error) {
                        alert(JSON.stringify(error));
                        $scope.IsLoading = false;
                    });
                    jQuery("#delete-user-modal").modal("hide");
                };
                $scope.insertUser = function () {
                    $scope.EditUser.TenantId = $scope.itemTenant.Id;
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["TenantUsers"].create($scope.EditUser).then(function (data) {
                        jQuery("#add-user-modal").modal("hide");
                        $scope.loadUsers();
                    }, function (error) {
                        if (error.responseJSON && error.responseJSON.Message) {
                            alert(JSON.stringify(error.responseJSON.Message));
                        }
                        else
                            alert(JSON.stringify(error));
                    });
                };
                $scope.updateUser = function () {
                    // $scope.EditUser.ClientIds = (<any>$scope).selectedClients;
                    $scope.EditUser.Password = "Dummy.1";
                    $scope.EditUser.ConfirmPassword = "Dummy.1";
                    if (TKWApp.Data.AuthenticationManager.isInRole('Root')) {
                        if ($scope.itemTenant.Id) {
                            $scope.EditUser.TenantId = $scope.itemTenant.Id;
                        }
                    }
                    if ($scope.EditUser.Type != 3) {
                        $scope.EditUser.ClientIds = [];
                    }
                    TKWApp.Data.DataManager.Collections["TenantUsers"].update($scope.EditUser).then(function (data) {
                    }, function (success) {
                        if (success.status === 200) {
                            $scope.loadUsers();
                            jQuery("#edit-user-modal").modal("hide");
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.Message));
                        }
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadUsers = function () {
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["TenantUsers"].search(null).then(function (data) {
                        $scope.IsLoading = false;
                        $scope.$apply();
                        jQuery("#add-client-modal").modal("hide");
                        jQuery("#edit-client-modal").modal("hide");
                        $scope.Users = data;
                        $("#grid").empty();
                        $("#grid").kendoGrid({
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
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadTenants = function () {
                    TKWApp.Data.DataManager.Collections["Tenants"].search(null).then(function (data) {
                        $scope.Tenants = data;
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.updateUserPassword = function () {
                    if (Object.prototype.toString.call(!$scope.EditUser.ClientIds) != '[object Array]') {
                        $scope.EditUser.ClientIds = [];
                    }
                    TKWApp.Data.DataManager.Collections["TenantUsers"].edit($scope.EditUser, "UpdatePassord").then(function (data) {
                    }, function (success) {
                        if (success.status === 200) {
                            jQuery("#edit-user-password-modal").modal("hide");
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.Message));
                        }
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.onChangeTenant = function (e) {
                    $scope.selectedClients = [];
                    var value = '';
                    if (e) {
                        var dropdownlist = $("#tenantCmb").data("kendoDropDownList");
                        value = dropdownlist.value();
                    }
                    else {
                        value = $scope.itemTenant.Id;
                    }
                    loadClients(value);
                    $scope.$apply();
                };
                function loadClients(value) {
                    if (value != '') {
                        $scope.selectOptions = {
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
                        };
                    }
                    else {
                        $scope.itemTenant = null;
                        $scope.selectedClients = [];
                    }
                }
                ;
                function showUserDetail(e) {
                    $scope.selectedClients = [];
                    $scope.isNotTenant = false;
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    if (dataItem) {
                        $scope.pageIndex = this.dataSource.page();
                        $scope.pageSize = this.dataSource.pageSize();
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
                        $scope.itemTenant = {
                            Id: dataItem.TenantId,
                            Name: dataItem.TenantName,
                        };
                        $scope.onChangeTenant();
                        if (dataItem.ClientIds && dataItem.ClientIds.length > 0) {
                            for (var i = 0; i < dataItem.ClientIds.length; i++) {
                                $scope.selectedClients.push(dataItem.ClientIds[i]);
                            }
                            $scope.EditUser.ClientIds = $scope.selectedClients;
                        }
                        if ($scope.isInRole && dataItem.Type === "1") {
                            $scope.isSelectedRoot = true;
                            $scope.loadTenants();
                        }
                        else if ($scope.isInRole && dataItem.Type != "1") {
                            $scope.isSelectedRoot = false;
                        }
                        if (dataItem.Type == "3") {
                            $scope.isNotTenant = true;
                        }
                    }
                    if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                        TKWApp.Data.DataManager.Collections["Roles"].getFromUrl("GetRoles?userId=" + $scope.EditUser.Id).then(function (data) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].Activated) {
                                    if (data[i].Activated) {
                                        if (data[i].Name == "Client Admin") {
                                            if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin') && data[i].RequestedUserName != TKWApp.Data.AuthenticationManager.AuthenticationToken.Username) {
                                                jQuery("#not-allowed-modal").modal("show");
                                                return;
                                            }
                                        }
                                        else if (data[i].Name == "Company Admin") {
                                            jQuery("#not-allowed-modal").modal("show");
                                            return;
                                        }
                                    }
                                }
                            }
                            jQuery("#edit-user-modal").modal("show");
                        }, function (error) {
                            alert(JSON.stringify(error));
                        });
                    }
                    else {
                        jQuery("#edit-user-modal").modal("show");
                    }
                    $scope.$apply();
                    return;
                }
                ;
                function showUserUpdatePassword(e) {
                    $scope.selectedClients = [];
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    if (dataItem) {
                        $scope.pageIndex = this.dataSource.page();
                        $scope.pageSize = this.dataSource.pageSize();
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
                        $scope.itemTenant = {
                            Id: dataItem.TenantId,
                            Name: dataItem.TenantName,
                        };
                        if (dataItem.ClientIds && dataItem.ClientIds.length > 0) {
                            for (var i = 0; i < dataItem.ClientIds.length; i++) {
                                $scope.selectedClients.push(dataItem.ClientIds[i]);
                            }
                            $scope.EditUser.ClientIds = $scope.selectedClients;
                        }
                    }
                    if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                        TKWApp.Data.DataManager.Collections["Roles"].getFromUrl("GetRoles?userId=" + $scope.EditUser.Id).then(function (data) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].Activated) {
                                    if (data[i].Name == "Client Admin") {
                                        if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin') && data[i].RequestedUserName != TKWApp.Data.AuthenticationManager.AuthenticationToken.Username) {
                                            jQuery("#not-allowed-modal").modal("show");
                                            return;
                                        }
                                    }
                                    else if (data[i].Name == "Company Admin") {
                                        jQuery("#not-allowed-modal").modal("show");
                                        return;
                                    }
                                }
                            }
                            jQuery("#edit-user-password-modal").modal("show");
                        }, function (error) {
                            alert(JSON.stringify(error));
                        });
                    }
                    else {
                        jQuery("#edit-user-password-modal").modal("show");
                    }
                    $scope.$apply();
                }
                ;
                function showUserPermission(e) {
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    if (dataItem) {
                        $scope.pageIndex = this.dataSource.page();
                        $scope.pageSize = this.dataSource.pageSize();
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
                        $scope.itemTenant = {
                            Id: dataItem.TenantId,
                            Name: dataItem.TenantName,
                        };
                        if (dataItem.ClientIds && dataItem.ClientIds.length > 0) {
                            for (var i = 0; i < dataItem.ClientIds.length; i++) {
                                $scope.selectedClients.push(dataItem.ClientIds[i]);
                            }
                            $scope.EditUser.ClientIds = $scope.selectedClients;
                        }
                    }
                    $scope.loadRoles();
                    $scope.$apply();
                }
                ;
                $scope.updateUserPermission = function () {
                    $scope.IsLoading = true;
                    var roleIds = [];
                    for (var i = 0; i < $scope.Roles.length; i++) {
                        var role = $scope.Roles[i];
                        if (role.Activated)
                            roleIds.push(role.Id);
                    }
                    var data = { "": roleIds.toString() };
                    TKWApp.Data.DataManager.Collections["TenantUsers"].edit(data, "SetUserPermissions?Id=" + $scope.EditUser.Id).then(function (data) {
                    }, function (success) {
                        $scope.IsLoading = false;
                        if (success.status === 200) {
                            jQuery("#edit-user-permission-modal").modal("hide");
                        }
                        else {
                            alert(JSON.stringify(success.responseJSON.Message));
                        }
                        $scope.$apply();
                    }, function (error) {
                        $scope.IsLoading = false;
                        $scope.$apply();
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadRoles = function (e) {
                    $scope.Roles = [];
                    TKWApp.Data.DataManager.Collections["Roles"].getFromUrl("GetRoles?userId=" + $scope.EditUser.Id).then(function (data) {
                        if (TKWApp.Data.AuthenticationManager.isInRole('Client Admin')) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].Activated) {
                                    if (data[i].Name == "Client Admin" || data[i].Name == "Company Admin") {
                                        jQuery("#not-allowed-modal").modal("show");
                                        return;
                                    }
                                }
                                if (data[i].Name != "Company Admin" && data[i].Name != "Client Admin") {
                                    $scope.Roles.push(data[i]);
                                }
                            }
                        }
                        else {
                            $scope.Roles = data;
                        }
                        jQuery("#edit-user-permission-modal").modal("show");
                        $scope.$apply();
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                function confirmDeleteUser(e) {
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    $scope.pageIndex = this.dataSource.page();
                    $scope.pageSize = this.dataSource.pageSize();
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
                    jQuery("#delete-user-modal").modal("show");
                    $scope.$apply();
                }
                ;
                $scope.loadUsers();
                $scope.selectRole = function (role) {
                    for (var i = 0; i < $scope.Roles.length; i++) {
                        var rol = $scope.Roles[i];
                        if (rol.Id != role.Id) {
                            rol.Activated = false;
                        }
                    }
                };
            }
            return TenantUserController;
        })(Controllers.BaseController);
        Controllers.TenantUserController = TenantUserController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=tenant-user-controller.js.map