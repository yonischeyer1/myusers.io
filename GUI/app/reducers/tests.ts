import { Action } from 'redux';
import { SET_TESTS } from '../actions/tests';

export default function tests(state = [], action: any) {
  switch (action.type) {
    case SET_TESTS:{
        return action.tests;
    }
    // case UPSERT_USER:{
    //     state[action.user.name] = action.tests
    //     return {...state}
    // }
    default:{
        return state;
    }
  }
}
