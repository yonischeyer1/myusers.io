const { distance } = require('fastest-levenshtein')
const { takeScreenshotOfDesktop, removeScreenShot } = require('./frameStream');
const { frameToHash, imageToHash, imageToHashAndURI, 
    drawOnImageAndReturnHashNODEJS, imageURIToHash } = require('./eyes.core');
const { IHands } = require('./ihands')

const MAX_ATTEMPTS = 5 
const ATTEMPT_DELAY = 1500


let instance = null
class EyesController {
    _currentAction = null
    _currentTagIdx = 0
    _getTagDistanceAttemptIdx = 0
    _faildTestDataResp = null
    

    constructor(){
        if(instance) {
            return instance
        }
        instance = this;
        return this;
    }

    async setCurrentAction (action) {
        this._currentAction = action;
    }

    async playAction() {
        const action = this._currentAction;
        const ihands = new IHands();
        const testSuccess = await (await ihands.startPlayerKeyboardMouse(action.ioActions, action.id)).json();
        return testSuccess;
    }

    async playRecorderAction() {
        const action = this._currentAction;
        const ihands = new IHands();
        await ihands.startPlayerKeyboardMouse(action.ioActions, action.id);
        await this.removeAllScreenShots();
        return;
    }

    async isDistValid(res) {
        const currentTag = await this.getCurrentTag();
        const {frameHash, hashOfTag, frameURI} = await this.captureScreenAndConvertToHash(currentTag);
        const dynamicData = await this.isDynamic(currentTag);
        const isMatching = await this.foundMatchingScreenshot(dynamicData, {frameHash, hashOfTag})
        if(!isMatching) {
            const isFailedTest =  await this.failTest(res, frameURI); 
            if(!isFailedTest) {
                return this.retryMatching(res);
            }
        }
    }

    async fillTagHashAndURI (res) {
        const _currentTagIdx = this._currentAction;
        const currentTag = this.getCurrentTag()
        await takeScreenshotOfDesktop(_currentAction);
        const filePath = `${process.cwd()}/screenshot${_currentAction}.jpg`
        const {frameHash, frameURI} =  await imageToHashAndURI(filePath);
        currentTag.hash = frameHash;
        currentTag.originalReferenceSnapshotURI = frameURI;
        currentTag.distances = [0]
        this._currentAction++;
        res.status(200).send(true) 
    }

    async getCurrentTag () {
        const tags = this._currentAction.tags
        return tags[this._currentAction]
    }

    async captureScreenAndConvertToHash (currentTag) {
        const hashOfTag = currentTag.hash;
        await takeScreenshotOfDesktop(this._currentAction);
        const filePath = `${process.cwd()}/screenshot${this._currentTagIdx}.jpg`
        const {frameHash, frameURI} =  await imageToHashAndURI(filePath);
        return {hashOfTag, frameHash, frameURI}
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

    async foundMatchingScreenshot (res, dynamicData, tagData) {
        const {frameHash, hashOfTag} = tagData;
        const {dynamicSnapHash, newCurrentTagHash} = dynamicData
        const dist = dynamicSnapHash ? distance(newCurrentTagHash,dynamicSnapHash) : distance(hashOfTag, frameHash)
        const matchingDistances = currentTag.distances.filter(x => dist <= x) 
        if(matchingDistances.length > 0) {
            this._currentTagIdx++;
            this._getTagDistanceAttemptIdx = 0;
            res.status(200).send(true) 
            return true;
        }
        return;
    }

    async failTest(res, dist, frameURI) {
        if(this._getTagDistanceAttemptIdx > MAX_ATTEMPTS) {
            this._getTagDistanceAttemptIdx = 0;
            this._faildTestDataResp = {success:false, dist, uri:frameURI, 
                currentTagIdx:this._currentTagIdx}
            res.status(200).send(false) 
            return true;
        }
        return;
    }

    async retryMatching() {
        await removeScreenShot(currentTagIdx);
        this.getTagDistanceAttemptIdx++;
        await delay();
        await this.isDistValid(res, actionId)
    }

    async delay () {
        await (()=>{
            return new Promise((resolve,reject)=>{
                setTimeout(()=>{resolve()}, ATTEMPT_DELAY)
            })
        })()
        return;
    }

    async removeAllScreenShots () {
        for (let index = 0; index < this.currentTagIdx; index++) {
            await removeScreenShot(index)
        }
        this.currentTagIdx = 0
    }    
}


module.exports = {EyesController};