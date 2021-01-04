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
import ServiceStore from '../../services /store.service'
import { User } from '../../models/User.model';
import { Account } from '../../models/Account.model';
import { removeContainerByName } from '../../utils/IHost';
import styles from './RecordingModal.css'

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
let checkOnceisLoginModeFlag = false
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


  const startLogin = async (e:any) => {
    const userName = serviceStore.getAppStateValue('currentUser')  ? serviceStore.getAppStateValue('currentUser').name : serviceStore.getAppStateValue('userName')
    const loginURL = serviceStore.getAppStateValue('loginURL')
    const loginContainer = new Container(CONTAINER_MODE.login);
    await loginContainer.init()
    loginContainer.loadingFunction = setLoadingState;
    await loginContainer.login(loginURL, userName)
    setState({...state,record:true, port:loginContainer._port,
      recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:loginContainer})
 }

  if(serviceStore.getAppStateValue('isLoginMode') && !checkOnceisLoginModeFlag) {
    checkOnceisLoginModeFlag = true;
     startLogin(null);
  }

  const handleClose = async (e:any) => {
    const loginContainer:any = state.recorderContainer;
    if(loginContainer) {
      await removeContainerByName(loginContainer._containerName)
    }
    serviceStore.upsertAppStateValue('isLoginMode', false)
    const {handleRecordingModalClose} = props;
    handleRecordingModalClose(false);
  };
  const  initRecorder = async () => {
    const userName = serviceStore.getAppStateValue('currentUser') ? serviceStore.getAppStateValue('currentUser').name : serviceStore.getAppStateValue('userName') 
    const recorderContainer = new Container(CONTAINER_MODE.recorder);
    await recorderContainer.init()
    recorderContainer.loadingFunction = setLoadingState;
    await recorderContainer.record(state.startUrl, userName)
    serviceStore.upsertAppStateValue('startUrl',state.startUrl)
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
   const stopRecording = async (e:any) => {
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

   const abort = (e:any) => {
     const { recorderContainer } = state;
    setState(Object.assign(state,{loading:true, record:false, stopRecord: true, recordButtonDisable:true, stopButtonDisable:true}))
    // await recorderContainer.abort();
    setState(Object.assign(state,{loading:false, record:false, recordButtonDisable:false, stopButtonDisable:true, stopRecord:false}))
   }

   const finishLogin = async (e:any) => {
     const {handleRecordingModalClose} = props
     const userName = serviceStore.getAppStateValue('currentUser')  ? serviceStore.getAppStateValue('currentUser').name : serviceStore.getAppStateValue('userName')
     const loginContainer = state.recorderContainer;
     await loginContainer.finishLogin(userName);
     
     await saveAccount()
     await removeContainerByName(loginContainer._containerName)
     serviceStore.upsertAppStateValue('isLoginMode', false)
     handleRecordingModalClose()
    }

    const handleURLChange = (e:any) => {
      setState(Object.assign(state,{startUrl: e.target.value}))
    }

   const saveAccount = async () => {
    const users:any = serviceStore.readDocs('users');
    const currentUser = serviceStore.getAppStateValue('currentUser')
    const accountName = serviceStore.getAppStateValue('accountName')
    const loginURL = serviceStore.getAppStateValue('loginURL')

    const accountToInsert:Account = {
      name: accountName,
      loginURL
    }
    const createdAccountId:any = serviceStore.createDoc('accounts', accountToInsert);

    if(currentUser) {
      users[currentUser.id].accountsIds.push(createdAccountId)
      serviceStore.updateDocs('users', users)
    } else {
      const userName = serviceStore.getAppStateValue('userName')
      const userToInsert:User = {
        name:userName,
        accountsIds:[],
        actionsIds:[]
      }
      userToInsert.accountsIds.push(createdAccountId)
      serviceStore.createDoc('users', userToInsert);
    }
   }
   
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {serviceStore.getAppStateValue('isLoginMode') ? 'Login Account' : ' Recording wizard '}
            
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
       <div className="modal-content-container">
       <div>
         <br/><br/>
           <div style={{color:"black",display:"flex",width:"100%",height:"auto", justifyContent:"center"}}>
             {
               serviceStore.getAppStateValue('isLoginMode') ?              
               <div className={styles["buttons-container"]}>
                <div className={styles["recoreder-control-button"]}> 
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={finishLogin}>Finish</Button>      
               </div>
               </div> : 
                 <div className={styles["buttons-container"]}>
                 <div className={styles["recoreder-control-button"]}>
                    <Button size="small" variant="outlined" color="secondary" disabled={state.recordButtonDisable} onClick={startRecording}>record</Button> 
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={state.stopButtonDisable} onClick={stopRecording}>stop</Button>
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={state.stopButtonDisable} onClick={abort}>abort</Button>
                 </div>
               </div>
             }
             <div style={{width:"auto"}}>
             {
               serviceStore.getAppStateValue('isLoginMode') ? null : <TextField disabled={state.recordButtonDisable} 
               onChange={handleURLChange} 
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
  ) : <div></div>
}