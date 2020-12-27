import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import './app.global.css';
import { buildDockerImage, isDockerImageBuilt } from './utils/IHost';
import { IMAGE_NAME } from './utils/Container.controller';


const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
document.addEventListener('DOMContentLoaded', () =>
(async () => {
    const isImageBuilt = await isDockerImageBuilt(IMAGE_NAME);
    if(!isImageBuilt){
      await buildDockerImage(IMAGE_NAME);
     }
     render(
      <AppContainer>
        <Root />
      </AppContainer>,
      document.getElementById('root')
    )
})()
);
