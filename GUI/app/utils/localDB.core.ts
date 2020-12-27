const { random } = require("lodash")
import crypto from 'crypto';
import fs from 'fs'
import { APP_CWD } from './general';

const DB_FOLDER_PATH = `${APP_CWD}DB`

export const MODELS = {'Action':'Action', 'User':'User', 'Test':'Test', 'Account':'Account'}
console.log(DB_FOLDER_PATH)
let instance:any = null
export default class LocalDB {
    MODELS = MODELS;
    constructor(){
        if(instance) {
            return instance;
        }
        instance = this;
        return this
    }
    getModelArrayByName(modelName:any) {
        return new Promise((resolve, reject)=>{
            const modelJsonPath = `${DB_FOLDER_PATH}/${modelName}.json`
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
    saveModel(modelName:any, modelArray:any) {
        const docs = modelArray.map((model:any)=>{
            if(!model.id) {
                model["id"] = this.createRandomId()    
            }
            return model
        })
        fs.writeFileSync(`${DB_FOLDER_PATH}/${modelName}.json`, JSON.stringify(docs))
    }
    createRandomId() {
        return crypto.randomBytes(20).toString('hex');
    }
}

// module.exports = LocalDB