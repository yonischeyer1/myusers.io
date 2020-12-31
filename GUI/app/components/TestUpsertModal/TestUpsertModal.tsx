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
import LocalDB, { MODELS } from '../../utils/localDB.core';
import { Test, TEST_STATUS } from '../../models/Test.model';
import styles from './TestUpsertModal.css'

import ServiceStore from '../../services /store.service'

const localDB = new LocalDB();


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

let users:any;
let userActions:any;
let userActionsFinal:any;
setTimeout(()=>{
  (async ()=> {
    users = await (new LocalDB().getModelArrayByName(MODELS.User))
    console.log(users)
  })()
},5000)

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
  const handleClose = () => {
    const {handleUpsertTestModalClose} = props;
    handleUpsertTestModalClose(false);
  };

  const save = async (e:any) => {
    const Tests:any = await localDB.getModelArrayByName(MODELS.Test)
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
    Tests.push(test);
    localDB.saveModel(MODELS.Test, Tests)
  }

  return (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Test Upsert 
            </Typography>
            <Button color="inherit" onClick={()=>{
                handleClose(false)
              }}>
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
            onChange={async(e)=>{
              const menuItemSelected = e.target.value
              const user = users.find( (user:any) => user.id === menuItemSelected)
              const actions:any = await (new LocalDB().getModelArrayByName(MODELS.Action))
              userActions = actions.filter((action:any) => user.actionsIds.find((actionId: any) => actionId === action.id ))
              setPickedUser(user.id)
              setPickedUserActions(userActions)
              //on pick get id of user selected
              //use id to get user actions  
            }}>
            {
              !users ? null : users.map((user:any)=>{
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
            onChange={(e:any)=>{
              const pickedAction = e.target.value
              setPickedUserAction(pickedAction)
            }}>
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
            onChange={async (e)=>{
              const menuItemSelected = e.target.value
              const user = users.find( (user:any) => user.id === menuItemSelected)
              const actions:any = await (new LocalDB().getModelArrayByName(MODELS.Action))
              userActionsFinal = actions.filter((action:any) => user.actionsIds.find((actionId: any) => actionId === action.id ))
              setPickedUserFinal(user.id)
              setPickedUserActionsFinal(userActionsFinal)
            }}
          >
            {
              !users ? null : users.map((user:any)=>{
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
            value={pickedUserActionFinal}
            onChange={(e)=>{
              const pickedAction = e.target.value
              setPickedUserActionFinal(pickedAction)
            }}
          >
            {
              !pickedUserActionsFinal ? null : pickedUserActionsFinal.map((userAction:any)=>{
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
         <Button size="small" variant="outlined" color="secondary" onClick={()=>{}}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={save}>Done</Button>
         </div>
        </div>
      </Dialog>
    </div>
  );
}