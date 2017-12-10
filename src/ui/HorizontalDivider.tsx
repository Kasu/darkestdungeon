import * as React from 'react';
import {commonColors, commonStyleFn} from '../config/styles';
import {grid} from '../config/Grid';
import {css, StyleSheet} from 'aphrodite';

export const HorizontalDivider = () => {
  return <div className={css(styles.horizontalDivider)}/>;
};

const styles = StyleSheet.create({
  horizontalDivider: {
    width: '100%',
    background: commonStyleFn.shineGradient(commonColors.gray),
    boxShadow: commonStyleFn.boxShadow(),
    borderTop: commonStyleFn.border('black', 1),
    borderBottom: commonStyleFn.border('black', 1),
    height: grid.border * 2,
    marginTop: grid.gutter,
    marginBottom: grid.gutter,
    borderRadius: grid.border
  }
});
