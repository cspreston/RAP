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
                $scope.loadClients = function () {
                    $scope.IsLoading = true;
                    $scope.EditClient = {
                        TenantId: 0,
                        Id: 0,
                        UserName: "",
                        Email: "",
                        CompanyName: "",
                        CompanyPhone: ""
                    };
                    TKWApp.Data.DataManager.Collections["Clients"].search(null).then(function (data) {
                        $scope.IsLoading = false;
                        $scope.$apply();
                        $("#grid").kendoGrid({
                            dataSource: {
                                data: data,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            CompanyName: { type: "string" },
                                            CompanyPhone: { type: "string" },
                                            UserName: { type: "string" },
                                            Email: { type: "string" },
                                            CreateDate: { type: "date" },
                                        }
                                    },
                                },
                                pageSize: 10
                            },
                            height: 500,
                            scrollable: true,
                            sortable: true,
                            filterable: true,
                            pageable: {
                                input: true,
                                numeric: false
                            },
                            selectable: "row",
                            allowCopy: {
                                delimeter: ",",
                            },
                            columns: [
                                { field: "Id", title: "Id", hidden: true },
                                { field: "CompanyName", title: "Company" },
                                { field: "CompanyPhone", title: "Phone" },
                                { field: "UserName", title: "Admin username" },
                                { field: "Email", title: "Email" },
                                { field: "CreateDate", title: "Created At", template: "#= kendo.toString(CreateDate, 'g') #" },
                                { command: { text: "Edit", click: showDetails }, title: " ", width: "120px" }
                            ]
                        });
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadClients();
                function showDetails(e) {
                    debugger;
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                    $scope.EditClient = {
                        TenantId: 0,
                        Id: dataItem.Id,
                        UserName: dataItem.UserName,
                        Email: dataItem.Email,
                        CompanyName: dataItem.CompanyName,
                        CompanyPhone: dataItem.CompanyPhone
                    };
                    $scope.IsLoading = false;
                    $scope.$apply();
                }
                ;
            }
            return TenantClientController;
        })(Controllers.BaseController);
        Controllers.TenantClientController = TenantClientController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
