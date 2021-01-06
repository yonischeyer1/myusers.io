import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import styles from './DeletePopup.css'
import ServiceStore from '../../services /store.service';

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
  const { open, itemAndCollectionName, currentUserPicked } = props;

  const handleClose = (e:any) => {
    const {handleDeletePopupClose} = props;
    handleDeletePopupClose(false);
  };

  const handleDeleteItemClick = (e:any) => {
      const { collectionName, item, currentUserPicked } = itemAndCollectionName;
      if(currentUserPicked) {
        const users = serviceStore.readDocs('users')
        const user = users[currentUserPicked.id]
        if(collectionName === 'accounts') {
            //TODO:Start login container with message for user to logout from the account manually when he hits finish delete 
            user.accountsIds = user.accountsIds.filter(accountId => accountId !== item.id)
        } else if (collectionName === 'actions') {
            user.actionsIds = user.actionsIds.filter(actionId => actionId !== item.id)
        }
        serviceStore.updateDocs('users', users)
        serviceStore.deleteDoc(collectionName, item)
        handleClose(null)
      } else {
        if(collectionName === "tests") {
          serviceStore.deleteDoc(collectionName, item)
        } else if(collectionName === "users") {
          const users = serviceStore.readDocs('users')
          const user = users[item.id]
          if(user.actionsIds.length > 0) {
            const actions = serviceStore.readDocs('actions');
            for(const actionId of user.actionsIds) {
              delete actions[actionId];
            }
            serviceStore.updateDocs('actions',actions)
          }
          if(user.accountsIds.length > 0) {
            const accounts = serviceStore.readDocs('accounts');
            for(const accountId of user.accountsIds) {
              delete accounts[accountId];
            }
            serviceStore.updateDocs('accounts',accounts)
          }
          serviceStore.deleteDoc(collectionName, item)
          //TODO: delete user session folder
        }
      }
      handleClose(null)
  }

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Remove {itemAndCollectionName.item.name} 
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
            <div>
                Are you sure you want to delete {itemAndCollectionName.item.name} &nbsp; 
                 From {itemAndCollectionName.collectionName} ? 
            </div>
            <br/><br/><br/>
            <div>
            <Button size="small" variant="outlined" color="primary" onClick={handleDeleteItemClick}>Yes</Button>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
            <Button size="small" variant="outlined" color="primary" onClick={handleClose}>No</Button>
            </div>
       </div>
      </Dialog>
    </div>
  ) : <div></div>;
}