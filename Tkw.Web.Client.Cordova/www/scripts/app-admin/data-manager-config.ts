TKWApp.Data.DataManager = new TKWApp.Data.DataStore();
var DataManager = TKWApp.Data.DataManager;
if (TKWApp.Configuration.ConfigurationManager.WorkMode == TKWApp.Configuration.WorkMode.ONLINE) {
    // register building collection

    DataManager.RegisterCollection("Tenants",
        new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Tenant", "Id"));

    DataManager.RegisterCollection("Roles",
        new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/User/GetRoles"));

    DataManager.RegisterCollection("TenantClients",
        new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/TenantClient", "Id"));

    DataManager.RegisterCollection("TenantUsers",
        new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/User", "Id"));
}
else {
    // register building collection
    DataManager.RegisterCollection("Tenants",
        new TKWApp.Data.LocalStorageAdapter("Tenants", "Id"));
    DataManager.RegisterCollection("Roles",
        new TKWApp.Data.LocalStorageAdapter("Roles", "Id"));
    DataManager.RegisterCollection("TenantClients",
        new TKWApp.Data.LocalStorageAdapter("TenantClients", "Id"));
    DataManager.RegisterCollection("TenantUsers",
        new TKWApp.Data.LocalStorageAdapter("UserClients", "Id"));
}