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
import { Test, TEST_STATUS } from '../../models/Test.model';
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
      display: "flex"
    },
    doneCancelBtnsContianer: {
      display:"flex"
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
  const [testName, setTestName] = React.useState("");
  const [pickedUserId, setPickedUser] = React.useState("");
  const [pickedUserActions, setPickedUserActions] = React.useState(null);
  const [pickedUserAction, setPickedUserAction] = React.useState("");
  const [pickedUserIdFinal, setPickedUserFinal] = React.useState("");
  const [pickedUserActionsFinal, setPickedUserActionsFinal] = React.useState(null);
  const [pickedUserActionFinal, setPickedUserActionFinal] = React.useState("");
  const { open } = props;
  let users = []
  let actions = []

  if(open) {
    users = serviceStore.readDocs('users');
    actions = serviceStore.readDocs('actions');
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

  const handleActionPick = async (e:any) => {
    const pickedAction = e.target.value
    setPickedUserAction(pickedAction)
  }

  const handleUserPickFinal = async (e:any) => {
    const {userActions, user} = getUserActions(e);
    setPickedUserFinal(user.id)
    setPickedUserActionsFinal(userActions)
  }

  const handleActionPickFinal = async (e:any) => {
    const pickedAction = e.target.value
    setPickedUserActionFinal(pickedAction)
  }

  

  const save = async (e:any) => {
    const test:Test = {
      name:testName,
      userId:pickedUserId,
      actionId:pickedUserAction,
      schedule:{},
      finishAction: {
        actionId:pickedUserActionFinal,
        userId:pickedUserIdFinal
      },
      status:TEST_STATUS.IDLE
    }
    debugger
    serviceStore.createDoc('tests', test);
  }

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
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
             <div className={styles["test-name-container"]}>
            <TextField disabled={false} 
             onChange={( e => setTestName(e.target.value)) } 
             label="Test name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
             </div>
             <br/>
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
        </div>     

        <div className={styles["pick-schedule-container"]}>
             
        </div>
        <div className={styles["pick-user-finish-action-container"]}>
          <br/> <br/>
              &nbsp; Pick Action to run on test finish:
              <br/><br/>
             <div className={classes.userActionSelectContainer}>
         <div className={styles["pick-user-combobox-container"]}>     
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Select User:</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={pickedUserIdFinal}
            onChange={handleUserPickFinal}
          >
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
          <Select labelId="demo-simple-select-label" id="demo-simple-select"
            value={pickedUserActionFinal}
            onChange={handleActionPickFinal}>
            {
              !pickedUserActionsFinal ? null : Object.values(pickedUserActionsFinal).map((userAction:any)=>{
                return <MenuItem value={userAction.id}>{userAction.name}</MenuItem>
              })
            }
          </Select>
        </FormControl>
            </div>
        </div>    
        </div>
        <br/><br/>
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={handleClose}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={save}>Done</Button>
         </div>
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}