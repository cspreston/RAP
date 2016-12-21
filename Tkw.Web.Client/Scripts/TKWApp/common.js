var TKWApp;
(function (TKWApp) {
    var ObservableEvent = (function () {
        function ObservableEvent(key) {
            this.key = key;
            this.functions = new Array();
        }
        ObservableEvent.prototype.detach = function (f) {
            var index = this.functions.indexOf(f);
            if (index >= 0)
                this.functions.splice(index, 1);
        };
        ObservableEvent.prototype.fireEvent = function (args) {
            for (var i = 0; i < this.functions.length; i++) {
                this.functions[i](args);
            }
        };
        return ObservableEvent;
    }());
    TKWApp.ObservableEvent = ObservableEvent;
    var Observable = (function () {
        function Observable() {
            this.eventHandlers = new Array();
        }
        Observable.prototype.attachEvent = function (key, fnc) {
            if (!this[key]) {
                var event = new ObservableEvent(key);
                event.functions.push(fnc);
                this.eventHandlers.push(event);
                this[key] = event;
            }
            else {
                var event = this[key];
                event.functions.push(fnc);
                this.eventHandlers.push(event);
            }
        };
        Observable.prototype.detachEvent = function (key, fnc) {
            var i = 0;
            while (i < this.eventHandlers.length) {
                if (this.eventHandlers[i].key == key) {
                    if (!fnc) {
                        // remove all events of that key
                        this[key] = null;
                        this.eventHandlers.splice(i, 1);
                    }
                    else {
                        // only remove that function from the event
                        this.eventHandlers[i].detach(fnc);
                    }
                }
                i++;
            }
        };
        Observable.prototype.detachEvents = function () {
            this.eventHandlers.length = 0;
        };
        Observable.prototype.dispose = function () {
            this.eventHandlers = null;
        };
        Observable.prototype.fireEvent = function (key, args) {
            if (this[key]) {
                this[key].fireEvent(args);
            }
        };
        return Observable;
    }());
    TKWApp.Observable = Observable;
})(TKWApp || (TKWApp = {}));
