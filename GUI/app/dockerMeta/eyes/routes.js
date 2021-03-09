const express = require('express');
const router = express.Router();
const { IHands } = require('./ihands')
const { EyesController } = require('./eyes.controller');
const fs = require('fs')


const _eyesController = new EyesController();


router.get('/isCorrectImage', async (req, res) => {
    req.setTimeout(0)
    const { actionId } = req.query
    if(tagHashFillFlag) {
        await _eyesController.fillTagHashAndURI(res)
    } else if(Object.keys(actionsPlaying).length > 0) {
        await _eyesController.isDistValid(res, actionId);
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
    const ihands = new IHands();
    await ihands.startPlayerKeyboardMouse(action.ioActions, action.id);
    await _eyesController.removeAllScreenShots();
    res.status(200).send(recorderActionsPlaying) 
});



module.exports = router




