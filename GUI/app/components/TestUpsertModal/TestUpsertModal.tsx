import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width:200
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    userActionSelectContainer: {
      display: "flex",
      justifyContent:"right",
      marginLeft:"100px",
      position:'relative',
      width: "93%"
    },
    doneCancelBtnsContianer: {
      display:"flex",
      justifyContent:"right",
      marginLeft:"100px"
    }
  }),
);


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function FullScreenDialog(props:any) {
  const classes = useStyles();
  const [suiteName, setSuiteName] = React.useState("");
  const [testName, setTestName] = React.useState("");

  //Main test hooks
  const [pickedUserId, setPickedUser] = React.useState("");
  const [pickedUserActions, setPickedUserActions] = React.useState(null);
  const [pickedUserAction, setPickedUserAction] = React.useState("");

  //Test suite
  const [suite, setSuite] = React.useState([]);
  const [pickedUserActionsSuite, setPickedUserActionsSuite] = React.useState({});
  const [pickedUserActionSuite, setPickedUserActionSuite] = React.useState({});


  const { open, currentTestPicked } = props;
  let users:any = []
  let actions:any = []

  if(open) {
    users = serviceStore.readDocs('users');
    actions = serviceStore.readDocs('actions');
    if(currentTestPicked) {
      setSuite(currentTestPicked.suite)
    }
  }

  const handleClose = (e:any) => {
    const {handleUpsertTestModalClose} = props;
    handleUpsertTestModalClose(false);
  };

  const getUserActions = (e:any) => {
    const menuItemSelected = e.target.value;
    const user:any = users[menuItemSelected];
    let userActions = []
    for(const userActionId of user.actionsIds) {
      userActions.push(actions[userActionId])
    }
    return {userActions, user};
  }

  const handleUserPick = (e:any) => {
    const {userActions, user} = getUserActions(e);
    setPickedUser(user.id)
    setPickedUserActions(userActions)
  }

  const handleUserPickSuite = (e:any) => {
    const {userActions, user} = getUserActions(e);
    setPickedUser(user.id)
    setPickedUserActions(userActions)
  }

  const handleActionPick = async (e:any) => {
    const pickedAction = e.target.value
    setPickedUserAction(pickedAction)
  }

  const save = async (e:any) => {
    const test:Test = {
      name:testName,
      userId:pickedUserId,
      actionId:pickedUserAction,
      schedule:{},
      status:TEST_STATUS.IDLE
    }
    serviceStore.createDoc('tests', test);
    handleClose(null)
  }

  const addTestToSuite = (e:any) => {
    const test:TestModel = {
      testName,
      userId:pickedUserId,
      actionId:pickedUserAction,
      schedule:{},
      status:TEST_STATUS.IDLE
    }
    setSuite([...suite, test])
    setTestName("")
    setPickedUser(null)
    setPickedUserAction(null)
    setPickedUserActions(null)
  }
  console.log("suite", suite)
  return open ? (
    <div style={{overflow:"hidden"}}>
      <Dialog style={{overflow:"hidden"}} fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Test Upsert 
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
             onChange={( e => setSuiteName(e.target.value)) } 
             label="Test suite name:" variant="outlined" style={{width:"100%", height:"45px"}} size="small"/>
             </div>
             <br/>   <br/>
             <div className={styles["test-name-container"]}>
            <TextField disabled={false} 
             value={testName}
             onChange={( e => setTestName(e.target.value)) } 
             label="Test name:" variant="outlined" style={{width:"70%", height:"45px"}} size="small"/>
        </div>
        <div className={classes.userActionSelectContainer}>
             <div className={styles["pick-user-combobox-container"]}>     
             <FormControl className={classes.formControl}>
              <InputLabel id="demo-simple-select-label">Select User:</InputLabel>
              <Select
               labelId="demo-simple-select-label"
               id="demo-simple-select"
               value={pickedUserId}
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
           <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">Select Action:</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={pickedUserAction}
              onChange={handleActionPick}>
              {
                !pickedUserActions ? null : pickedUserActions.map((userAction:any)=>{
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
           suite.length === 0 ? null : suite.map((test:any) => {
               return (
                 <div>
                  <br/>  <br/>
                 <div className={styles["test-name-container"]}>
                 <TextField disabled={true} 
                  value={test.testName}
                  onChange={( e => setTestName(e.target.value)) } 
                  label="Test name:" variant="outlined" style={{width:"70%", height:"45px"}} size="small"/>
                </div> <br/>
                <div className={classes.userActionSelectContainer}>
                <div className={styles["pick-user-combobox-container"]}>     
                <FormControl className={classes.formControl}>
                 <InputLabel id="demo-simple-select-label">Select User:</InputLabel>
                 <Select 
                  disabled={true}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={test.userId}
                  onChange={handleUserPickSuite}>
                  {
                    !users ? null : Object.values(users).map((user:any)=>{
                      return <MenuItem  value={user.id}>{user.name}</MenuItem>
                    })
                  }
                 </Select>
               </FormControl>
              </div>
              <div className={styles["pick-action-combobox-container"]}>
              <FormControl className={classes.formControl}>
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
             <Button size="small" variant="outlined" color="secondary" onClick={addTestToSuite}>Delete</Button>
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