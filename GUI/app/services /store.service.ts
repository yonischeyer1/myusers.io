import crypto from 'crypto';
import fs from 'fs'
import { APP_CWD } from '../utils/general'
import EventEmitter from 'events'


class MyEmitter extends EventEmitter {}
let instance:any;
const DB_FOLDER_PATH = `${APP_CWD}DB`

const MY_COLLECTIONS = ['accounts','actions','tests','users','settings']

export default class ServiceStore {
    _store:any = {
        DB: {
           accounts:null,
           actions:null,
           tests:null,
           users:null,
           settings:null 
        },
        appState: null
    }
    _myEmitter:any
    constructor() {
        if(instance) {
            return instance;
        }
        this._myEmitter = new MyEmitter();
        instance = this
        return this;
    }
    async init() {
         const loadPromises = MY_COLLECTIONS.map(collectionName => this.load(collectionName))
         const [accounts, actions, users, tests, settings]: any = await Promise.all(loadPromises).catch(e => console.error(e));
         this._store.DB = {accounts, actions, users, tests, settings}
         return;
    }
    getEventEmitter() {
        return this._myEmitter;
    }
    getAppStateValue(key:string) {
        return this._store.appState[key];
    }
    upsertAppStateValue(key:string, value:any) {
        const copyOfValue = typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value
        this._store.appState[key] = copyOfValue;
        this._myEmitter(`state-${key}`)
    }
    createDoc(collectionName:any, newDoc:any) {
        const copyOfDoc = JSON.parse(JSON.stringify(newDoc))
        copyOfDoc["id"] = crypto.randomBytes(20).toString('hex');// create random id
        this._store.DB[collectionName][copyOfDoc["id"]] = copyOfDoc;
        this._myEmitter(`DB-create-${collectionName}`)
        this.save(collectionName, this._store.DB[collectionName])
        return copyOfDoc["id"];
    }
    readDocs(collectionName:any) {
        return JSON.parse(JSON.stringify(this._store.DB[collectionName]));
    }
    updateDocs(collectionName:any, updatedCollection:any) {
        this._store.DB[collectionName] = updatedCollection;
        this._myEmitter(`DB-update-${collectionName}`)
        this.save(collectionName, this._store.DB[collectionName])
    }
    deleteDoc(collectionName:any, value:any) {
        delete this._store.DB[collectionName][value.id]
        this._myEmitter(`DB-delete-${collectionName}`)
        this.save(collectionName, this._store.DB[collectionName])
    }
    save(collectionName:any, docs:any) {
        fs.writeFileSync(`${DB_FOLDER_PATH}/${collectionName}.json`, JSON.stringify(docs))
    }
    load(collectionName:any) {
        return new Promise((resolve, reject)=>{
            const modelJsonPath = `${DB_FOLDER_PATH}/${collectionName}.json`
            fs.exists(modelJsonPath,(exsists) => {
                if(!exsists) {
                    fs.writeFileSync(modelJsonPath, JSON.stringify([]))
                    return resolve([])
                }
                const Model = JSON.parse(fs.readFileSync(modelJsonPath))
                return resolve(Model)
                
            })
        })
    }
}