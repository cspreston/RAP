module RapApp.Controllers {
    export class RoleController extends BaseController {
        constructor($scope: Models.IRoleModel) {
            super();
            this.$scope = $scope;

            (<any>$scope).loadRoles = () => {
                $scope.IsLoading = true;

                TKWApp.Data.DataManager.Collections["Roles"].search(null).then((data) => {
                    $scope.IsLoading = false;
                    $scope.$apply();

                    (<any>$("#grid")).kendoGrid({
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
                }, (error) => {
                    alert(JSON.stringify(error));
                });
            }
            
            (<any>$scope).loadRoles();
        }
    }
}