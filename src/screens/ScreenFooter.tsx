import * as React from 'react';
import {StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {commonColors, commonStyleFn, Row} from '../config/styles';
import {Layer} from '../ui/Layer';

export class ScreenFooter extends React.Component<{
  behind?: any,
  classStyle?: any
}> {
  render () {
    return (
      <Row classStyle={[styles.screenFooter, this.props.classStyle]}>
        {this.props.behind}
        <Row classStyle={styles.inner1}>
          <Row classStyle={styles.inner2}>
            {this.props.children}
          </Row>
        </Row>
      </Row>
    );
  }
}

const borderSize = grid.border;
const borderSpacing = grid.border * 2;
export const screenFooterHeight = grid.ySpan(1) + borderSpacing * 2 + borderSize * 2;

const styles = StyleSheet.create({
  screenFooter: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: grid.paddingBottom - borderSpacing - borderSize,
    height: screenFooterHeight,
    zIndex: Layer.Footer,

    ':after': {
      ...commonStyleFn.dock('bottom'),
      content: '" "',
      background: 'black',
      height: grid.paddingBottom,
      bottom: -grid.paddingBottom
    }
  },

  inner1: {
    ...commonStyleFn.dock(),
    backgroundColor: commonColors.gray,
    boxShadow: commonStyleFn.outerShadow('black', grid.gutter * 2)
  },

  inner2: {
    ...commonStyleFn.dockWithPadding(0, borderSize),

    paddingLeft: grid.paddingLeft,
    paddingRight: grid.paddingRight,
    paddingTop: borderSpacing,
    paddingBottom: borderSpacing,

    background: 'linear-gradient(to right, rgba(0,0,0,1) 0%,rgba(25,25,25,1) 50%,rgba(0,0,0,1) 100%)',
    boxShadow: commonStyleFn.innerShadow('black', grid.gutter * 3),
    alignItems: 'center'
  }
});
