const { distance } = require('fastest-levenshtein')
const { takeScreenshotOfDesktop, removeScreenShot } = require('./frameStream');
const { frameToHash, imageToHash, imageToHashAndURI, drawOnImageAndReturnHashNODEJS, imageURIToHash } = require('./eyes.core');

const MAX_ATTEMPTS = 5 
const ATTEMPT_DELAY = 1500


let instance = null
class EyesController {
    actionsPlaying = {}
    recorderActionsPlaying = null
    currentTagIdx = 0
    getTagDistanceAttemptIdx = 0
    tagHashFillFlag = false;
    faildTestDataResp = null

    constructor(){
        if(instance) {
            return instance
        }
        instance = this;
        return this;
    }

    async isDistValid(res, actionId) {
        const currentTag = await this.getCurrentTag(actionId);
        await this.captureScreenAndConvertToHash(currentTag);
        const dynamicData = await this.isDynamic(currentTag);
        const isMatching = await this.foundMatchingScreenshot(dynamicData)
        if(!isMatching) {
            const isFailedTest =  await this.failTest(); 
            if(!isFailedTest) {
                return this.retryMatching();
            }
        }
    }

    async fillTagHashAndURI (res) {
        const tags = recorderActionsPlaying.tags
        const currentTag = tags[currentTagIdx]
        await takeScreenshotOfDesktop(currentTagIdx);
        const filePath = `${process.cwd()}/screenshot${currentTagIdx}.jpg`
        const {frameHash, frameURI} =  await imageToHashAndURI(filePath);
        currentTag.hash = frameHash;
        currentTag.originalReferenceSnapshotURI = frameURI;
        currentTag.distances = [0]
        currentTagIdx++;
        res.status(200).send(true) 
    }

    async getCurrentTag (actionId) {
        const relaventAction = actionsPlaying[actionId]
        const tags = relaventAction.tags
        const currentTag = tags[currentTagIdx]
        return currentTag;
    }

    async captureScreenAndConvertToHash (currentTag) {
        const hashOfTag = currentTag.hash;
        await takeScreenshotOfDesktop(currentTagIdx);
        const filePath = `${process.cwd()}/screenshot${currentTagIdx}.jpg`
        const {frameHash, frameURI} =  await imageToHashAndURI(filePath);
        return {frameHash, frameURI}
    }

    async isDynamic(currentTag) {
        if(currentTag.dynamic) {
            const drawnURI = await drawOnImageAndReturnHashNODEJS(frameURI,currentTag.dynamic.coords)
            const dynamicSnapHash = await imageURIToHash(drawnURI);
            const newCurrentTagURI = await drawOnImageAndReturnHashNODEJS(currentTag.originalReferenceSnapshotURI,currentTag.dynamic.coords)
            const newCurrentTagHash = await imageURIToHash(newCurrentTagURI);
            return {dynamicSnapHash, newCurrentTagHash}
        }
        return {dynamicSnapHash:null, newCurrentTagHash:null};
    }

    async foundMatchingScreenshot (res, dynamicData) {
        const  {dynamicSnapHash, newCurrentTagHash} = dynamicData
        const dist = dynamicSnapHash ? distance(newCurrentTagHash,dynamicSnapHash) : distance(hashOfTag, frameHash)
        const matchingDistances = currentTag.distances.filter(x => dist <= x) 
        if(matchingDistances.length > 0) {
            currentTagIdx++;
            getTagDistanceAttemptIdx = 0;
            res.status(200).send(true) 
            return true;
        }
        return;
    }

    async failTest() {
        if(getTagDistanceAttemptIdx > MAX_ATTEMPTS) {
            getTagDistanceAttemptIdx = 0;
            faildTestDataResp = {success:false, dist, uri:frameURI , currentTagIdx}
            res.status(200).send(false) 
            return true;
        }
        return;
    }

    async retryMatching() {
        await removeScreenShot(currentTagIdx);
        getTagDistanceAttemptIdx++;
        await delay();
        await isDistValid (res, actionId)
    }

    async delay () {
        await (()=>{
            return new Promise((resolve,reject)=>{
                setTimeout(()=>{resolve()}, ATTEMPT_DELAY)
            })
        })()
        return;
    }
    
}


module.exports = {EyesController};