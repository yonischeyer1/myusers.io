import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import UsersPage from './containers/Users.container';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.HOME} component={HomePage} />
        <Route path={routes.USERS} component={UsersPage} />
      </Switch>
    </App>
  );
}
