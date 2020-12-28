import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import App from './components/App';
import HomePage from './components/Home/Home';

export default function Routes() {
  return (
    <App>
      <BrowserRouter>
      <Switch>
        <Route path="/" component={HomePage} />
      </Switch>
      </BrowserRouter>
    </App>
  );
}
