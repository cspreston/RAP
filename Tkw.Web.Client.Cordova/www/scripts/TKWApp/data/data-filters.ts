module TKWApp.Data {
    export interface IOperationTranslator {
        translate(op: string): string;
    }
    export class OperationTranslator implements IOperationTranslator {
        public TranslationTable: any = null;
        translate(op: string) {
            return this.TranslationTable[op];
        }
    }
    export class ODATAOperationTranslator extends OperationTranslator {
        constructor() {
            super();
            this.TranslationTable = {
                "and": "and",
                "or": "or",
                "eq": "eq",
            }
        }
    }
    export class JSONOperationTranslator extends OperationTranslator {
        constructor() {
            super();
            this.TranslationTable = {
                "and": "&&",
                "or": "||",
                "eq": "==",
            }
        }
    }
    export interface IFilter {
        eq(field: string, value: any): IFilter;
        filter(filter: IFilter);
        toString(translator: IOperationTranslator): string;
    }
    export class SimpleFilter implements IFilter {
        public field: string; public operation: string; public value: any;
        constructor() {
        }

        eq(field: string, value: any): IFilter {
            this.field = field; this.operation = "eq";
            this.value = value;
            return this;
        }

        filter(filter: IFilter) {
            console.log("SimpleFilter - filter operation is not supported");
        }

        toString(translator: IOperationTranslator): string {
            if (translator)
                return "(" + this.field + " " + translator.translate(this.operation) + " " + "'" + this.value + "')";
            else return "(" + this.field + " " + this.operation + " " + "'" + this.value + "')";
        }
    }
    export class ComposedFilter implements IFilter {
        public Operation: string;
        public Items: Array<IFilter> = new Array<IFilter>();
        constructor(public query: Query, operation: string = null) {
            this.Operation = operation;
        }
        eq(field: string, value: any): IFilter {
            var sFilter: SimpleFilter = new SimpleFilter();
            sFilter.eq(field, value);
            this.Items.push(sFilter);
            return this;
        }
        filter(filter: IFilter) {
            this.Items.push(filter);
            return this;
        }
        done() {
            return this.query;
        }

        toString(translator: IOperationTranslator) {
            var str = "(";
            for (var i = 0; i < this.Items.length; i++) {
                str += this.Items[i].toString(translator);
                if (i != this.Items.length - 1) {
                    if (translator) str += " " + translator.translate(this.Operation) + " ";
                    else str += " " + this.Operation + " ";
                }
            }
            str += ")";
            return str;
        }
    }

    export class Query {
        public filter: ComposedFilter;
        public selector: Array<string> = new Array<string>();
        constructor() {

        }
        hasFilters() {
            return this.filter != null;
        }
        hasSelector() {
            return this.selector != null && this.selector.length>0;
        }

        and(): ComposedFilter {
            this.filter = new ComposedFilter(this);
            this.filter.Operation = "and";
            return this.filter;
        }

        select() {
            if(arguments)
                for (var i = 0; i < arguments.length; i++) {
                    if (typeof arguments[i] === 'string' || arguments[i] instanceof String)
                        this.selector.push(arguments[i]);
                }
            return this;
        }

        getFilterString(translator: IOperationTranslator): string {
            if (!this.filter) return "";
            return this.filter.toString(translator);
        }

        getSelectString(): string {
            if (!this.selector) return "";
            return this.selector.join(",");
        }
    }
    

    export class QueryTranslator {
        static toODATA(query: Query): string {
            return query.getFilterString(new ODATAOperationTranslator());
        }
        static toJSON(query: Query): string {
            return query.getFilterString(new JSONOperationTranslator());
        }
    }

    //// tests
    //var q = new Query();
    //q.and().eq("A", "1").eq("B", "1").filter(new ComposedFilter(null, "or").eq("C", "2").eq("D", "3"));

    //alert(QueryTranslator.toODATA(q));
    //alert(QueryTranslator.toJSON(q));

    //var a = {
    //    A: "2", B: "1", C: "2", D: "2"
    //};
    //var func = Function("item", "with(item){ return " + QueryTranslator.toJSON(q) + "; }");



    //var result = func(a);
    //alert(result);
   
}