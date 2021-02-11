import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import styles from './TestUpsertModal.css'

import { Transition } from '../../utils/general';
import TestUpsertModalEvents from './TestUpsertModal.event';
 


export default function FullScreenDialog(props:any) {
  const _events = new TestUpsertModalEvents();
  let users:any = []
  let actions:any = []
  const { open } = props;
  const [state, setState] = React.useState({
    testName:"",
    pickedUserId:"",
    pickedUserActions:null,
    pickedUserAction:"",
    suite:[],
    suiteName:""
  });

  _events.setConstructor(state, setState, props)

  
  return open ? (
    <div style={{overflow:"hidden"}}>
      <Dialog style={{overflow:"hidden"}} fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              {state.suiteName ? `Edit suite: ${state.suiteName}` : "Create new test suite"}
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
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
               onChange={_events.handleUserPick.bind(_events)}>
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
              onChange={_events.handleActionPick.bind(_events)}>
              {
                !state.pickedUserActions ? null : state.pickedUserActions.map((userAction:any)=>{
                  return <MenuItem value={userAction.id}>{userAction.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
          </div> 
          <div className={styles["add-button-container"]} >
             <Button size="small" variant="outlined" color="primary" onClick={_events.addTestToSuite.bind(_events)}>ADD TEST +</Button>
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
                  onChange={_events.handleUserPick.bind(_events)}>
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
                 onChange={_events.handleActionPick.bind(_events)}>
                    <MenuItem value={test.actionId}>{actions[test.actionId].name}</MenuItem>
               </Select>
             </FormControl>
             </div>
             <div className={styles["add-button-container"]} >
             <Button size="small" variant="outlined" color="secondary" onClick={(e:any)=> { _events.deleteTestFromSuite.bind(_events)(test) }}>Delete</Button>
             </div>
             </div>
           </div>  
               )
             })     
         }
        </div>
        <br/><br/>    
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={_events.handleClose.bind(_events)}>Cancel</Button>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         <Button style={{position:"absolute", right:0}} size="small" variant="outlined" color="primary" onClick={_events.save.bind(_events)}>Done</Button>
         </div>
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}