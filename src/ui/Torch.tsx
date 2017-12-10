import * as React from 'react';
import {TooltipArea} from '../lib/TooltipArea';
import {Quest} from '../state/types/Quest';
import {observer} from 'mobx-react';
import {css, StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {LightMeter, lightMeterCenterWidth} from './LightMeter';
import {Sprite} from '../lib/Sprite';
import {smoke} from '../assets/sprites';

@observer
export class Torch extends React.Component<{
  quest: Quest,
  classStyle?: any
}> {
  render () {
    const quest = this.props.quest;
    return (
      <div className={css(styles.torch, this.props.classStyle)}>
        <LightMeter fillPercentage={quest.lightPercentage}>
          <Sprite {...smoke} classStyle={styles.sprite}/>
          <TooltipArea classStyle={styles.info} tip={`Light: ${quest.light}`}>
            {quest.inBattle ? quest.turn : ''}
          </TooltipArea>
        </LightMeter>
      </div>
    );
  }
}

const spriteSize = grid.ySpan(2);
export const styles = StyleSheet.create({
  torch: {
    height: spriteSize,
    justifyContent: 'center'
  },

  sprite: {
    position: 'absolute',
    width: spriteSize,
    height: spriteSize,
    pointerEvents: 'none'
  },

  info: {
    position: 'absolute',
    width: lightMeterCenterWidth,
    height: lightMeterCenterWidth,
    background: 'black',
    borderRadius: lightMeterCenterWidth / 2,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
