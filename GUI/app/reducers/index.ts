import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import loadingMessage from './home'
import users from './users'
import tests from './tests'

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    loadingMessage,
    users,
    tests
  });
}
