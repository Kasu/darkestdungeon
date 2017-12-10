import * as React from 'react';
import {commonColors, commonStyleFn, commonStyles, Row} from '../config/styles';
import {css, StyleSheet} from 'aphrodite';
import {VerticalOutlineBox} from './VerticalOutlineBox';
import {grid} from '../config/Grid';

export const LightMeter = ({fillPercentage, children}: {fillPercentage: number, children: any}) =>  {
  return (
    <Row classStyle={styles.lightMeter}>
      <VerticalOutlineBox color={borderColor}/>
      <Row classStyle={commonStyles.fill} align="flex-end">
        <div
          className={css(styles.fillLeft)}
          style={{width: `${fillPercentage * 100}%`}}
        />
        <div className={css(styles.dash)} style={{left: '25%'}}/>
        <div className={css(styles.dash)} style={{left: '50%'}}/>
        <div className={css(styles.dash)} style={{left: '75%'}}/>
      </Row>
      <div className={css(styles.fillCenter)}>
        {children}
      </div>
      <Row classStyle={commonStyles.fill} align="flex-start">
        <div
          className={css(styles.fillRight)}
          style={{width: `${fillPercentage * 100}%`}}
        />
        <div className={css(styles.dash)} style={{left: '25%'}}/>
        <div className={css(styles.dash)} style={{left: '50%'}}/>
        <div className={css(styles.dash)} style={{left: '75%'}}/>
      </Row>
    </Row>
  );
};

export const lightMeterCenterWidth = grid.xSpan(0.5);
const borderColor = commonColors.darkGray;
const fillInnerColor = 'rgb(246, 115, 0)';
const fillOuterColor =  'rgba(193, 34, 0, 0.5)';

const styles = StyleSheet.create({
  lightMeter: {
    width: grid.xSpan(8),
    height: grid.gutter,
    paddingTop: grid.border,
    paddingBottom: grid.border
  },

  fillLeft: {
    height: '100%',
    background: commonStyleFn.gradient('left', [
      [0, fillInnerColor],
      [90, fillOuterColor],
      [100, 'transparent']
    ])
  },

  fillCenter: {
    width: lightMeterCenterWidth,
    height: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },

  fillRight: {
    height: '100%',
    background: commonStyleFn.gradient('right', [
      [0, fillInnerColor],
      [90, fillOuterColor],
      [100, 'transparent']
    ])
  },

  dash: {
    position: 'absolute',
    width: grid.border,
    height: '100%',
    backgroundColor: borderColor
  }
});
