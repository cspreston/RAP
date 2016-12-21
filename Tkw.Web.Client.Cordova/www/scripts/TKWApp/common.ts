module TKWApp {
    interface IDisposable {
        dispose();
    }

    export class ObservableEvent {
        functions: Array<Function> = new Array<Function>();
        constructor(public key: string) {
        }
        detach(f: Function) {
            var index = this.functions.indexOf(f);
            if (index >= 0) this.functions.splice(index, 1);
        }
        fireEvent(args?: any) {
            for (var i = 0; i < this.functions.length; i++) {
                this.functions[i](args);
            }
        }
    }


    export class Observable implements IDisposable {
        eventHandlers: Array<ObservableEvent> = new Array<ObservableEvent>();
        protected attachEvent(key: string, fnc: Function) {
            if (!this[key]) {
                var event = new ObservableEvent(key);
                event.functions.push(fnc);
                this.eventHandlers.push(event);
                this[key] = event;
            }
            else {
                var event = <ObservableEvent>this[key];
                event.functions.push(fnc);
                this.eventHandlers.push(event);
            }
        }
        protected detachEvent(key: string, fnc?: Function) {
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
        }
        protected detachEvents() {
            this.eventHandlers.length = 0;
        }
        dispose() {
            this.eventHandlers = null;
        }
        protected fireEvent(key: string, args?: any) {
            if (this[key]) {
                this[key].fireEvent(args);
            }
        }
    }
}