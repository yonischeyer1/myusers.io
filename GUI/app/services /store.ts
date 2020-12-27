let instance:any;
export default class ServiceStore {
    _store:any = {}
    constructor() {
        if(instance) {
            return instance;
        }
        instance = this
        return this;
    }
    get(key:string) {
        return this._store[key]
    }
    upsert(key:string, value:any) {
        this._store[key] = value
    }
    remove(key:string) {
        delete this._store[key]
    }

}