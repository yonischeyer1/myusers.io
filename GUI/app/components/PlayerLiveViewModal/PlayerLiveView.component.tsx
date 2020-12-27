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
import VncViewerComponent from '../VncViewer/vncViewer.component';
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

export default function FullScreenDialog(props:any) {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [testName, setTestName] = React.useState("");
  const { open, port, stopPlaying } = props;
  const handleClose = () => {
    const {handleLivePreviewModalClose} = props;
    handleLivePreviewModalClose(false);
  };
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    // console.log("window.location.pathname",window.location.pathname)
    // if(newValue === 1) {
    //   console.log("window.location.pathname",window.location.pathname)
    //   window.location.pathname += "users"
    // } else {
    //   console.log("window.location.pathname",window.location.pathname)
    //   window.location.pathname = window.location.pathname.replace("users","")
    // }
    setTabIndex(newValue);
  }

  return (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
             Player Live view 
            </Typography>
            <Button color="inherit" onClick={()=>{
                handleClose(false)
              }}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className="modal-content-container">
         <VncViewerComponent stopRecord={false} mode="player" port={port}/> 
       </div>
      </Dialog>
    </div>
  );
}