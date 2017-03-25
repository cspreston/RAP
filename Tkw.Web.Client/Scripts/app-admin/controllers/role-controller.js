var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var RoleController = (function (_super) {
            __extends(RoleController, _super);
            function RoleController($scope) {
                _super.call(this, $scope);
                this.$scope = $scope;
                $scope.loadRoles = function () {
                    $scope.IsLoading = true;
                    TKWApp.Data.DataManager.Collections["Roles"].search(null).then(function (data) {
                        $scope.IsLoading = false;
                        $scope.$apply();
                        $("#grid").kendoGrid({
                            dataSource: {
                                data: data,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "string" },
                                            Name: { type: "string" },
                                        }
                                    }
                                },
                                pageSize: 20
                            },
                            selectable: "row",
                            allowCopy: {
                                delimeter: ",",
                            },
                            height: 450,
                            scrollable: true,
                            sortable: true,
                            filterable: true,
                            pageable: {
                                input: true,
                                numeric: false
                            },
                            columns: [
                                { field: "Id", title: "Id" },
                                { field: "Name", title: "Role" },
                            ]
                        });
                    }, function (error) {
                        alert(JSON.stringify(error));
                    });
                };
                $scope.loadRoles();
            }
            return RoleController;
        })(Controllers.BaseController);
        Controllers.RoleController = RoleController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
//# sourceMappingURL=role-controller.js.map