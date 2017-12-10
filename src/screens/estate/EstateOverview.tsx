import * as React from 'react';
import {EstateTemplate} from './EstateTemplate';
import {Path} from '../../state/types/Path';
import {EstateEvent} from '../../state/types/EstateEvent';
import {Popup, PopupProps} from '../../ui/Popups';
import {AppStateComponent} from '../../AppStateComponent';
import {when} from 'mobx';
import {Route} from '../../state/types/Route';
import {StaticState} from '../../state/StaticState';
import {grid} from '../../config/Grid';
import {css, StyleSheet} from 'aphrodite';
import {Avatar} from '../../ui/Avatar';
import {TooltipArea, TooltipSide} from '../../lib/TooltipArea';
import {commonStyles} from '../../config/styles';
import {InputBinding} from '../../state/InputState';
import {Input} from '../../config/Input';
import {Layer} from '../../ui/Layer';

const sounds = {
  continueToMap: {src: require('../../assets/dd/audio/ui_town_button_embark.ogg'), volume: 0.7},
  showBuilding: {src: require('../../assets/dd/audio/ui_town_char_rollover_03.ogg'), volume: 1.5}
};

export class EstateOverview extends AppStateComponent<{
  path: Path,
  route: Route
}> {
  private stopWaitingForEstateEvents: () => void;

  componentWillMount () {
    // Show estate event when there is one
    this.stopWaitingForEstateEvents = when(() => !this.activeProfile.estateEvent.shown, () => {
      this.activeProfile.estateEvent.shown = true;
      this.appState.popups.show(<EstateEventPopup event={this.activeProfile.estateEvent}/>);
    });
  }

  componentWillUnmount () {
    this.stopWaitingForEstateEvents();
  }

  changeActiveBuilding (offset: number) {
    const isABuildingOpen = this.appState.router.path.parts.length > 1;
    if (!isABuildingOpen) {
      return;
    }

    // HACK this is ugly and should be centralized
    // (even though we only do this here)
    const keys = Object.keys(this.props.route.children);
    let nextIndex = keys.findIndex((key) => key === this.appState.router.path.parts[1]) + offset;

    if (nextIndex >= keys.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = keys.length - 1;
    }

    const nextPath = this.props.path.value + Path.separator + keys[nextIndex];
    this.appState.router.goto(nextPath);
  }

  render () {
    return (
      <EstateTemplate
        path={this.props.path}
        coverBackgroundBottom={true}
        background={require('../../assets/dd/images/loading_screen/loading_screen.town_visit.png')}
        continueSound={sounds.continueToMap}
        continueLabel="Embark"
        continuePath="estateDungeons">

        <InputBinding
          global
          match={Input.nextBuilding}
          callback={(e) => this.changeActiveBuilding(e.shiftKey ? -1 : 1)}
        />

        <div className={css(styles.buildingIcons)}>
          {Object.keys(this.props.route.children).map((buildingKey) => {
            // HACK this is ugly and should be centralized
            // (even though we only do this here)
            const buildingPath = this.props.path.value + Path.separator + buildingKey;
            const buildingRoute = this.props.route.children[buildingKey] as Route;
            const building = StaticState.instance.buildings.get(buildingRoute.component.id);
            const isBuildingOpen = this.appState.router.path.equals(buildingPath);
            return (
              <TooltipArea
                key={building.id}
                classStyle={[styles.buildingIcon, isBuildingOpen && styles.buildingIconActive]}
                side={TooltipSide.Right}
                tip={building.name}>
                <Avatar
                  classStyle={commonStyles.fill}
                  src={building.avatarUrl}
                  clickSound={sounds.showBuilding}
                  onClick={() => this.appState.router.goto(buildingPath)}
                />
              </TooltipArea>
            );
          })}
        </div>
      </EstateTemplate>
    );
  }
}

class EstateEventPopup extends React.Component<
  PopupProps & {
  event: EstateEvent
}> {
  render () {
    const {event, ...rest} = this.props;
    return (
      <Popup {...rest}>
        Estate Event: {event.message}
      </Popup>
    );
  }
}

const buildingIconSize = grid.ySpan(1);
const styles = StyleSheet.create({
  buildingIcons: {
    position: 'absolute',
    top: grid.ySpan(3) + grid.gutter,
    left: -grid.xSpan(1) - grid.gutter,
    zIndex: Layer.Roster
  },

  buildingIcon: {
    width: buildingIconSize,
    height: buildingIconSize,
    marginBottom: grid.gutter,
    transition: 'transform 0.3s ease-out'
  },

  buildingIconActive: {
    transform: `translate(${grid.gutter * 2}px, 0)`
  }
});
