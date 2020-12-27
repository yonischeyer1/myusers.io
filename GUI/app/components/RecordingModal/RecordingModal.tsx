import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { TextField, CircularProgress } from '@material-ui/core';
import VncViewerComponent from '../VncViewer/vncViewer.component';
import moment from 'moment'
import Container, { CONTAINER_MODE } from '../../utils/Container.controller';
import RecordModal from '../RecordModal/RecordModal'
import ServiceStore from '../../services /store';
import LocalDB from '../../utils/localDB.core';
import { User } from '../../models/User.model';
import { Account } from '../../models/Account.model';
import { removeContainerByName } from '../../utils/IHost';
import styles from './RecordingModal.css'

const localDB = new LocalDB();
const serviceStore = new ServiceStore()

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
  const [state, setState] = React.useState({
    record: false,
    port: null,
    loading:false,
    imageName:null,
    containerId:null,
    stopRecord:false,
    openModal:false,
    videoFilePath:null,
    totalRecordTime:null,
    recorderContainer:null,
    recordButtonDisable:false,
    stopButtonDisable:true,
    startRecordingDateTime:null,
    imageTest: null,
    startUrl:null
  });
  const classes = useStyles();
  const { open } = props;
  const handleClose = () => {
    const {handleRecordingModalClose} = props;
    handleRecordingModalClose(false);
  };
  const  initRecorder = async () => {
    const userName = serviceStore.get('currentUser') ? serviceStore.get('currentUser').name : serviceStore.get('userName') 
    const recorderContainer = new Container(CONTAINER_MODE.recorder);
    await recorderContainer.init()
    recorderContainer.loadingFunction = setLoadingState;
    await recorderContainer.record(state.startUrl, userName)
    serviceStore.upsert('startUrl',state.startUrl)
    console.log("recorderContainer",recorderContainer)
    setState({...state,record:true, port:recorderContainer._port,
        recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:recorderContainer})
  }
  const setLoadingState = (loading:boolean) => {
    setState({...state,loading})
  }
  const startRecording = async () => {
    await initRecorder()
   }
   const stopRecording = async () => {
   const totalRecordTime = moment(new Date()).diff(moment(state.startRecordingDateTime))
   const { recorderContainer } = state;
   setState({...state,stopRecord: true, stopButtonDisable:true});
   setTimeout(async ()=>{
    await recorderContainer.stopRecording();
    setState({...state, record:false, stopRecord: false, openModal:true, totalRecordTime, recordButtonDisable:false})
   },2000)
   }

   const handleModalClosing = async (state?:any, recordAgain?:any) => {
    if(recordAgain) {
      setState(Object.assign(state,{openModal:false}))
      startRecording();
      return
    }
    setState(Object.assign(state,{openModal:false}))
   }
   const abort = () => {
     const { recorderContainer } = state;
    setState(Object.assign(state,{loading:true, record:false, stopRecord: true, recordButtonDisable:true, stopButtonDisable:true}))
    // await recorderContainer.abort();
    setState(Object.assign(state,{loading:false, record:false, recordButtonDisable:false, stopButtonDisable:true, stopRecord:false}))
   }


   const startLogin = async () => {
      const userName = serviceStore.get('currentUser')  ? serviceStore.get('currentUser').name : serviceStore.get('userName')
      const loginURL = serviceStore.get('loginURL')
      const loginContainer = new Container(CONTAINER_MODE.login);
      await loginContainer.init()
      loginContainer.loadingFunction = setLoadingState;
      await loginContainer.login(loginURL, userName)
      setState({...state,record:true, port:loginContainer._port,
        recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:loginContainer})
   }

   const finishLogin = async () => {
     const {handleRecordingModalClose} = props
     const userName = serviceStore.get('currentUser')  ? serviceStore.get('currentUser').name : serviceStore.get('userName')
     const loginContainer = state.recorderContainer;
     await loginContainer.finishLogin(userName);
     
     await saveAccount()
     await removeContainerByName(loginContainer._containerName)
     serviceStore.upsert('isLoginMode', false)
     handleRecordingModalClose()
    }

   const saveAccount = async () => {
    const Users:any = await localDB.getModelArrayByName(localDB.MODELS.User);
    const Accounts:any = await localDB.getModelArrayByName(localDB.MODELS.Account);
    const currentUser = serviceStore.get('currentUser')
    const accountName = serviceStore.get('accountName')
    const loginURL = serviceStore.get('loginURL')
    if(currentUser) {
      const indexOfPickedUser = Users.findIndex(user => user.id === currentUser.id)
      const accountToInsert:Account = {
        id:localDB.createRandomId(),
        name: accountName,
        loginURL
      }
      Accounts.push(accountToInsert);
      Users[indexOfPickedUser].accountsIds.push(accountToInsert.id)
      localDB.saveModel(localDB.MODELS.Account, Accounts)
      localDB.saveModel(localDB.MODELS.User, Users)
    } else {
      const userName = serviceStore.get('userName')
      const userToInsert:User = {
        name:userName,
        accountsIds:[],
        actionsIds:[]
      }
      const accountToInsert:Account = {
        id:localDB.createRandomId(),
        name: accountName,
        loginURL
      }
      userToInsert.accountsIds.push(accountToInsert.id)
      Accounts.push(accountToInsert);
      Users.push(userToInsert)
      localDB.saveModel(localDB.MODELS.Account, Accounts)
      localDB.saveModel(localDB.MODELS.User, Users)

    }
   }
   
  return (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {serviceStore.get('isLoginMode') ? 'Login Account' : ' Recording wizard '}
            
            </Typography>
            <Button color="inherit" onClick={()=>{
                handleClose()
              }}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
       <div className="modal-content-container">
       <div>
           <div style={{color:"black",display:"flex",width:"100%",height:"auto"}}>
             {
               serviceStore.get('isLoginMode') ?              
               <div className={styles["buttons-container"]}>
                  <div className="recoreder-control-button"> 
                  <Button size="small" variant="outlined"  color="primary" disabled={false} onClick={()=>{
                       startLogin();
                      }}>login</Button> 
                  </div>
                <div className={styles["recoreder-control-button"]}> 
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={()=>{
                    finishLogin();
                   }}>Finish</Button>      
               </div>
               </div> : 
                 <div className={styles["buttons-container"]}>
                 <div className={styles["recoreder-control-button"]}>
                    <Button size="small" variant="outlined" color="secondary" disabled={state.recordButtonDisable} onClick={()=>{
                     startRecording();
                     }}>record</Button> 
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={state.stopButtonDisable} onClick={()=>{
                   stopRecording();
                 }}>stop</Button>
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={state.stopButtonDisable} onClick={()=>{
                   abort();
                 }}>abort</Button>
                 </div>
               </div>
             }
             <div style={{width:"100%"}}>
             {
               serviceStore.get('isLoginMode') ? null : <TextField disabled={state.recordButtonDisable} 
               onChange={( e => setState(Object.assign(state,{startUrl: e.target.value})))} 
               label="URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
             }
                 {
                 state.loading ? <div className={styles["loading-container"]}><CircularProgress 
                 style={{ alignSelf: "center", width: "100px", height: "100px",marginBottom: "15%"}}/>
                </div> :
                     state.record ?  <VncViewerComponent stopRecord={state.stopRecord} mode="recorder" port={state.port}/> :
                   <div className={styles["blank-container"]}>
                   </div>
                 }
              </div>
           </div>
           <RecordModal recorderContainer={state.recorderContainer} totalRecordTime={state.totalRecordTime} open={state.openModal} handleModalClose={handleModalClosing}/>
         </div>
        </div>
      </Dialog>
    </div>
  );
}