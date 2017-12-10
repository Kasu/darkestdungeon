import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {ModalState, PopupAlign, PopupHandle} from './state/PopupState';
import {ReactElement} from 'react';
import {computed, observable, transaction} from 'mobx';
import {observer} from 'mobx-react';
import {SizeObserver} from './lib/SizeObserver';
import {Size} from './Bounds';
import {grid} from './config/Grid';
import {InputLayer} from './state/InputState';

@observer
export class PopupEntry extends React.Component<{
  handle: PopupHandle,
  transitionState: string
}> {
  static animateDuration = 250;

  @observable private contentWidth: number = 0;
  @observable private contentHeight: number = 0;

  @computed get alignedPosition () {
    const p = this.props.handle.position || {
      x: grid.outerWidth / 2,
      y: grid.outerHeight / 2
    };

    switch (this.props.handle.align) {
      case PopupAlign.Top:
        return {
          x: p.x - this.contentWidth / 2,
          y: p.y
        };
      case PopupAlign.Right:
        return {
          x: p.x - this.contentWidth,
          y: p.y - this.contentHeight / 2
        };
      case PopupAlign.Bottom:
        return {
          x: p.x - this.contentWidth / 2,
          y: p.y - this.contentHeight
        };
      case PopupAlign.Left:
        return {
          x: p.x,
          y: p.y - this.contentHeight / 2
        };
      case PopupAlign.Center:
        return {
          x: p.x - this.contentWidth / 2,
          y: p.y - this.contentHeight / 2
        };
      case PopupAlign.TopLeft:
        return p;
    }
  }

  render () {
    const handle = this.props.handle;

    const transformStyle = handle.animate && transformStyles[this.props.transitionState];
    const opacityStyle = handle.animate && opacityStyles[this.props.transitionState];
    const filterStyle = handle.animate && filterStyles[this.props.transitionState];

    // Pass on handle to popup content
    let content = handle.content;
    if (typeof content !== 'string') {
      content = React.cloneElement(
        content as ReactElement<{handle: PopupHandle}>,
        {handle}
      );
    }

    // Create the popup
    const popup = (
      <div
        onMouseDown={() => handle.bringToFront()}
        className={css(styles.popup, styles.animator)}
        style={{
          zIndex: handle.layer,
          left: this.alignedPosition.x,
          top: this.alignedPosition.y,
          ...transformStyle,
          ...opacityStyle
        }}>
        {content}
        <SizeObserver onSizeChanged={(size) => this.updateContentSize(size)}/>
      </div>
    );

    // If it doesn't need to be modal we can return it as is
    if (handle.modalState === ModalState.Opaque) {
      return popup;
    }

    const onBackgroundClicked =
      handle.modalState === ModalState.ModalDismiss ?
        () => handle.close() :
        undefined;

    // To make it modal we wrap it in a container containing the modal design
    return (
      <InputLayer
        id={handle.id}
        className={css(styles.modalContainer, styles.animator)}
        style={{zIndex: handle.layer, ...opacityStyle, ...filterStyle}}>
        <div className={css(styles.modalBackground)}
             onClick={onBackgroundClicked}/>
        {popup}
      </InputLayer>
    );
  }

  private updateContentSize (size: Size) {
    transaction(() => {
      this.contentWidth = size.width;
      this.contentHeight = size.height;
    });
  }
}

const transformStyles: {[key: string]: any} = {
  entering: {transform: 'scale(0)'},
  entered: {transform: 'scale(1)'},
  exiting: {transform: 'scale(0)'},
  exited: {transform: 'scale(0)'}
};

const opacityStyles: {[key: string]: any} = {
  entering: {opacity: 0},
  entered: {opacity: 1},
  exiting: {opacity: 0},
  exited: {opacity: 0}
};

const filterStyles: {[key: string]: any} = {
  entering: {backdropFilter: 'blur(0)'},
  entered: {backdropFilter: 'blur(5px)'},
  exiting: {backdropFilter: 'blur(0)'},
  exited: {backdropFilter: 'blur(0)'}
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0
  },

  modalBackground: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    pointerEvents: 'all'
  },

  popup: {
    position: 'absolute',
    pointerEvents: 'all'
  },

  animator: {
    transition: [
      `backdrop-filter ${PopupEntry.animateDuration}ms ease-out`,
      `transform ${PopupEntry.animateDuration}ms ease-out`,
      `opacity ${PopupEntry.animateDuration}ms ease-out`
    ].join(',')
  }
});
