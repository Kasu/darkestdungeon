import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {commonColors, commonStyleFn} from '../config/styles';

export class BannerHeader extends React.Component<{
  classStyle?: any,
  style?: any
}> {
  render () {
    return (
      <div className={css(styles.bannerHeader, this.props.classStyle)} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  bannerHeader: {
    textAlign: 'center',
    fontWeight: 'bold',
    padding: grid.gutter / 2,
    color: commonColors.gold,
    border: commonStyleFn.border(undefined, grid.border * 2),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    boxShadow: commonStyleFn.boxShadow()
  }
});
