import React, {Suspense} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import {APP_CWD } from '../../utils/general';
import { TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box, Fab } from '@material-ui/core';
import ServiceStore from '../../services /store';
import RecordingModal from '../RecordingModal/RecordingModal'
const serviceStore = new ServiceStore();
// import { IMAGE_HASH_BITS, convertURIToImageData } from '../../utils/testIoFile';
interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }


function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const state = {
  imageArray:[],
  totalRecordTime:null,
  screen: "validate"
}

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
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
      },
  }),
);


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let account:any = null;

export default function FullScreenDialog(props:any) {
  const classes = useStyles();
  const [openRecordingModal, setOpenRecordingMoal] = React.useState(false);
  const [testName, setTestName] = React.useState("");
  const { open } = props;
  const handleClose = () => {
    const {handleUpsertAccountModalClose} = props;
    handleUpsertAccountModalClose(false);
  };
  const handleRecordingModalClose = () => {
    setOpenRecordingMoal(false)
    const {handleUpsertAccountModalClose} = props;
    handleUpsertAccountModalClose(false);
  }

  const handleAccountNameChange = (e:any) => {
    const key = "accountName"
    const newActionName = e.target.value
    serviceStore.upsert(key,newActionName)
  }

  const handleLoginUrlChange = (e:any) => {
    const key = "loginURL"
    const newActionName = e.target.value
    serviceStore.upsert(key,newActionName)
  }

  return (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Account Upsert 
            </Typography>
            <Button color="inherit" onClick={()=>{
                handleClose(false)
              }}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className="modal-content-container">
          <div className="test-name-container">
             <TextField disabled={false} 
             onChange={handleAccountNameChange} 
             label="Account name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
          </div>
          <div className="test-name-container">
             <TextField disabled={false} 
             onChange={handleLoginUrlChange} 
             label="Login URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
         </div>
         <div className="pick-action-combobox-container">
             <FormControl className={classes.formControl}>
             <Button size="small" variant="outlined" color="primary" onClick={()=>{
                  serviceStore.upsert('isLoginMode', true)
                  setOpenRecordingMoal(true)  
                }}>Login</Button>
        </FormControl>
       </div>
            <br/><br/>
         <div className="done-cancel-btns">
         <Button size="small" variant="outlined" color="secondary" onClick={()=>{}}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={()=>{}}>Done</Button>
         </div>
      </div>
      </Dialog>
      <RecordingModal handleRecordingModalClose={handleRecordingModalClose} open={openRecordingModal}/>
    </div>
  );
}