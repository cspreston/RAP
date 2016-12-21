var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RapApp;
(function (RapApp) {
    var Controllers;
    (function (Controllers) {
        var UserController = (function (_super) {
            __extends(UserController, _super);
            function UserController($scope) {
                this.$scope = $scope;
                _super.call(this);
                $scope.mainGridOptions = {
                    dataSource: {
                        type: "odata",
                        transport: {
                            read: TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/TenantClient/GetAll",
                            beforeSend: function (req) {
                                req.setRequestHeader('Authorization', "Bearer " + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token);
                            },
                            dataType: "json"
                        },
                        pageSize: 5,
                        serverPaging: true,
                        serverSorting: true
                    },
                    sortable: true,
                    pageable: true,
                    columns: [
                        {
                            field: "FirstName",
                            title: "First Name",
                            width: "120px"
                        }, {
                            field: "LastName",
                            title: "Last Name",
                            width: "120px"
                        }, {
                            field: "Country",
                            width: "120px"
                        }, {
                            field: "City",
                            width: "120px"
                        }, {
                            field: "Title"
                        }]
                };
            }
            return UserController;
        })(Controllers.BaseController);
        Controllers.UserController = UserController;
    })(Controllers = RapApp.Controllers || (RapApp.Controllers = {}));
})(RapApp || (RapApp = {}));
