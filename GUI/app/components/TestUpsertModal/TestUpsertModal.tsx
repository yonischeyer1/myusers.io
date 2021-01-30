import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { Test, TestModel, TEST_STATUS } from '../../models/Test.model';
import styles from './TestUpsertModal.css'

import ServiceStore from '../../services /store.service'

const serviceStore = new ServiceStore();

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let onceflag = false;
export default function FullScreenDialog(props:any) {
  let users:any = []
  let actions:any = []
  const { open, currentTestPicked } = props;
  const [state, _setState] = React.useState({
    testName:"",
    pickedUserId:"",
    pickedUserActions:null,
    pickedUserAction:"",
    suite:[],
    suiteName:""
  });

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },0)
    })
  }

  const handleClose = async (e:any) => {
    onceflag = false;
    const {handleUpsertTestModalClose} = props;
    handleUpsertTestModalClose(false);
    await setState({...state, suite:[], suiteName:''})
  };

  const getUserActions = async (e:any) => {
    const menuItemSelected = e.target.value;
    const user:any = users[menuItemSelected];
    let userActions = []
    for(const userActionId of user.actionsIds) {
      userActions.push(actions[userActionId])
    }
    return {userActions, user};
  }

  const handleUserPick = async (e:any) => {
    const {userActions, user} = getUserActions(e);
    await setState({...state, pickedUserId:user.id, pickedUserActions:userActions});
  }

  const handleActionPick = async (e:any) => {
    const pickedAction = e.target.value
    await setState({...state, pickedUserAction:pickedAction})
  }

  const save = async (e:any) => {
    const test:Test = {
      suiteName:state.suiteName,
      suite:state.suite,
      lastFailResult:null
    }
    serviceStore.createDoc('tests', test);
    handleClose(null)
  }

  const addTestToSuite = async (e:any) => {
    const test:TestModel = {
      testName:state.testName,
      userId:state.pickedUserId,
      actionId:state.pickedUserAction,
      schedule:{},
      status:TEST_STATUS.IDLE
    }
    await setState({...state, suite:[...state.suite, test], testName:"", pickedUserId:"", pickedUserAction:"", pickedUserActions:null});
  }
  const deleteTestFromSuite = async (test:any) => {
    const newSuite = state.suite.filter(item => item.testName !== test.testName)
    await setState({...state, suite:newSuite})
  }

  (async ()=>{
    if(open) {
      users = serviceStore.readDocs('users');
      actions = serviceStore.readDocs('actions');
      if(currentTestPicked && !onceflag) {
        onceflag = true;
        await setState({...state, suite:currentTestPicked.suite, suiteName:currentTestPicked.suiteName})
      }
    }
  })()
  
  return open ? (
    <div style={{overflow:"hidden"}}>
      <Dialog style={{overflow:"hidden"}} fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              {state.suiteName ? `Edit suite: ${state.suiteName}` : "Create new test suite"}
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
          <div className={styles["modal-content-container"]}>
          <br/>
             <div className={styles["test-name-container-suite"]}>
            <TextField disabled={false}
             value={state.suiteName} 
             onChange={( e => setState({...state, suiteName:e.target.value})) } 
             label="Test suite name:" variant="outlined" style={{width:"100%", height:"45px"}} size="small"/>
             </div>
             <br/>   <br/>
             <div className={styles["test-name-container"]}>
            <TextField disabled={false} 
             value={state.testName}
             onChange={( e => setState({...state, testName:e.target.value})) } 
             label="Test name:" variant="outlined" style={{width:"70%", height:"45px"}} size="small"/>
        </div>
        <div className={styles["user-action-select-container"]}>
             <div className={styles["pick-user-combobox-container"]}>     
             <FormControl className={styles["form-control"]}>
              <InputLabel id="demo-simple-select-label">Select User:</InputLabel>
              <Select
               labelId="demo-simple-select-label"
               id="demo-simple-select"
               value={state.pickedUserId}
               onChange={handleUserPick}>
               {
                 !users ? null : Object.values(users).map((user:any)=>{
                   return <MenuItem value={user.id}>{user.name}</MenuItem>
                 })
               }
              </Select>
            </FormControl>
           </div>
           <div className={styles["pick-action-combobox-container"]}>
           <FormControl className={styles["form-control"]}>
            <InputLabel id="demo-simple-select-label">Select Action:</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={state.pickedUserAction}
              onChange={handleActionPick}>
              {
                !state.pickedUserActions ? null : state.pickedUserActions.map((userAction:any)=>{
                  return <MenuItem value={userAction.id}>{userAction.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
          </div> 
          <div className={styles["add-button-container"]} >
             <Button size="small" variant="outlined" color="primary" onClick={addTestToSuite}>ADD TEST +</Button>
          </div>
        </div> 
             <br/> <br/>
        <div className={styles["suite-container"]}>
           {
           state.suite.length === 0 ? null : state.suite.map((test:any) => {
               return (
                 <div>
                  <br/>  <br/>
                 <div className={styles["test-name-container"]}>
                 <TextField disabled={true} 
                  value={test.testName}
                  onChange={( e => setState({...state, testName:e.target.value})) } 
                  label="Test name:" variant="outlined" style={{width:"70%", height:"45px"}} size="small"/>
                </div> <br/>
                <div className={styles["user-action-select-container"]}>
                <div className={styles["pick-user-combobox-container"]}>     
                <FormControl className={styles["form-control"]}>
                 <InputLabel id="demo-simple-select-label">Select User:</InputLabel>
                 <Select 
                  disabled={true}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={test.userId}
                  onChange={handleUserPick}>
                  {
                    !users ? null : Object.values(users).map((user:any)=>{
                      return <MenuItem  value={user.id}>{user.name}</MenuItem>
                    })
                  }
                 </Select>
               </FormControl>
              </div>
              <div className={styles["pick-action-combobox-container"]}>
              <FormControl className={styles["form-control"]}>
               <InputLabel id="demo-simple-select-label">Select Action:</InputLabel>
               <Select
                 disabled={true}
                 labelId="demo-simple-select-label"
                 id="demo-simple-select"
                 value={test.actionId}
                 onChange={handleActionPick}>
                    <MenuItem value={test.actionId}>{actions[test.actionId].name}</MenuItem>
               </Select>
             </FormControl>
             </div>
             <div className={styles["add-button-container"]} >
             <Button size="small" variant="outlined" color="secondary" onClick={(e:any)=> { deleteTestFromSuite(test) }}>Delete</Button>
             </div>
             </div>
           </div>  
               )
             })     
         }
        </div>
        <br/><br/>    
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={handleClose}>Cancel</Button>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         <Button style={{position:"absolute", right:0}} size="small" variant="outlined" color="primary" onClick={save}>Done</Button>
         </div>
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}