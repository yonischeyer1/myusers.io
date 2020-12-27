import React from 'react';
import User from './User.component'
import styles from './users.css';
import { Button } from '@material-ui/core';
import UpsertUserModal from './UpsertUserModal/upsertModal'

export default function Users(props:any) {
  const { users, upsertUserFunc } = props;
  const [addUserModalOpen, setUserModal] = React.useState(false);
  const onCloseModal = () => {
    setUserModal((false))
  }
  return (
    <div>
      {
        users.length === 0 ? <div className={styles.usersEmptyState}>
          No users 
        </div> :
        <div style={{color:"black"}}>
          {
            Object.keys(users).map((userNameKey:any)=>{
              return (<div>
                <User user={users[userNameKey]}/>
              </div>)
            })
          }
        </div>
      }
      <div style={{color:"black"}}>
      <Button style={{width:"100%"}} size="small" variant="outlined" color="primary" onClick={()=>{
        setUserModal(true)
      }}  >Add User + </Button>
      </div>
      <UpsertUserModal upsertUserFunc={upsertUserFunc} open={addUserModalOpen} onCloseModal={onCloseModal}/>
    </div>
  )
}