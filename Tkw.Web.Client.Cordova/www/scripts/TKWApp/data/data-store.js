var TKWApp;
(function (TKWApp) {
    var Data;
    (function (Data) {
        var DataStore = (function () {
            function DataStore() {
                this.CacheManager = new CacheManager();
                this.Collections = new Array();
                this.StoreFunctions = new Array();
            }
            DataStore.prototype.RegisterCollection = function (collectionName, adapter) {
                // register collection to the store
                var collection = new DataCollection();
                collection.Adapter = adapter;
                collection.CacheManager = this.CacheManager;
                this.Collections[collectionName] = collection;
                return collection;
            };
            DataStore.prototype.RegisterStoreFunction = function (functionName, storeFunction) {
                // register store function
                this.StoreFunctions[functionName] = storeFunction;
            };
            DataStore.prototype.get = function (collectionName) {
                return this.Collections[collectionName];
            };
            DataStore.prototype.getFunction = function (functionName) {
                return this.StoreFunctions[functionName];
            };
            return DataStore;
        })();
        Data.DataStore = DataStore;
        var DataStoreErrors = {
            ValueCannotBeNull: {
                Code: 150,
                Message: "Error cannot be null."
            },
            ObjectCouldNotBeFound: {
                Code: 180,
                Message: "Object could not be found"
            },
            create: function (code, message) {
                return {
                    Code: code,
                    Message: message
                };
            }
        };
        var DataCollection = (function () {
            function DataCollection() {
                this.DataItems = new Array();
                this.CacheEnabled = false;
                this.CacheTimeout = 60;
                this.CacheLastUpdated = new Date(2000, 1, 1);
            }
            DataCollection.prototype.search = function (query) {
                var cacheKey = null;
                if (this.CacheEnabled) {
                    // try to get from cache
                    if (query)
                        cacheKey = this.Name + JSON.stringify(query);
                    else
                        cacheKey = this.Name;
                    var data = this.CacheManager.get(cacheKey);
                    if (data != null) {
                        return new DataStorePromissForStoredData(data);
                    }
                }
                // data was not found in cache, or cache is not alive
                var self = this;
                var promiss = this.Adapter.get(query).then(function (data) {
                    if (self.CacheEnabled) {
                        self.CacheManager.add(cacheKey, data, self.CacheTimeout);
                    }
                }, null);
                return promiss;
            };
            DataCollection.prototype.find = function (id) {
                return this.Adapter.find(id);
            };
            DataCollection.prototype.create = function (object) {
                return this.Adapter.post(object);
            };
            DataCollection.prototype.update = function (object) {
                return this.Adapter.put(object);
            };
            DataCollection.prototype.delete = function (id) {
                return this.Adapter.delete(id);
            };
            DataCollection.prototype.enableCaching = function () {
                this.CacheEnabled = true;
            };
            DataCollection.prototype.disableCaching = function () {
                this.CacheEnabled = false;
            };
            DataCollection.prototype.edit = function (object, endPoint) {
                return this.Adapter.edit(object, endPoint);
            };
            DataCollection.prototype.getFromUrl = function (endPoint) {
                return this.Adapter.getFromUrl(endPoint);
            };
            return DataCollection;
        })();
        Data.DataCollection = DataCollection;
        var JQueryAjaxODATAAdater = (function () {
            function JQueryAjaxODATAAdater(resourceUri, IdProp) {
                if (IdProp === void 0) { IdProp = "Id"; }
                this.resourceUri = resourceUri;
                this.IdProp = IdProp;
                this.suffixes = {};
            }
            JQueryAjaxODATAAdater.prototype.get = function (query) {
                var options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                if (query) {
                    options.data = "call=1";
                    if (query.hasFilters())
                        options.data += "&$filter=" + Data.QueryTranslator.toODATA(query);
                    if (query.hasSelector())
                        options.data += "&$select=" + query.getSelectString();
                }
                var url = this.resourceUri;
                if (this.suffixes && this.suffixes.get)
                    url += "/" + this.suffixes.get;
                else {
                    if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.get)
                        url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.get;
                }
                var ajaxResult = jQuery.ajax(url, options);
                //var ajaxResult = jQuery.get(this.resourceUri, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.find = function (id) {
                var url = this.resourceUri;
                if (this.suffixes && this.suffixes.find)
                    url += "/" + this.suffixes.find;
                else {
                    if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.find)
                        url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.find;
                }
                url += "/" + id;
                var options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.put = function (obj, options) {
                if (options === void 0) { options = null; }
                var url = this.resourceUri;
                if (this.suffixes && this.suffixes.put)
                    url += "/" + this.suffixes.put;
                else {
                    if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.put)
                        url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.put;
                }
                url += "/" + obj[this.IdProp];
                if (!options) {
                    options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                }
                options.method = "PUT";
                options.data = obj;
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.edit = function (obj, endPoint, options) {
                if (options === void 0) { options = null; }
                var url = this.resourceUri + "/" + endPoint;
                if (!options) {
                    options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                }
                options.method = "POST";
                options.data = obj;
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.getFromUrl = function (endPoint, options) {
                if (options === void 0) { options = null; }
                var url = this.resourceUri + "/" + endPoint;
                if (!options) {
                    options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                }
                options.method = "GET";
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.post = function (obj, options) {
                if (options === void 0) { options = null; }
                var url = this.resourceUri;
                if (this.suffixes && this.suffixes.post)
                    url += "/" + this.suffixes.post;
                else {
                    if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.post)
                        url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.post;
                }
                if (!options) {
                    options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                }
                options.method = "POST";
                options.data = obj;
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.postWithoutSuffixes = function (obj, options) {
                if (options === void 0) { options = null; }
                var url = this.resourceUri;
                if (!options) {
                    options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                }
                options.method = "POST";
                options.data = obj;
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.delete = function (id) {
                //var url = this.resourceUri + "/" + id;
                var url = this.resourceUri;
                if (this.suffixes && this.suffixes.delete)
                    url += "/" + this.suffixes.delete;
                else {
                    if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.delete)
                        url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.delete;
                }
                url += "/" + id;
                var options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                options.method = "DELETE";
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.prototype.request = function (method, url, data, options) {
                if (options === void 0) { options = null; }
                if (!options) {
                    options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
                }
                options.method = method;
                if (data)
                    options.data = data;
                var ajaxResult = jQuery.ajax(url, options);
                return new DataStorePromissForJquery(ajaxResult);
            };
            JQueryAjaxODATAAdater.defaultOptions = {
                dataType: "json",
                headers: {
                    // "content-type": "application/json",
                    "content-type": "application/x-www-form-urlencoded; charset=utf-8",
                }
            };
            JQueryAjaxODATAAdater.defaultSuffixes = {
                get: "GetAll",
                find: "Get",
                put: "Put",
                post: "Post",
                delete: "Delete",
                edit: "Post",
            };
            return JQueryAjaxODATAAdater;
        })();
        Data.JQueryAjaxODATAAdater = JQueryAjaxODATAAdater;
        /// Local storage based adapter - at this point this is fully implemented
        var LocalStorageAdapter = (function () {
            function LocalStorageAdapter(Name, IdProp) {
                if (IdProp === void 0) { IdProp = "Id"; }
                this.Name = Name;
                this.IdProp = IdProp;
            }
            LocalStorageAdapter.prototype.initialize = function (data) {
                this.saveData(data);
            };
            LocalStorageAdapter.prototype.getData = function (query) {
                var localStorageData = window.localStorage.getItem(this.Name);
                var data = null;
                if (localStorageData)
                    data = JSON.parse(localStorageData);
                // filter data
                if (data) {
                    // filter the JS array
                    if (query) {
                        // create filter function
                        var func = Function("item", "with(item){ return " + Data.QueryTranslator.toJSON(query) + "; }");
                        data.filter(function (value, index, arr) {
                            return func(value);
                        });
                    }
                    else
                        return data;
                }
                if (!data)
                    data = [];
                return data;
            };
            LocalStorageAdapter.prototype.saveData = function (data) {
                //debugger;
                window.localStorage.setItem(this.Name, JSON.stringify(data));
            };
            LocalStorageAdapter.prototype.get = function (query) {
                var data = this.getData(query);
                return new DataStorePromissForStoredData(data);
            };
            LocalStorageAdapter.prototype.find = function (id) {
                //debugger;
                var data = this.getData(null);
                for (var i = 0; i < data.length; i++) {
                    // check if offline ids match
                    if (data[i][this.IdProp] == id) {
                        return new DataStorePromissForStoredData(data[i]);
                    }
                }
                return new DataStorePromissForStoredData(null, DataStoreErrors.ObjectCouldNotBeFound);
            };
            // update an existing item
            LocalStorageAdapter.prototype.put = function (obj) {
                if (obj) {
                    var data = this.getData(null);
                    for (var i = 0; i < data.length; i++) {
                        // check if offline ids match
                        if (data[i][this.IdProp] == obj[this.IdProp]) {
                            data[i] = obj;
                            this.saveData(data);
                            return new DataStorePromissForStoredData(obj);
                        }
                    }
                    return new DataStorePromissForStoredData(null, DataStoreErrors.ObjectCouldNotBeFound);
                }
                else {
                    // return put error - object is null
                    return new DataStorePromissForStoredData(null, DataStoreErrors.ValueCannotBeNull);
                }
            };
            // create a new item
            LocalStorageAdapter.prototype.post = function (obj) {
                if (obj) {
                    var data = this.getData(null);
                    if (obj.Id)
                        obj[this.IdProp] = obj.Id;
                    else {
                        // set an offline id!?
                        obj[this.IdProp] = this.Name + "-" + new Date().getTime();
                    }
                    data.push(obj);
                    // save changes
                    this.saveData(data);
                    // return promiss
                    return new DataStorePromissForStoredData(obj);
                }
                else {
                    // return put error - object is null
                    return new DataStorePromissForStoredData(null, DataStoreErrors.ValueCannotBeNull);
                }
            };
            // delete an object
            LocalStorageAdapter.prototype.delete = function (id) {
                if (id) {
                    var data = this.getData(null);
                    for (var i = 0; i < data.length; i++) {
                        // check if offline ids match
                        if (data[i][this.IdProp] == id) {
                            // remove object
                            var obj = data[i];
                            data.splice(i, 1);
                            this.saveData(data);
                            return new DataStorePromissForStoredData(obj);
                        }
                    }
                    return new DataStorePromissForStoredData(null, DataStoreErrors.ObjectCouldNotBeFound);
                }
                else {
                    // return put error - object is null
                    return new DataStorePromissForStoredData(null, DataStoreErrors.ValueCannotBeNull);
                }
            };
            // update an existing item
            LocalStorageAdapter.prototype.edit = function (obj, endPoint) {
                if (obj) {
                    var data = this.getData(null);
                    for (var i = 0; i < data.length; i++) {
                        // check if offline ids match
                        if (data[i][this.IdProp] == obj[this.IdProp]) {
                            data[i] = obj;
                            this.saveData(data);
                            return new DataStorePromissForStoredData(obj);
                        }
                    }
                    return new DataStorePromissForStoredData(null, DataStoreErrors.ObjectCouldNotBeFound);
                }
                else {
                    // return put error - object is null
                    return new DataStorePromissForStoredData(null, DataStoreErrors.ValueCannotBeNull);
                }
            };
            LocalStorageAdapter.prototype.getFromUrl = function (endPoint) {
                var data = this.getData(null);
                return new DataStorePromissForStoredData(data);
            };
            return LocalStorageAdapter;
        })();
        Data.LocalStorageAdapter = LocalStorageAdapter;
        var JQueryStoreFunction = (function () {
            function JQueryStoreFunction(url, method) {
                if (method === void 0) { method = "POST"; }
                this.url = url;
                this.method = method;
                this.adapter = new JQueryAjaxODATAAdater(null, null);
            }
            JQueryStoreFunction.prototype.execute = function (data) {
                return this.adapter.request(this.method, this.url, data);
            };
            JQueryStoreFunction.prototype.executeMethod = function (method, urlParm, data) {
                var _method = method ? method : this.method;
                return this.adapter.request(_method, this.url + urlParm, data);
            };
            return JQueryStoreFunction;
        })();
        Data.JQueryStoreFunction = JQueryStoreFunction;
        var LocalStorageStoreFunction = (function () {
            function LocalStorageStoreFunction(executeFunction) {
                this.executeFunction = executeFunction;
            }
            LocalStorageStoreFunction.prototype.execute = function (data) {
                return this.executeFunction(data);
            };
            LocalStorageStoreFunction.prototype.executeMethod = function (method, url, data) {
                return this.executeFunction(method, url, data);
            };
            return LocalStorageStoreFunction;
        })();
        Data.LocalStorageStoreFunction = LocalStorageStoreFunction;
        /// This is a dummy promiss implementor, used to get data from an already existing dataset
        var DataStorePromissForStoredData = (function () {
            function DataStorePromissForStoredData(data, promissError) {
                if (promissError === void 0) { promissError = null; }
                this.data = data;
                this.promissError = promissError;
            }
            DataStorePromissForStoredData.prototype.then = function (successCallback, errorCallback) {
                if (!this.promissError) {
                    if (successCallback)
                        successCallback(this.data);
                }
                else {
                    if (errorCallback)
                        errorCallback(this.promissError);
                }
                return this;
            };
            DataStorePromissForStoredData.prototype.success = function (successCallback) {
                if (successCallback && !this.promissError)
                    successCallback(this.data);
                return this;
            };
            DataStorePromissForStoredData.prototype.error = function (errorCallback) {
                if (this.promissError && errorCallback)
                    errorCallback(this.promissError);
                return this;
            };
            return DataStorePromissForStoredData;
        })();
        Data.DataStorePromissForStoredData = DataStorePromissForStoredData;
        /// This is a jquery based returned promiss, to work with jquery ajax adapters
        var DataStorePromissForJquery = (function () {
            function DataStorePromissForJquery(innerPromiss, promissError) {
                if (promissError === void 0) { promissError = null; }
                this.innerPromiss = innerPromiss;
                this.promissError = promissError;
                this.innerPromiss = this.innerPromiss;
            }
            DataStorePromissForJquery.prototype.then = function (successCallback, errorCallback) {
                this.innerPromiss.then(successCallback, errorCallback);
                return this;
            };
            DataStorePromissForJquery.prototype.success = function (successCallback) {
                this.innerPromiss.then(successCallback);
                return this;
            };
            DataStorePromissForJquery.prototype.error = function (errorCallback) {
                this.innerPromiss.then(null, errorCallback);
                return this;
            };
            return DataStorePromissForJquery;
        })();
        Data.DataStorePromissForJquery = DataStorePromissForJquery;
        /// data item to be stored in the cache
        var CacheData = (function () {
            function CacheData(data, ttl) {
                this.DateCreated = new Date();
                this.Data = data;
                this.TTL = ttl;
            }
            CacheData.prototype.isValid = function () {
                return new Date().getTime() - this.DateCreated.getTime() <= this.TTL * 1000;
            };
            return CacheData;
        })();
        Data.CacheData = CacheData;
        /// Cache manager class - to store key value pairs for a while
        var CacheManager = (function () {
            function CacheManager() {
                this.cacheData = new Array();
            }
            CacheManager.prototype.add = function (key, data, ttl) {
                var d = new CacheData(data, ttl);
                this.cacheData[key] = d;
            };
            CacheManager.prototype.remove = function (key) {
                if (this.cacheData[key])
                    this.cacheData[key] = null;
            };
            CacheManager.prototype.get = function (key) {
                var data = this.cacheData[key];
                if (data == null)
                    return null;
                if (data.isValid())
                    return data.Data;
                else {
                    // remove the item from cache
                    this.remove(key);
                    return null;
                }
            };
            return CacheManager;
        })();
        Data.CacheManager = CacheManager;
        /*
        // test local storage examples
        var localStorageStore: DataStore = new DataStore();
        var localStorageAdapter = new LocalStorageAdapter<any>("Posts");
        var localPosts: DataCollection<any> = localStorageStore.RegisterCollection("Posts", localStorageAdapter);
        localStorageAdapter.initialize([]);
        localPosts.create({ Id: 1, Name: "This is the first fucking post" });
        var secondPost = null;
        localPosts.create({ Id: 2, Name: "This is the first fucking post" }).then((data) => {
            secondPost = data;
        },null);
        localPosts.create({ Id: 3, Name: "This is the first fucking post" });
        localPosts.create({ Id: 4, Name: "This is the first fucking post" });
        
        secondPost.Name = "This is an updated post";
        localPosts.update(secondPost);
        
        localPosts.search(null).then((data) => {
            alert(JSON.stringify(data));
        }, null);
        
        localPosts.delete(secondPost.Id).then((data) => {
            localPosts.search(null).then((data) => { alert(JSON.stringify(data));}, null);
        }, null);
        
        
        
        // Tests for the adapter architecture
        var store: DataStore = new DataStore();
        store.RegisterCollection("Posts", new JQueryAjaxODATAAdater("http://jsonplaceholder.typicode.com/posts", "id"));
        
        var posts = <DataCollection<any>>store.Collections["Posts"];
        posts.enableCaching();
        
        posts.search(null).then((data) => {
            localStorageAdapter.IdProp = "id";
            localStorageAdapter.initialize(data);
            localPosts.search({ id: 2 }).then((data) => {
                //alert(JSON.stringify(data));
            }, null);
            
        }, null);
        
        posts.search({ id: 1 }).then((posts) => {
            //alert(JSON.stringify(posts));
        }, null);
        
        // test the find
        posts.find("1").then((data) => {
            // find worked
            // test update
            // post works...
            // test update / put
            data.title = "updated title";
            posts.update(data).then((data) => {
                // update works
                //alert(JSON.stringify(data));
            }, null);
        
            // test delete :)
            posts.delete(data).then((data) => {
                // update works
                alert(JSON.stringify(data));
            }, null);
        
            // test the post new item
            delete data.id;
            posts.create(data).then((data) => {
                // create works
                // alert(JSON.stringify(data)
            }, null);
        }, null);
        */
        // web api tests
        //var store: DataStore = new DataStore();
        //var sites: DataCollection<any> = store.RegisterCollection("Site", new JQueryAjaxODATAAdater("http://localhost:4636/api/Site", "Id"));
        //sites.enableCaching();
        //sites.search({ CustomerId: 2 }).then((data) => {
        //    alert(JSON.stringify(data));
        //}, null);
        // configure data store
        Data.DataManager = new DataStore();
        Data.Configure = function () {
            // initialize the data manager
            //DataManager = new DataStore();
            if (TKWApp.Configuration.ConfigurationManager.WorkMode == TKWApp.Configuration.WorkMode.ONLINE) {
                // register building collection
                Data.DataManager.RegisterCollection("Clients", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Client", "Id"));
                Data.DataManager.RegisterCollection("Buildings", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Building", "Id"));
                Data.DataManager.RegisterCollection("OfflineBuildings", new LocalStorageAdapter("Buildings", "Id"));
                Data.DataManager.RegisterCollection("OfflineHotspotDisplayTypes", new LocalStorageAdapter("HotspotDisplayTypes", "Id"));
                Data.DataManager.RegisterCollection("OfflineHotspotActionTypes", new LocalStorageAdapter("HotspotActionTypes", "Id"));
                Data.DataManager.RegisterCollection("OfflineBuildingPlans", new LocalStorageAdapter("BuildingPlans", "Id"));
                Data.DataManager.RegisterCollection("PricingInfos", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/PricingInfo", "Id"));
                Data.DataManager.RegisterCollection("BuildingDisasterInfos", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingDisasterInfo", "Id"));
                Data.DataManager.RegisterCollection("ContactInfos", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/ContactInfo", "Id"));
                Data.DataManager.RegisterCollection("BuildingPlans", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan", "Id"));
                Data.DataManager.RegisterCollection("HotspotDisplayTypes", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotDisplayType", "Id"));
                Data.DataManager.RegisterCollection("HotspotActionTypes", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotActionType", "Id"));
                Data.DataManager.RegisterCollection("Hotspots", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot", "Id"));
                Data.DataManager.RegisterCollection("HotspotFiles", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotFile", "Id"));
                Data.DataManager.RegisterCollection("BuildingFiles", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingFile", "Id"));
                Data.DataManager.RegisterCollection("BuildingImages", new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingImage", "Id"));
                // search will only work in online mode
                // therefor there is no data collection registration in offline mode
                // just to make sure we do not get into troubble
                Data.DataManager.RegisterCollection("Search", new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Search", "Id"));
                Data.DataManager.RegisterStoreFunction("PerformBuildingPlanBulkInsert", new JQueryStoreFunction(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/BulkPlanInsert", "POST"));
                Data.DataManager.RegisterStoreFunction("PerformSortBuildingPlan", new JQueryStoreFunction(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/SetOrder", "POST"));
                Data.DataManager.RegisterStoreFunction("PerformSortBuildingImage", new JQueryStoreFunction(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingImage/SetOrder", "POST"));
                Data.DataManager.RegisterStoreFunction("UpdateHotpotsDisplayDetails", new JQueryStoreFunction(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot/UpdateDisplayDetails", "POST"));
                Data.DataManager.RegisterStoreFunction("UpdateHotpotDisplayDetail", new JQueryStoreFunction(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot/UpdateDisplayDetail", "POST"));
                Data.DataManager.RegisterStoreFunction("FileManager", new JQueryStoreFunction(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/FileManager", "POST"));
            }
            else {
                Data.DataManager.RegisterCollection("OfflineBuildings", new LocalStorageAdapter("Buildings", "Id"));
                Data.DataManager.RegisterCollection("OfflinePlans", new LocalStorageAdapter("OfflinePlans", "Id"));
                Data.DataManager.RegisterCollection("OfflineHotspotDisplayTypes", new LocalStorageAdapter("HotspotDisplayTypes", "Id"));
                Data.DataManager.RegisterCollection("OfflineHotspotActionTypes", new LocalStorageAdapter("HotspotActionTypes", "Id"));
                Data.DataManager.RegisterCollection("OfflineBuildingPlans", new LocalStorageAdapter("BuildingPlans", "Id"));
                // register building collection
                Data.DataManager.RegisterCollection("Clients", new LocalStorageAdapter("Clients", "Id"));
                Data.DataManager.RegisterCollection("Buildings", new LocalStorageAdapter("Buildings", "Id"));
                Data.DataManager.RegisterCollection("OfflineBuildings", new LocalStorageAdapter("Buildings", "Id"));
                Data.DataManager.RegisterCollection("PricingInfos", new LocalStorageAdapter("PricingInfos", "Id"));
                Data.DataManager.RegisterCollection("BuildingDisasterInfos", new LocalStorageAdapter("BuildingDisasterInfos", "Id"));
                Data.DataManager.RegisterCollection("ContactInfos", new LocalStorageAdapter("ContactInfos", "Id"));
                Data.DataManager.RegisterCollection("BuildingPlans", new LocalStorageAdapter("BuildingPlans", "Id"));
                Data.DataManager.RegisterCollection("HotspotDisplayTypes", new LocalStorageAdapter("HotspotDisplayTypes", "Id"));
                Data.DataManager.RegisterCollection("HotspotActionTypes", new LocalStorageAdapter("HotspotActionTypes", "Id"));
                Data.DataManager.RegisterCollection("Hotspots", new LocalStorageAdapter("Hotspots", "Id"));
                Data.DataManager.RegisterCollection("HotspotFiles", new TKWApp.Data.LocalStorageAdapter("HotspotFiles", "Id"));
                Data.DataManager.RegisterCollection("BuildingFiles", new TKWApp.Data.LocalStorageAdapter("BuildingFiles", "Id"));
                Data.DataManager.RegisterCollection("BuildingImages", new TKWApp.Data.LocalStorageAdapter("BuildingImages", "Id"));
                Data.DataManager.RegisterStoreFunction("PerformBuildingPlanBulkInsert", new LocalStorageStoreFunction(function (data) {
                    // do something
                    // here we do something
                    // return a promiss
                    return new DataStorePromissForStoredData(data);
                }));
            }
        };
    })(Data = TKWApp.Data || (TKWApp.Data = {}));
})(TKWApp || (TKWApp = {}));
