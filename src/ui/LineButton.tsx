import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {observer} from 'mobx-react';
import {IObservableValue, IReactionDisposer, observable, reaction} from 'mobx';
import {grid} from '../config/Grid';
import {VerticalOutlineBox} from './VerticalOutlineBox';
import {commonColors} from '../config/styles';
import {AppStateComponent} from '../AppStateComponent';

const sounds = {
  hover: {src: require('../assets/dd/audio/ui_shr_button_mouse_over.ogg'), volume: 0.7},
  click: {src: require('../assets/dd/audio/ui_shr_button_click.ogg'), volume: 0.5}
};

@observer
export class LineButton extends AppStateComponent<{
  label?: string,
  defaultColor?: string,
  hoverColor?: string,
  outlineScale?: number,
  textGlow?: boolean,
  clickSound?: IHowlProperties,
  hoverState?: IObservableValue<boolean>,
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
  onRightClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  classStyle?: any,
  style?: any
}> {
  static defaultProps = {
    clickSound: sounds.click,
    defaultColor: 'transparent',
    hoverColor: commonColors.gold,
    textGlow: true
  };

  private stopReactingToHover: IReactionDisposer;
  private defaultHoverState = observable(false);

  get hoverState () {
    return this.props.hoverState || this.defaultHoverState;
  }

  componentWillMount () {
    this.stopReactingToHover = reaction(
      () => this.hoverState.get(),
      (isOver) =>  {
        if (isOver && this.props.onClick) {
          this.appState.sfx.play(sounds.hover);
        }
      }
    );
  }

  componentWillUnmount () {
    this.stopReactingToHover();
  }

  render () {
    const outlineColor = this.hoverState.get() ? this.props.hoverColor : this.props.defaultColor;
    return (
      <div
        style={this.props.style}
        className={css(styles.lineButton, this.props.textGlow && styles.textGlow, this.props.classStyle)}
        onMouseEnter={() => this.hoverState.set(true)}
        onMouseLeave={() => this.hoverState.set(false)}
        onClick={this.onClick.bind(this)}
        onContextMenu={(e) => {
          e.preventDefault();
          if (this.props.onRightClick) {
            this.props.onRightClick(e);
          }
          return false;
        }}>
        {this.props.label}
        {this.props.children}
        <VerticalOutlineBox color={outlineColor} scale={this.props.outlineScale}/>
      </div>
    );
  }

  onClick (e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.onClick) {
      if (this.props.clickSound) {
        this.appState.sfx.play(this.props.clickSound);
      }
      this.props.onClick(e);
    }
  }
}

const styles = StyleSheet.create({
  lineButton: {
    paddingTop: grid.gutter,
    paddingBottom: grid.gutter,
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center'
  },

  textGlow: {
    transition: 'text-shadow .1s ease-out',
    textShadow: `0px 0px 0px transparent`,
    ':hover': {
      textShadow: `0px 0px 35px #ffffff`
    }
  }
});
