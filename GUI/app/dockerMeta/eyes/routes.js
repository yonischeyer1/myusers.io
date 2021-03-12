const express = require('express');
const router = express.Router();

const { EyesController } = require('./eyes.controller');
const fs = require('fs')


const _eyesController = new EyesController();

let playRecorderAction = false;

router.get('/isCorrectImage', async (req, res) => {
    req.setTimeout(0)
    const { actionId } = req.query
    if(playRecorderAction) {
        await _eyesController.fillTagHashAndURI(res)
    } else {
        await _eyesController.isDistValid(res, actionId);
    }
});

router.post('/playAction', async (req, res) => {
        req.setTimeout(0)
        const action = req.body;
        _eyesController.setCurrentAction(action)
        const testSuccess = await _eyesController.playAction(action)
        if(testSuccess) {
           res.status(200).send({success:true}) 
        } else {
            res.status(200).send(testSuccess) 
        }
});

router.post('/playRecorderAction', async (req, res) => {
    req.setTimeout(0)
    const action = req.body;
    playRecorderAction = true;
    await _eyesController.playRecorderAction(action)
    res.status(200).send(recorderActionsPlaying) 
});



module.exports = router




