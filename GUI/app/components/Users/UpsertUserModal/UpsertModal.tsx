// import React, { useEffect } from 'react';
// import { TransitionProps } from '@material-ui/core/transitions';
// import { Dialog, TextField, Button, Select, MenuItem, FormControlLabel, InputLabel, FormControl, Checkbox } from '@material-ui/core';
// import Slide from '@material-ui/core/Slide';
// import styles from './upsertUserModal.css'
// import SaveIcon from '@material-ui/icons/Save';
// import _ from 'lodash'
// import User from '../user'
  
//  let _save = false;
  
//   const Transition = React.forwardRef(function Transition(
//     props: TransitionProps & { children?: React.ReactElement },
//     ref: React.Ref<unknown>,
//   ) {
//     return <Slide direction="up" ref={ref} {...props} />;
//   });

//   export default function FullScreenDialog(props:any) { 
//   const { open, onCloseModal, upsertUserFunc } = props;
//   const [user, setNewUser] = React.useState(props.user ? props.user : {type:"TEST" ,playlist:[]})
//   const setUserState = (user:any) =>{
//      return new Promise((resolve,reject)=>{
//         setNewUser({...user})
//         useEffect(() => {
//           resolve()
//         }, [user]);
//      })
//    }
//       return (
//           <div>
//                 <Dialog fullScreen open={open} TransitionComponent={Transition}>
//                 <div className="modal-content-container">
//                  <div className="create-user-title">
//                      <h3>CREATE USER: </h3>
//                  </div><br/>
//                  <div style={{width:"100px"}}>
//                  <FormControl style={{width:"100px"}} variant="outlined">
//                  <InputLabel id="demo-simple-select-outlined-label">User Type:</InputLabel>
//                  <Select variant="outlined" label="User Type:"
//                      labelId="demo-simple-select-outlined-label"
//                      id="demo-simple-select-outlined"
//                      value={user.type}
//                      onChange={async (e)=>{
//                          const value = e.target.value
//                          user.type = value
//                          await setUserState(user)
//                      }}
//                    >
//                      <MenuItem value={"TEST"}>TEST</MenuItem>
//                      <MenuItem value={"OP"}>OP</MenuItem>
//                    </Select>
//                  </FormControl>
//                  </div><br/>
//                  <div>
//                      <TextField label="User Name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small" 
//                      onChange={async (e)=>{
//                       user.name = e.target.value
//                       await setUserState(user)
//                      }}/>
//                  </div><br/>
//                  <div className={styles.ioPlayListTitle}>
//                      IO Playlist: 
//                  </div>
//                  <div className={styles.ioplaylistContainer}>
//                   {
//                        user.playlist.map((ioFile:any)=>{
//                           return (<div>{ioFile}</div>)
//                       }) 
//                   }
//                 </div><br/>
//                 <div >
//                 <Button className={styles.addButtonIoPlaylist} size="small" variant="outlined" color="primary"
//                 onClick={async (e)=>{
//                     const { dialog } = require('electron').remote;
//                     let pathPromise = await  dialog.showOpenDialog({
//                       filters: [
//                             { name: "IOFiles", extensions: ["json"] }
//                       ],
//                       properties: ['openFile']
//                     });
//                     const filePicked = pathPromise.filePaths[0]
//                     user.playlist.push(filePicked);
//                     await setUserState(user)
//                 }}>Add + </Button>
//                 </div><br/>
//                 <div className={styles.ioPlayListTitle}>
//                 <FormControlLabel  control={<Checkbox  color="primary" name="checkedE" checked={user.schedule} onChange={async (e)=>{
//                    user.schedule =  user.schedule ? null : {sunday:[]}
//                    await setUserState(user)
//                 }} />} label="User schedule" />
//                  {
//                    user.schedule ? <div>
//                      user schedule
//                    </div> : null
//                  }
//                 </div><br/>
//                 <div className={styles.ioPlayListTitle}>
//                     <Button size="small" variant="outlined" color="primary" onClick={()=>{
//                         onCloseModal()
//                     }}>
//                         Cancel 
//                     </Button>
//                     <Button style={{position: "absolute", right: "50px"}} size="small" variant="outlined" color="primary">
//                     <SaveIcon/> &nbsp; 
//                      <span style={{position:"relative",top:"2px"}} onClick={()=>{
//                        _save = true
//                        upsertUserFunc(new User(user))
//                        onCloseModal()
//                      }}>Save</span>  
//                     </Button>
//                 </div>
//                 </div>
//                 </Dialog>
//           </div>
//       )
//   }