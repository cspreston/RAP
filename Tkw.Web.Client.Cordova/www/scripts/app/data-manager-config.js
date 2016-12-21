TKWApp.Data.DataManager = new TKWApp.Data.DataStore();
var DataManager = TKWApp.Data.DataManager;
if (TKWApp.Configuration.ConfigurationManager.WorkMode == TKWApp.Configuration.WorkMode.ONLINE) {
    // register building collection
    DataManager.RegisterCollection("Clients", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Client", "Id"));
    DataManager.RegisterCollection("Buildings", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Building", "Id"));
    DataManager.RegisterCollection("PricingInfos", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/PricingInfo", "Id"));
    DataManager.RegisterCollection("BuildingDisasterInfos", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingDisasterInfo", "Id"));
    DataManager.RegisterCollection("ContactInfos", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/ContactInfo", "Id"));
    DataManager.RegisterCollection("BuildingPlans", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan", "Id"));
    DataManager.RegisterCollection("HotspotDisplayTypes", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotDisplayType", "Id"));
    DataManager.RegisterCollection("HotspotActionTypes", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotActionType", "Id"));
    DataManager.RegisterCollection("Hotspots", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot", "Id"));
    DataManager.RegisterCollection("HotspotFiles", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotFile", "Id"));
    DataManager.RegisterCollection("BuildingFiles", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingFile", "Id"));
    DataManager.RegisterCollection("BuildingImages", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingImage", "Id"));
    // search will only work in online mode
    // therefor there is no data collection registration in offline mode
    // just to make sure we do not get into troubble
    DataManager.RegisterCollection("Search", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Search", "Id"));
}
else {
    // register building collection
    DataManager.RegisterCollection("Clients", new TKWApp.Data.LocalStorageAdapter("Clients", "Id"));
    DataManager.RegisterCollection("Buildings", new TKWApp.Data.LocalStorageAdapter("Buildings", "Id"));
    DataManager.RegisterCollection("PricingInfos", new TKWApp.Data.LocalStorageAdapter("PricingInfos", "Id"));
    DataManager.RegisterCollection("BuildingDisasterInfos", new TKWApp.Data.LocalStorageAdapter("BuildingDisasterInfos", "Id"));
    DataManager.RegisterCollection("ContactInfos", new TKWApp.Data.LocalStorageAdapter("ContactInfos", "Id"));
    DataManager.RegisterCollection("BuildingPlans", new TKWApp.Data.LocalStorageAdapter("BuildingPlans", "Id"));
    DataManager.RegisterCollection("HotspotDisplayTypes", new TKWApp.Data.LocalStorageAdapter("HotspotDisplayTypes", "Id"));
    DataManager.RegisterCollection("HotspotActionTypes", new TKWApp.Data.LocalStorageAdapter("HotspotActionTypes", "Id"));
    DataManager.RegisterCollection("Hotspots", new TKWApp.Data.LocalStorageAdapter("Hotspots", "Id"));
    DataManager.RegisterCollection("HotspotFiles", new TKWApp.Data.LocalStorageAdapter("HotspotFiles", "Id"));
    DataManager.RegisterCollection("BuildingFiles", new TKWApp.Data.LocalStorageAdapter("BuildingFiles", "Id"));
    DataManager.RegisterCollection("BuildingImages", new TKWApp.Data.LocalStorageAdapter("BuildingImages", "Id"));
}
//# sourceMappingURL=data-manager-config.js.map