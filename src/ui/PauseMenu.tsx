import * as React from 'react';
import {Popup, PopupProps} from './Popups';
import {LineButton} from './LineButton';
import {AppStateComponent} from '../AppStateComponent';
import {Credits} from './Credits';

export const pauseIcon = require(
  '../assets/dd/images/panels/icons_equip/trinket/inv_trinket+ancestors_candle.png'
);

const sounds = {
  open: {src: require('../assets/dd/audio/ui_shr_pause.ogg'), volume: 0.75},
  close: {src: require('../assets/dd/audio/ui_shr_unpause.ogg'), volume: 0.75}
};

export class PauseMenu extends AppStateComponent<
  PopupProps & {
  mainMenu?: boolean
}> {
  static defaultProps = {
    mainMenu: true
  };

  render () {
    const {mainMenu, ...rest} = this.props; // Single out Popup props
    const router = this.appState.router;
    const popups = this.appState.popups;
    const options = this.appState.options;

    const mainMenuButton = mainMenu && (
      <LineButton label="Return to Main Menu" onClick={() => router.goto('start')}/>
    );

    return (
      <Popup
        {...rest}
        muffle={true}
        openSound={sounds.open}
        closeSound={sounds.close}
        headerIcon={pauseIcon}>
        <LineButton label="Controls" onClick={() => popups.show(<Popup>Controls</Popup>)}/>
        <LineButton label="Credits" onClick={() => popups.show(<Popup fullScreen><Credits/></Popup>)}/>
        <LineButton label="Glossary" onClick={() => popups.show(<Popup>Glossary</Popup>)}/>
        <LineButton label="Help" onClick={() => popups.show(<Popup>Help</Popup>)}/>
        <LineButton
          label="Options"
          onClick={() => popups.show(
            <OptionList options={options}/>)
          }
        />
        {mainMenuButton}
      </Popup>
    );
  }
}

class OptionList extends AppStateComponent<
  PopupProps & {
  options: any
}> {
  render () {
    const {options, ...rest} = this.props; // Single out Popup props

    const optionButtons = [];
    for (const categoryName in options) {
      optionButtons.push(
        <LineButton
          key={categoryName}
          label={categoryName}
          onClick={() =>
            this.appState.popups.show(
              <OptionEditor options={options[categoryName]}/>
            )
          }
        />
      );
    }

    return (
      <Popup {...rest}>
        {optionButtons}
      </Popup>
    );
  }
}

class OptionEditor extends React.Component<
  PopupProps & {
  options: any
}> {
  render () {
    const {options, ...rest} = this.props; // Single out Popup props

    return (
      <Popup {...rest}>
        <pre>
          {JSON.stringify(options, null, 2)}
        </pre>
      </Popup>
    );
  }
}
