const express = require('express');
const router = express.Router();
const { distance, closest} = require('fastest-levenshtein')
const {IHands} = require('./ihands')
const { takeScreenshotOfDesktop, removeScreenShot } = require('./frameStream');
const { frameToHash, imageToHash, imageToHashAndURI, drawOnImageAndReturnHashNODEJS, imageURIToHash } = require('./eyes.core');
const fs = require('fs')

const MAX_ATTEMPTS = 5 // TOTAL_TIME =  ATTEMPT_DELAY * MAX_ATTEMPTS
const ATTEMPT_DELAY = 1500
const actionsPlaying = {}
let recorderActionsPlaying = null

let currentTagIdx = 0

let getTagDistanceAttemptIdx = 0

let tagHashFillFlag = false;

let faildTestDataResp = null

router.post('/compute/distance', (req, res) => {
    const { hash1 , hash2} = req.body;
    res.send({dist:distance(hash1,hash2)})
});

router.get('/isCorrectImage', async (req, res) => {
    req.setTimeout(0)
        const { actionId } = req.query
        if(tagHashFillFlag) {
            await fillTagHashAndURI(res)
        }
        else if(recorderActionsPlaying) {
            await getTagDistance(res, actionId)
        } else if(Object.keys(actionsPlaying).length > 0) {
            await isDistValid(res, actionId);
        }
});

router.post('/playAction', async (req, res) => {
        req.setTimeout(0)
        const action = req.body;
        if(!actionsPlaying[action.id]) {
            actionsPlaying[action.id] = action;
        }
        const ihands = new IHands();
        const testSuccess = await (await ihands.startPlayerKeyboardMouse(action.ioActions, action.id)).json();
        console.log("testSuccess",testSuccess)
        delete actionsPlaying[action.id]
        if(testSuccess) {
           res.status(200).send({success:true}) 
        } else {
            res.status(200).send(faildTestDataResp) 
        }
});

router.post('/playRecorderAction', async (req, res) => {
    req.setTimeout(0)
    const action = req.body;
    if(action.tagHashFillFlag) {
        tagHashFillFlag = true;
    }
    recorderActionsPlaying = action;
    const ihands = new IHands();
    await ihands.startPlayerKeyboardMouse(action.ioActions, action.id);
    tagHashFillFlag = false;
    for (let index = 0; index < currentTagIdx; index++) {
        await removeScreenShot(index)
    }
    currentTagIdx = 0
    res.status(200).send(recorderActionsPlaying) 
});

router.post('/testDraw', async (req, res) => {
    req.setTimeout(0)
    const {coords, image} = req.body;
    const drawnImage = await drawOnImageAndReturnHashNODEJS(image, coords)
    res.status(200).send(drawnImage);
});



module.exports = router


async function isDistValid(res, actionId) {
    console.log(" isDistValid currentTagIdx",currentTagIdx)
    const relaventAction = actionsPlaying[actionId]
    const tags = relaventAction.tags
    const currentTag = tags[currentTagIdx]
    const hashOfTag = currentTag.hash;
    await takeScreenshotOfDesktop(currentTagIdx);
    const filePath = `${process.cwd()}/screenshot${currentTagIdx}.jpg`
    console.log("currentTagIdx",currentTagIdx)
    console.log("filePath",filePath)
    const {frameHash, frameURI} =  await imageToHashAndURI(filePath);
    let dynamicSnapHash = null
    let newCurrentTagHash = null
    if(currentTag.dynamic) {
        console.log("tag dynamic frameURI", frameURI)
        const drawnURI = await drawOnImageAndReturnHashNODEJS(frameURI,currentTag.dynamic.coords)
        console.log("drawnURI",drawnURI)
        dynamicSnapHash = await imageURIToHash(drawnURI);
        const newCurrentTagURI = await drawOnImageAndReturnHashNODEJS(currentTag.originalReferenceSnapshotURI,currentTag.dynamic.coords)
        console.log("newCurrentTagURI",newCurrentTagURI)
        newCurrentTagHash = await imageURIToHash(newCurrentTagURI);
    }
    console.log("newCurrentTagHash", !!newCurrentTagHash)
    console.log("dynamicSnapHash", !!dynamicSnapHash)
    const dist = dynamicSnapHash ? distance(newCurrentTagHash,dynamicSnapHash) : distance(hashOfTag, frameHash)
    console.log("currentTag.distances[0]",currentTag.distances[0])
    console.log("dist",dist)
    if(dist <= currentTag.distances[0]) {
        console.log("dist <= currentTag.distances[0]",currentTagIdx)
        currentTagIdx++;
        getTagDistanceAttemptIdx = 0;
        res.status(200).send(true) 
    } else if(getTagDistanceAttemptIdx > MAX_ATTEMPTS) {
        console.log("getTagDistanceAttemptIdx > MAX_ATTEMPTS",currentTagIdx, "getTagDistanceAttemptIdx",getTagDistanceAttemptIdx)
        getTagDistanceAttemptIdx = 0;
        faildTestDataResp = {success:false, dist, uri:frameURI}
        res.status(200).send(false) 
    } else {
        await removeScreenShot(currentTagIdx);
        getTagDistanceAttemptIdx++;
        await (()=>{
            return new Promise((resolve,reject)=>{
                setTimeout(()=>{resolve()}, ATTEMPT_DELAY)
            })
        })()
        await isDistValid (res, actionId)
    }
}

async function getTagDistance (res, actionId) {
    console.log("currentTagIdx",currentTagIdx)
    const tags = recorderActionsPlaying.tags
    const currentTag = tags[currentTagIdx]
    const hashOfTag = currentTag.hash;
    await takeScreenshotOfDesktop(currentTagIdx);
    const filePath = `${process.cwd()}/screenshot${currentTagIdx}.jpg`
    const {frameHash, frameURI} =  await imageToHashAndURI(filePath);
    const dist = distance(hashOfTag, frameHash)
    if(dist === 0 || getTagDistanceAttemptIdx > MAX_ATTEMPTS) {
        currentTag.distances = [dist];
        currentTag.screenShotFromPlayURI = frameURI
        currentTagIdx++;
        getTagDistanceAttemptIdx = 0;
        res.status(200).send(true) 
    } else {
        await removeScreenShot(currentTagIdx);
        getTagDistanceAttemptIdx++;
        await (()=>{
            return new Promise((resolve,reject)=>{
                setTimeout(()=>{resolve()}, ATTEMPT_DELAY)
            })
        })()
        console.log("screenshot agian23")
        await getTagDistance (res, actionId)
    }
}

async function fillTagHashAndURI (res) {
    const tags = recorderActionsPlaying.tags
    const currentTag = tags[currentTagIdx]
    await takeScreenshotOfDesktop(currentTagIdx);
    const filePath = `${process.cwd()}/screenshot${currentTagIdx}.jpg`
    const {frameHash, frameURI} =  await imageToHashAndURI(filePath);
    currentTag.hash = frameHash;
    currentTag.originalReferenceSnapshotURI = frameURI;
    currentTagIdx++;
    res.status(200).send(true) 
}


//As a compremise i can : try to retake screenshots from .mp4 with slightly diffrent times
//And enable the user to add manually picked screenshots.
//And enable delete of messy screenshots from auto tag process ex: picture in the middle of loading.
//So first run  presume its all fine just getting distances by screenshot 