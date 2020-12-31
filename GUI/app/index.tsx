import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './components/Root';
import './app.global.css';
import { buildDockerImage, isDockerImageBuilt } from './utils/IHost';
import { IMAGE_NAME } from './utils/Container.controller';
import ServiceStore from './services /store.service'


const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
document.addEventListener('DOMContentLoaded', () =>
(async () => {
    const isImageBuilt = await isDockerImageBuilt(IMAGE_NAME);
    if(!isImageBuilt){
      await buildDockerImage(IMAGE_NAME);
      await (new ServiceStore().init())
     }
     render(
      <AppContainer>
        <Root />
      </AppContainer>,
      document.getElementById('root')
    )
})()
);
