import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {commonStyleFn} from '../config/styles';
import {grid} from '../config/Grid';

export class StressMeter extends React.Component<{
  percentage: number,
  classStyle?: any
}> {
  getStressLevels () {
    const levels = [];
    const boxCount = 10;
    const scaledPercentage = this.props.percentage * 2;

    for (let i = 0; i < boxCount; i += 1) {
      const minValueFor1 = i / boxCount;
      const minValueFor2 = 1 + minValueFor1;
      if (scaledPercentage > minValueFor2) {
        levels.push(2);
      } else if (scaledPercentage > minValueFor1) {
        levels.push(1);
      } else {
        levels.push(0);
      }
    }
    return levels;
  }

  render () {
    return (
      <div className={css(styles.stressMeter, this.props.classStyle)}>
        {this.getStressLevels().map((level, index) =>
          <StressBox key={index} level={level}/>)
        }
      </div>
    );
  }
}

const StressBox = ({level}: {level: number}) => {
  return (
    <div className={css(styles.stressBox, stressBoxStyles[level])}/>
  );
};

const styles = StyleSheet.create({
  stressMeter: {
    flexDirection: 'row'
  },

  stressBox: {
    borderRadius: grid.border,
    width: grid.gutter - grid.border * 2,
    height: grid.gutter - grid.border,
    backgroundColor: 'black',
    border: commonStyleFn.border('transparent'),
    
    ':not(:last-child)': {
      marginRight: grid.border
    }
  },

  stressBox0: {
    borderColor: 'gray'
  },

  stressBox1: {
    borderColor: 'white'
  },

  stressBox2: {
    borderColor: 'white',
    backgroundColor: 'white'
  }
});

const stressBoxStyles = [
  styles.stressBox0,
  styles.stressBox1,
  styles.stressBox2
];
