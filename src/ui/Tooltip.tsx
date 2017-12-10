import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {commonColors, commonStyleFn} from '../config/styles';
import {grid} from '../config/Grid';
import {fonts} from '../assets/fonts';

export class Tooltip extends React.Component <{
  classStyle?: any
}> {
  render () {
    return (
      <div className={css(styles.tooltip, this.props.classStyle)}>
        {this.props.children}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  tooltip: {
    border: commonStyleFn.border(commonColors.gray),
    boxShadow: commonStyleFn.boxShadow(),
    borderRadius: grid.border,
    fontFamily: fonts.Default,
    fontWeight: 'normal',
    padding: grid.gutter,
    backgroundColor: 'black',
    color: commonColors.lightGray
  }
});
