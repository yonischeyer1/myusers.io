import React from 'react';

// ** Material **
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import Accordion from '@material-ui/core/ExpansionPanel';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

//** Others **
import ServiceStore from '../../services /store.service';
import styles from './TroubleshootMenu.css';


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
      heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightBold,
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
  const { open, pickedTest } = props;


  const handleClose = (e:any) => {
    const {handleTroubleshootMenuClose} = props;
    handleTroubleshootMenuClose(false);
  };

  const handleOpenMaksingWizard = (e:any) => {
    //TODO: implment 
    handleClose(false)
  }

  const handleUIChange = (e:any) => {
    //TODO: implment 
    handleClose(false)
  }

  const handleSetTagWaitTime = (e:any) => {
    //TODO: implment 
    handleClose(false)
  }

  const handleBugReport = (e:any) => {
    //TODO: implment 
    handleClose(false)
  }

  const handleAddSnapshotToTag = (e:any) => {
    //TODO: implment 
    handleClose(false)
  }

  const handleSkipTag = (e:any) => {
    //TODO: implment 
    handleClose(false)
  }

  const handleLiveSnapshot = (e:any) => {
    //TODO: implment 
    handleClose(false)
  }


   //** HTML */
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Troubleshoot Menu
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
        <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
        >
          <Typography className={classes.heading}>Dynamic snapshot</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
             When a tag snapshot has chaging parts in the UI its confusing the snapshot matching enigne
             You can use static masking wizard in order to cover those parts 
          </Typography>
          <br/>
          <Button onClick={handleOpenMaksingWizard} variant="outlined" color="primary">Open Static Masking wizard</Button>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content">
          <Typography className={classes.heading}>UI Change</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
                The website UI has changed to this snapshot.
                Replace current tag image with the faild tag image.
            </Typography>
            <br/>
          <Button onClick={handleUIChange} variant="outlined" color="primary">Replace tag snapshot</Button>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={classes.heading}>Performance issue / slowness</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
                You can increase the wait time of each tag and number of attempts
            </Typography>
            <br/>
          <Button onClick={handleSetTagWaitTime} variant="outlined" color="primary">Increase tag wait time</Button>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={classes.heading}>Bug</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
                As a QA your point of refernce to check that the website behaves as it should is
                the Features user stories.
                <br/>
                When you do detect an exepction in behaviour you should report it to a ticketing system.
            </Typography>
            <br/>
          <Button onClick={handleBugReport} variant="outlined" color="primary">Report Bug</Button>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={classes.heading}>A/B Test</Typography>
        </AccordionSummary>
        <AccordionDetails>
         <div>
            <Typography>
                Thier can be multiple themes for the same interface but elements you did an action on stay in thier postion.<br/>
                You can add this snapshot to the tag and it will check to see of one of the options is correct
            </Typography>
            <br/>
          <Button onClick={handleAddSnapshotToTag} variant="outlined" color="primary">Add snaphsot to tag</Button>
        </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={classes.heading}>Skip</Typography>
        </AccordionSummary>
        <AccordionDetails>
         <div>
            <Typography>
                You can skip tag snapshot matching (Be carful with this option it can lead to unexpeceted behaviour). 
                
            </Typography>
            <br/>
          <Button onClick={handleSkipTag} variant="outlined" color="primary">Skip tag</Button>
         </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={classes.heading}>Live Snapshot</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <div>
            <Typography>
                Add this as a live snapshot tag.<br/>
                If there is a match the test will wait for live action on it
                from user and when he finishes it will continue the test.
            </Typography>
            <br/>
          <Button onClick={handleLiveSnapshot} variant="outlined" color="primary">Open Static Masking wizard</Button>
        </div>
        </AccordionDetails>
      </Accordion>
      </div>
      </Dialog>
    </div>
  ) : <div></div>
}