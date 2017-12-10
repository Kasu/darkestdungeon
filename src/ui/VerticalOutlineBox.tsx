import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {commonColors, commonStyleFn} from '../config/styles';

export class VerticalOutlineBox extends React.Component<{
  color?: string,
  scale?: number,
  above?: boolean,
  below?: boolean
}> {
  static defaultProps = {
    color: commonColors.brightGold,
    scale: 1,
    above: true,
    below: true
  };

  render () {
    const barStyle = {
      background: commonStyleFn.shineGradient(this.props.color),
      transform: `scaleY(${this.props.scale})`
    };

    return (
      <div className={css(styles.box)}>
        {this.props.above && <div className={css(styles.bar, styles.above)} style={barStyle}/>}
        {this.props.below && <div className={css(styles.bar, styles.below)} style={barStyle}/>}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  box: {
    ...commonStyleFn.dock(),
    pointerEvents: 'none'
  },

  bar: {
    height: grid.border,
    borderRadius: grid.border,
    boxShadow: commonStyleFn.boxShadow()
  },

  above: commonStyleFn.dock('top'),
  below: commonStyleFn.dock('bottom')
});
