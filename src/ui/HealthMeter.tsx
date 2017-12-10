import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';

export class HealthMeter extends React.Component<{
  percentage: number
}> {
  render () {
    return (
      <div className={css(styles.container)}>
        <div
          className={css(styles.fill)}
          style={{width: (this.props.percentage * 100) + '%'}}
        />
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 8,
    flexDirection: 'row',
    backgroundColor: 'gray'
  },

  fill: {
    height: '100%',
    backgroundColor: 'red'
  }
});
