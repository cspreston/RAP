var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TKWApp;
(function (TKWApp) {
    var Data;
    (function (Data) {
        var OperationTranslator = (function () {
            function OperationTranslator() {
                this.TranslationTable = null;
            }
            OperationTranslator.prototype.translate = function (op) {
                return this.TranslationTable[op];
            };
            return OperationTranslator;
        }());
        Data.OperationTranslator = OperationTranslator;
        var ODATAOperationTranslator = (function (_super) {
            __extends(ODATAOperationTranslator, _super);
            function ODATAOperationTranslator() {
                _super.call(this);
                this.TranslationTable = {
                    "and": "and",
                    "or": "or",
                    "eq": "eq",
                };
            }
            return ODATAOperationTranslator;
        }(OperationTranslator));
        Data.ODATAOperationTranslator = ODATAOperationTranslator;
        var JSONOperationTranslator = (function (_super) {
            __extends(JSONOperationTranslator, _super);
            function JSONOperationTranslator() {
                _super.call(this);
                this.TranslationTable = {
                    "and": "&&",
                    "or": "||",
                    "eq": "==",
                };
            }
            return JSONOperationTranslator;
        }(OperationTranslator));
        Data.JSONOperationTranslator = JSONOperationTranslator;
        var SimpleFilter = (function () {
            function SimpleFilter() {
            }
            SimpleFilter.prototype.eq = function (field, value) {
                this.field = field;
                this.operation = "eq";
                this.value = value;
                return this;
            };
            SimpleFilter.prototype.filter = function (filter) {
                console.log("SimpleFilter - filter operation is not supported");
            };
            SimpleFilter.prototype.toString = function (translator) {
                if (translator)
                    return "(" + this.field + " " + translator.translate(this.operation) + " " + "'" + this.value + "')";
                else
                    return "(" + this.field + " " + this.operation + " " + "'" + this.value + "')";
            };
            return SimpleFilter;
        }());
        Data.SimpleFilter = SimpleFilter;
        var ComposedFilter = (function () {
            function ComposedFilter(query, operation) {
                if (operation === void 0) { operation = null; }
                this.query = query;
                this.Items = new Array();
                this.Operation = operation;
            }
            ComposedFilter.prototype.eq = function (field, value) {
                var sFilter = new SimpleFilter();
                sFilter.eq(field, value);
                this.Items.push(sFilter);
                return this;
            };
            ComposedFilter.prototype.filter = function (filter) {
                this.Items.push(filter);
                return this;
            };
            ComposedFilter.prototype.done = function () {
                return this.query;
            };
            ComposedFilter.prototype.toString = function (translator) {
                var str = "(";
                for (var i = 0; i < this.Items.length; i++) {
                    str += this.Items[i].toString(translator);
                    if (i != this.Items.length - 1) {
                        if (translator)
                            str += " " + translator.translate(this.Operation) + " ";
                        else
                            str += " " + this.Operation + " ";
                    }
                }
                str += ")";
                return str;
            };
            return ComposedFilter;
        }());
        Data.ComposedFilter = ComposedFilter;
        var Query = (function () {
            function Query() {
                this.selector = new Array();
            }
            Query.prototype.hasFilters = function () {
                return this.filter != null;
            };
            Query.prototype.hasSelector = function () {
                return this.selector != null && this.selector.length > 0;
            };
            Query.prototype.and = function () {
                this.filter = new ComposedFilter(this);
                this.filter.Operation = "and";
                return this.filter;
            };
            Query.prototype.select = function () {
                if (arguments)
                    for (var i = 0; i < arguments.length; i++) {
                        if (typeof arguments[i] === 'string' || arguments[i] instanceof String)
                            this.selector.push(arguments[i]);
                    }
                return this;
            };
            Query.prototype.getFilterString = function (translator) {
                if (!this.filter)
                    return "";
                return this.filter.toString(translator);
            };
            Query.prototype.getSelectString = function () {
                if (!this.selector)
                    return "";
                return this.selector.join(",");
            };
            return Query;
        }());
        Data.Query = Query;
        var QueryTranslator = (function () {
            function QueryTranslator() {
            }
            QueryTranslator.toODATA = function (query) {
                return query.getFilterString(new ODATAOperationTranslator());
            };
            QueryTranslator.toJSON = function (query) {
                return query.getFilterString(new JSONOperationTranslator());
            };
            return QueryTranslator;
        }());
        Data.QueryTranslator = QueryTranslator;
    })(Data = TKWApp.Data || (TKWApp.Data = {}));
})(TKWApp || (TKWApp = {}));
