import './reset.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as WebFontLoader from 'webfontloader';
import {css, StyleSheet} from 'aphrodite';
import {fonts} from './assets/fonts';
import {AppState} from './state/AppState';
import {App} from './App';
import {addStaticState} from './config/general';
import {StaticState} from './state/StaticState';
import {barks} from './config/barks';
import {Route} from './state/types/Route';
const HTML5Backend = require('react-dnd-html5-backend');
const {DragDropContext} = require('react-dnd');
const TWEEN = require('tween.js');
const queryString = require('query-string');

// Initialize application state
const state = new AppState();
state.barker.barks = barks;
addStaticState();
addRoutesAndI18n();
state.load();

function addRoutesAndI18n () {
  state.router.addRoutes(
    require<{routes: {[key: string]: Route}}>('./config/routes').routes
  );

  state.i18n.update(
    require('./assets/i18n/reference.yml'),
    require('./assets/i18n/generated/data').data,
    require('./assets/i18n/generated/messages').messages
  );
}

let startPath = 'start';

// Developer features:
// - Automates default profile if none exist
// - Expose application state in global scope
// - Allow custom start path
let isHMREnabled = false;
if (process.env.NODE_ENV !== 'production') {
  state.ensureProfile();
  (global as any).appState = state;
  (global as any).staticState = StaticState.instance;
  if (typeof window !== 'undefined') {
    const customStartPath = queryString.parse(window.location.search).path;
    if (customStartPath) {
      startPath = customStartPath;
    }
  }
  if (module.hot) {
    isHMREnabled = true;
    module.hot.accept('./App', () => {
      const NextApp = require<{App: typeof App}>('./App').App;
      render(NextApp);
    });
    module.hot.accept(
      [
        './config/routes',
        './assets/i18n/reference.yml',
        './assets/i18n/generated/data',
        './assets/i18n/generated/messages'
      ],
      () => addRoutesAndI18n()
    );
  }
}

state.initialize();
state.router.goto(startPath);

// Set up basic styling
WebFontLoader.load({google: {families: Object.values(fonts)}});

// Set up TWEEN
requestAnimationFrame(animate);
function animate (time: number) {
  TWEEN.update(time);
  requestAnimationFrame(animate);
}

// Set up application rendering
const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%'
  }
});

const rootEl = document.createElement('div');
rootEl.className = css(styles.root);
document.body.appendChild(rootEl);

@DragDropContext(HTML5Backend)
class AppContainer extends React.Component<{appComponent: typeof App}> {
  render () {
    const AppComponent = this.props.appComponent;
    let composedApp = <AppComponent state={state}/>;

    if (isHMREnabled) {
      const HotLoaderContainer = require('react-hot-loader').AppContainer;
      composedApp = (
        <HotLoaderContainer>
          {composedApp}
        </HotLoaderContainer>
      );
    }

    return composedApp;
  }
}

function render (appComponent: typeof App) {
  ReactDOM.render(<AppContainer appComponent={appComponent}/>, rootEl);
}

render(App);
