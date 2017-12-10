import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {PopupState} from './state/PopupState';
import {observer} from 'mobx-react';
import {PopupEntry} from './PopupEntry';
import * as TransitionGroup from 'react-transition-group/TransitionGroup';
import Transition from 'react-transition-group/Transition';

@observer
export class PopupList extends React.Component<{
  popups: PopupState
}> {
  renderPopups () {
    const elements: JSX.Element[] = [];
    for (const handle of this.props.popups.map.values()) {
      elements.push(
        <Transition
          key={handle.id}
          timeout={handle.animate ? PopupEntry.animateDuration : 0}
          className={css(styles.container)}>
          {(state: string) => (
            <PopupEntry
              handle={handle}
              transitionState={state}
            />
          )}
        </Transition>
      );
    }
    return elements;
  }

  render () {
    return (
      <div className={css(styles.container, styles.container)}>
        <TransitionGroup className={css(styles.container)}>
          {this.renderPopups()}
        </TransitionGroup>
      </div>
    );
  }
}

/**
 * We want the popup container to be a 0x0 element in the top left,
 * purely to act as a coordinate system for the screen.
 *
 * NOTE: Filling the screen surface would require us to turn off pointer events for the container,
 * which in turn would turn off pointer events for all popups, which is something we don't want.
 */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    pointerEvents: 'none'
  }
});
