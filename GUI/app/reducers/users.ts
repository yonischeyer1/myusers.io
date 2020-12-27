import { Action } from 'redux';
import { SET_USERS, UPSERT_USER } from '../actions/users';

export default function users(state = {}, action: Action<any>) {
  switch (action.type) {
    case SET_USERS:{
        return action.users;
    }
    case UPSERT_USER:{
        state[action.user.name] = action.user
        return {...state}
    }
    default:{
        return state;
    }
  }
}
