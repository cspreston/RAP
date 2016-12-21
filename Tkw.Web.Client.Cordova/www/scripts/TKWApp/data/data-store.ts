module TKWApp.Data {
    export class DataStore {
        public CacheManager = new CacheManager();
        public Collections: Array<IDataCollection<any>> = new Array<IDataCollection<any>>();

        StoreFunctions: Array<IStoreFunction> = new Array<IStoreFunction>();

        public RegisterCollection(collectionName: string, adapter: IAdapter) {
            // register collection to the store
            var collection: DataCollection<any> = new DataCollection<any>();
            collection.Adapter = adapter;
            collection.CacheManager = this.CacheManager;
            this.Collections[collectionName] = collection;
            return collection;
        }

        public RegisterStoreFunction(functionName: string, storeFunction: IStoreFunction) {
            // register store function
            this.StoreFunctions[functionName] = storeFunction;
        }
        public get(collectionName): IDataCollection<any> {
            return this.Collections[collectionName];
        }
        public getFunction(functionName: string): IStoreFunction {
            return this.StoreFunctions[functionName];
        }

        constructor() {
        }
    }
    var DataStoreErrors = {
        ValueCannotBeNull: {
            Code: 150,
            Message: "Error cannot be null."
        },
        ObjectCouldNotBeFound: {
            Code: 180,
            Message: "Object could not be found"
        },
        create: (code, message) => {
            return {
                Code: code,
                Message: message
            }
        }
    }

    export interface IStoreFunction {
        execute(data: any): IPromiss;
        executeMethod(method: string, urlParm: string, data: any): IPromiss;
    }
    export interface IDataCollection<T> {
        Name: string;
        Adapter: IAdapter;
        CacheManager: CacheManager;
        search(query: Query): IPromiss;
        find(id: string): IPromiss;
        create(object: T): IPromiss;
        update(object: T): IPromiss;
        delete(id: any): IPromiss;
        edit(object: T, endPoint: string): IPromiss;
        getFromUrl(endPoint: string): IPromiss;
        enableCaching();
        disableCaching();
    }
    export class DataCollection<T> implements IDataCollection<T> {
        public Adapter: IAdapter;
        public CacheManager: CacheManager;
        public Name: string;

        public RegisteredFunctions: Array<IStoreFunction>;

        private DataItems: Array<T> = new Array<T>();

        private CacheEnabled: boolean = false;
        private CacheTimeout: number = 60;
        private CacheLastUpdated: Date = new Date(2000, 1, 1);

        constructor() {

        }

        public search(query: Query): IPromiss {
            var cacheKey: string = null;
            if (this.CacheEnabled) {
                // try to get from cache
                if (query)
                    cacheKey = this.Name + JSON.stringify(query);
                else cacheKey = this.Name;

                var data = this.CacheManager.get(cacheKey);
                if (data != null) {
                    return new DataStorePromissForStoredData(data);
                }
            }

            // data was not found in cache, or cache is not alive
            var self = this;
            var promiss: IPromiss = this.Adapter.get(query).then((data) => {
                if (self.CacheEnabled) {
                    self.CacheManager.add(cacheKey, data, self.CacheTimeout);
                }
            }, null);
            return promiss;
        }

        public find(id: string): IPromiss {
            return this.Adapter.find(id);
        }

        public create(object: T): IPromiss {
            return this.Adapter.post(object);
        }

        public update(object: T): IPromiss {
            return this.Adapter.put(object);
        }

        public delete(id: any): IPromiss {
            return this.Adapter.delete(id);
        }

        public enableCaching() {
            this.CacheEnabled = true;
        }

        public disableCaching() {
            this.CacheEnabled = false;
        }

        public edit(object: T, endPoint: string): IPromiss {
            return this.Adapter.edit(object, endPoint);
        }
        public getFromUrl(endPoint: string): IPromiss {
            return this.Adapter.getFromUrl(endPoint);
        }
    }

    export interface IAdapter {
        IdProp: string;
        get(query: Query): IPromiss;
        find(id: string): IPromiss;
        put(obj: Object): IPromiss;
        post(obj: Object): IPromiss;
        edit(obj: Object, endPoint: string): IPromiss;
        getFromUrl(endPoint: string): IPromiss;
        delete(id: string): IPromiss;
    }

    export class JQueryAjaxODATAAdater implements IAdapter {
        public static defaultOptions: any = {
            dataType: "json",
            headers: {
                // "content-type": "application/json",
                "content-type": "application/x-www-form-urlencoded; charset=utf-8",
            }
        }
        public static defaultSuffixes: any = {
            get: "GetAll",
            find: "Get",
            put: "Put",
            post: "Post",
            delete: "Delete",
            edit: "Post",
        }
        public suffixes: any = {
        }
        constructor(public resourceUri, public IdProp: string = "Id") {
        }
        public get(query: Query): IPromiss {
            var options: any = Object.create(JQueryAjaxODATAAdater.defaultOptions);

            if (query) {
                options.data = "call=1"
                if (query.hasFilters())
                    options.data += "&$filter=" + QueryTranslator.toODATA(query);
                if (query.hasSelector())
                    options.data += "&$select=" + query.getSelectString();
            }

            var url = this.resourceUri;
            if (this.suffixes && this.suffixes.get) url += "/" + this.suffixes.get;
            else {
                if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.get)
                    url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.get;
            }

            var ajaxResult = jQuery.ajax(url, options);
            //var ajaxResult = jQuery.get(this.resourceUri, options);
            return new DataStorePromissForJquery(ajaxResult);
        }
        public find(id: string): IPromiss {
            var url = this.resourceUri;
            if (this.suffixes && this.suffixes.find) url += "/" + this.suffixes.find;
            else {
                if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.find) url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.find;
            }
            url += "/" + id;
            var options: any = Object.create(JQueryAjaxODATAAdater.defaultOptions);
            var ajaxResult = jQuery.ajax(url, options);
            return new DataStorePromissForJquery(ajaxResult);
        }
        public put(obj: Object, options: any = null): IPromiss {
            var url = this.resourceUri;
            if (this.suffixes && this.suffixes.put) url += "/" + this.suffixes.put;
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
        }
        public edit(obj: Object, endPoint: string, options: any = null): IPromiss {
            var url = this.resourceUri + "/" + endPoint;
            if (!options) {
                options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
            }
            options.method = "POST";
            options.data = obj;

            var ajaxResult = jQuery.ajax(url, options);
            return new DataStorePromissForJquery(ajaxResult);
        }
        public getFromUrl(endPoint: string, options: any = null): IPromiss {
            var url = this.resourceUri + "/" + endPoint;
            if (!options) {
                options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
            }
            options.method = "GET";
            var ajaxResult = jQuery.ajax(url, options);
            return new DataStorePromissForJquery(ajaxResult);
        }
        public post(obj: Object, options: any = null): IPromiss {
            var url = this.resourceUri;
            if (this.suffixes && this.suffixes.post) url += "/" + this.suffixes.post;
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
        }
        public postWithoutSuffixes(obj: Object, options: any = null): IPromiss {
            var url = this.resourceUri;
            if (!options) {
                options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
            }
            options.method = "POST";
            options.data = obj;
            var ajaxResult = jQuery.ajax(url, options);
            return new DataStorePromissForJquery(ajaxResult);
        }
        public delete(id: string): IPromiss {
            //var url = this.resourceUri + "/" + id;
            var url = this.resourceUri;
            if (this.suffixes && this.suffixes.delete) url += "/" + this.suffixes.delete;
            else {
                if (JQueryAjaxODATAAdater.defaultSuffixes && JQueryAjaxODATAAdater.defaultSuffixes.delete)
                    url += "/" + JQueryAjaxODATAAdater.defaultSuffixes.delete;
            }
            url += "/" + id;

            var options: any = Object.create(JQueryAjaxODATAAdater.defaultOptions);
            options.method = "DELETE";

            var ajaxResult = jQuery.ajax(url, options);
            return new DataStorePromissForJquery(ajaxResult);
        }
        public request(method: string, url: string, data: any, options: any = null) {
            if (!options) {
                options = Object.create(JQueryAjaxODATAAdater.defaultOptions);
            }
            options.method = method;
            if (data)
                options.data = data;
            var ajaxResult = jQuery.ajax(url, options);
            return new DataStorePromissForJquery(ajaxResult);
        }
    }
    /// Local storage based adapter - at this point this is fully implemented
    export class LocalStorageAdapter<T> implements IAdapter {

        constructor(public Name: string, public IdProp: string = "Id") {
        }
        public initialize(data: any) {
            this.saveData(data);
        }
        private getData(query: Query): any {
            var localStorageData = window.localStorage.getItem(this.Name);
            var data = null;
            if (localStorageData) data = JSON.parse(localStorageData);
            // filter data
            if (data) {
                // filter the JS array
                if (query) {
                    // create filter function
                    var func = Function("item", "with(item){ return " + QueryTranslator.toJSON(query) + "; }");
                    (<Array<any>>data).filter((value: any, index: number, arr: any[]) => {
                        return func(value);
                    });
                }
                else return data;
            }
            if (!data) data = [];
            return data;
        }
        private saveData(data: any) {
            window.localStorage.setItem(this.Name, JSON.stringify(data));
        }
        public get(query: Query): IPromiss {
            var data = this.getData(query);
            return new DataStorePromissForStoredData(data);
        }
        public find(id: string): IPromiss {
            var data = this.getData(null);
            for (var i = 0; i < data.length; i++) {
                // check if offline ids match
                if (data[i][this.IdProp] == id) {
                    return new DataStorePromissForStoredData(data[i]);
                }
            }
            return new DataStorePromissForStoredData(null, DataStoreErrors.ObjectCouldNotBeFound);
        }
        // update an existing item
        public put(obj: Object): IPromiss {
            if (obj) {
                var data = this.getData(null);
                for (var i = 0; i < data.length; i++) {
                    // check if offline ids match
                    if (data[i][this.IdProp] == (<any>obj)[this.IdProp]) {
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
        }
        // create a new item
        public post(obj: Object): IPromiss {
            if (obj) {
                var data = this.getData(null);
                if ((<any>obj).Id)
                    (<any>obj)[this.IdProp] = (<any>obj).Id;
                else {
                    // set an offline id!?
                    (<any>obj)[this.IdProp] = this.Name + "-" + new Date().getTime();
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
        }
        // delete an object
        public delete(id: string): IPromiss {
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
        }

        // update an existing item
        public edit(obj: Object, endPoint: string): IPromiss {
            if (obj) {
                var data = this.getData(null);
                for (var i = 0; i < data.length; i++) {
                    // check if offline ids match
                    if (data[i][this.IdProp] == (<any>obj)[this.IdProp]) {
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
        }
        public getFromUrl(endPoint: string): IPromiss {
            var data = this.getData(null);
            return new DataStorePromissForStoredData(data);
        }
    }

    export class JQueryStoreFunction implements IStoreFunction {
        private adapter: JQueryAjaxODATAAdater;
        constructor(public url, public method = "POST") {
            this.adapter = new JQueryAjaxODATAAdater(null, null);
        }
        execute(data: any): IPromiss {
            return this.adapter.request(this.method, this.url, data);
        }
        executeMethod(method: string, urlParm: string, data: any): IPromiss {
            var _method = method ? method : this.method;
            return this.adapter.request(_method, this.url + urlParm, data);
        }
    }

    export class LocalStorageStoreFunction implements IStoreFunction {
        constructor(private executeFunction: Function) {
        }
        execute(data: any): IPromiss {
            return this.executeFunction(data);
        }
        executeMethod(method: string, url: string, data: any): IPromiss {
            return this.executeFunction(method, url, data);
        }
    }

    /// This is the base promiss data contract
    export interface IPromiss {
        promissError: any;
        then(successCallback: Function, errorCallback: Function): IPromiss;
        success(successCallback: Function): IPromiss;
        error(errorCallback: Function): IPromiss;
    }

    /// This is a dummy promiss implementor, used to get data from an already existing dataset
    export class DataStorePromissForStoredData implements IPromiss {
        constructor(public data: any, public promissError: any = null) {
        }
        public then(successCallback: Function, errorCallback: Function): IPromiss {
            if (!this.promissError) {
                if (successCallback) successCallback(this.data);
            }
            else {
                if (errorCallback) errorCallback(this.promissError);
            }
            return this;
        }
        public success(successCallback: Function): IPromiss {
            if (successCallback && !this.promissError) successCallback(this.data);
            return this;
        }
        public error(errorCallback: Function): IPromiss {
            if (this.promissError && errorCallback) errorCallback(this.promissError);
            return this;
        }
    }
    /// This is a jquery based returned promiss, to work with jquery ajax adapters
    export class DataStorePromissForJquery implements IPromiss {
        constructor(public innerPromiss: any, public promissError: any = null) {
            this.innerPromiss = this.innerPromiss;
        }
        public then(successCallback: Function, errorCallback: Function): any {
            this.innerPromiss.then(<any>successCallback, <any>errorCallback);
            return this;
        }
        public success(successCallback: Function): any {
            this.innerPromiss.then(<any>successCallback);
            return this;
        }
        public error(errorCallback: Function): any {
            this.innerPromiss.then(null, <any>errorCallback);
            return this;
        }
    }
    /// data item to be stored in the cache
    export class CacheData {
        public DateCreated: Date = new Date();
        public Data: any;
        public TTL: number;
        constructor(data: any, ttl: number) {
            this.Data = data;
            this.TTL = ttl;
        }

        isValid(): boolean {
            return new Date().getTime() - this.DateCreated.getTime() <= this.TTL * 1000
        }
    }

    /// Cache manager class - to store key value pairs for a while
    export class CacheManager {
        public cacheData: Array<CacheData> = new Array<CacheData>();
        constructor() {
        }
        add(key: string, data: any, ttl: number) {
            var d = new CacheData(data, ttl);
            this.cacheData[key] = d;
        }
        remove(key: string) {
            if (this.cacheData[key])
                this.cacheData[key] = null;
        }
        get(key: string): any {
            var data: CacheData = this.cacheData[key];
            if (data == null) return null;
            if (data.isValid()) return data.Data;
            else {
                // remove the item from cache
                this.remove(key);
                return null;
            }
        }
    }


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
    export var DataManager: DataStore = new DataStore();
    export var Configure = () => {
        // initialize the data manager
        //DataManager = new DataStore();

        if (TKWApp.Configuration.ConfigurationManager.WorkMode == TKWApp.Configuration.WorkMode.ONLINE) {
            // register building collection

            DataManager.RegisterCollection("Clients",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Client", "Id"));

            DataManager.RegisterCollection("Buildings",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Building", "Id"));

            DataManager.RegisterCollection("OfflineBuildings", new LocalStorageAdapter("Buildings", "Id"));
            DataManager.RegisterCollection("OfflineHotspotDisplayTypes", new LocalStorageAdapter("HotspotDisplayTypes", "Id"));
            DataManager.RegisterCollection("OfflineHotspotActionTypes", new LocalStorageAdapter("HotspotActionTypes", "Id"));

            DataManager.RegisterCollection("PricingInfos",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/PricingInfo", "Id"));

            DataManager.RegisterCollection("BuildingDisasterInfos",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingDisasterInfo", "Id"));

            DataManager.RegisterCollection("ContactInfos",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/ContactInfo", "Id"));

            DataManager.RegisterCollection("BuildingPlans",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan", "Id"));

            DataManager.RegisterCollection("HotspotDisplayTypes",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotDisplayType", "Id"));

            DataManager.RegisterCollection("HotspotActionTypes",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotActionType", "Id"));

            DataManager.RegisterCollection("Hotspots",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot", "Id"));

            DataManager.RegisterCollection("HotspotFiles",
                new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/HotspotFile", "Id"));

            DataManager.RegisterCollection("BuildingFiles",
                new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingFile", "Id"));

            DataManager.RegisterCollection("BuildingImages",
                new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingImage", "Id"));


            // search will only work in online mode
            // therefor there is no data collection registration in offline mode
            // just to make sure we do not get into troubble
            DataManager.RegisterCollection("Search",
                new JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Search", "Id"));

            DataManager.RegisterStoreFunction("PerformBuildingPlanBulkInsert", new JQueryStoreFunction(
                TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/BulkPlanInsert", "POST"));

            DataManager.RegisterStoreFunction("PerformSortBuildingPlan", new JQueryStoreFunction(
                TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingPlan/SetOrder", "POST"));

            DataManager.RegisterStoreFunction("PerformSortBuildingImage", new JQueryStoreFunction(
                TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/BuildingImage/SetOrder", "POST"));

            DataManager.RegisterStoreFunction("UpdateHotpotsDisplayDetails", new JQueryStoreFunction(
                TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot/UpdateDisplayDetails", "POST"));

            DataManager.RegisterStoreFunction("UpdateHotpotDisplayDetail", new JQueryStoreFunction(
                TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Hotspot/UpdateDisplayDetail", "POST"));

            DataManager.RegisterStoreFunction("FileManager", new JQueryStoreFunction(
                TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/FileManager", "POST"));
        }
        else {
            DataManager.RegisterCollection("OfflineBuildings", new LocalStorageAdapter("Buildings", "Id"));
            DataManager.RegisterCollection("OfflineHotspotDisplayTypes", new LocalStorageAdapter("HotspotDisplayTypes", "Id"));
            DataManager.RegisterCollection("OfflineHotspotActionTypes", new LocalStorageAdapter("HotspotActionTypes", "Id"));

            // register building collection
            DataManager.RegisterCollection("Clients",
                new LocalStorageAdapter("Clients", "Id"));

            DataManager.RegisterCollection("Buildings",
                new LocalStorageAdapter("Buildings", "Id"));

            DataManager.RegisterCollection("OfflineBuildings",
                new LocalStorageAdapter("Buildings", "Id"));

            DataManager.RegisterCollection("PricingInfos",
                new LocalStorageAdapter("PricingInfos", "Id"));

            DataManager.RegisterCollection("BuildingDisasterInfos",
                new LocalStorageAdapter("BuildingDisasterInfos", "Id"));

            DataManager.RegisterCollection("ContactInfos",
                new LocalStorageAdapter("ContactInfos", "Id"));

            DataManager.RegisterCollection("BuildingPlans",
                new LocalStorageAdapter("BuildingPlans", "Id"));

            DataManager.RegisterCollection("HotspotDisplayTypes",
                new LocalStorageAdapter("HotspotDisplayTypes", "Id"));

            DataManager.RegisterCollection("HotspotActionTypes",
                new LocalStorageAdapter("HotspotActionTypes", "Id"));

            DataManager.RegisterCollection("Hotspots",
                new LocalStorageAdapter("Hotspots", "Id"));

            DataManager.RegisterCollection("HotspotFiles",
                new TKWApp.Data.LocalStorageAdapter("HotspotFiles", "Id"));

            DataManager.RegisterCollection("BuildingFiles",
                new TKWApp.Data.LocalStorageAdapter("BuildingFiles", "Id"));

            DataManager.RegisterCollection("BuildingImages",
                new TKWApp.Data.LocalStorageAdapter("BuildingImages", "Id"));

            DataManager.RegisterStoreFunction("PerformBuildingPlanBulkInsert", new LocalStorageStoreFunction((data: any) => {
                // do something
                // here we do something
                // return a promiss
                return new DataStorePromissForStoredData(data);
            }));
        }

    }
}