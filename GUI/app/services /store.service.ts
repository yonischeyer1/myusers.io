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
        return typeof this._store[key] === 'object' ? JSON.parse(JSON.stringify(this._store[key])) : this._store[key]
    }
    upsert(key:string, value:any) {
        this._store[key] =  typeof value === 'object' ?  JSON.parse(JSON.stringify(value)) : value
    }
    remove(key:string) {
        delete this._store[key]
    }
}