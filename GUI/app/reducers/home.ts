import { Action } from 'redux';
import { SET_LOADING_MESSAGE } from '../actions/home';

export default function loadingMessage(state = "", action: Action<any>) {
  switch (action.type) {
    case SET_LOADING_MESSAGE:
      return action.message;
    default:
      return state;
  }
}
