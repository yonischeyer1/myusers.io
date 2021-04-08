import ServiceStore from '../services /store.service'
import { APP_CWD } from './general';
import fs from 'fs';
import archiver from 'archiver';



const serviceStore = new ServiceStore();

export async function exportTestSuite (testSuite:any) {
    const newTestSuitePopulatedWithActions = await populateTestSuiteWithActions(testSuite);
    const sessionsFoldersToCompress = testSuite.suite.map(test => `${APP_CWD}sessions/${test.userId}`.trim())
    await compress(testSuite.name, sessionsFoldersToCompress, newTestSuitePopulatedWithActions);

}


export function populateTestSuiteWithActions (testSuite:any) {
    const actions = serviceStore.readDocs('actions');
    const newTestSuitePopulatedWithActions = testSuite.suite.map((test:any)=>{
        test.action = actions[test.actionId]
        return test;
    })
    return newTestSuitePopulatedWithActions;
}

export async function importTestSuite (pathToGzipTestSuite:string) {

}


export async function compress (testSuiteName:any, sessionsFoldersToCompress:any, newTestSuitePopulatedWithActions:any) {
    const archive = archiver('zip', {
        gzip: true,
        zlib: { level: 9 } // Sets the compression level.
    });
    
    const output = fs.createWriteStream(`./${testSuiteName}.gzip`);
    
    archive.on('error', function(err) {
        console.log("compress err", err);
        throw err;
    });

    archive.pipe(output);
    archive.append(newTestSuitePopulatedWithActions, { name: `${testSuiteName}.json` });
    for(const sessionFolderPath of sessionsFoldersToCompress) {
        archive.directory(sessionFolderPath)
    }
    archive.finalize();
}


export async function decompress () {

}
