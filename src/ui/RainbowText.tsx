import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {Row} from '../config/styles';

export class RainbowText extends React.Component<{
  children: string
}> {
  render () {
    const letters = Array.from(this.props.children);
    return (
      <Row classStyle={styles.rainbowText}>
        {letters.map((letter, index) => {
          const delay = (index / (letters.length - 1)) * revolutionTime;
          return (
            <span
              key={index}
              className={css(styles.rainbowLetter)}
              style={{animationDelay: delay + 's'}}
            >
              {letter === ' ' ? '\u00a0' : letter}
            </span>
          );
        })}
      </Row>
    );
  }
}

const rainbowColors = [
  '#ff2400', '#e81d1d', '#e8b71d', '#e3e81d', '#1de840',
  '#1ddde8', '#2b1de8', '#dd00f3'
];

const rainbowKeyframes = rainbowColors.reduce(
  (keyframes, color, index) => {
    const percentage = (index / (rainbowColors.length - 1)) * 100;
    const yOffset = Math.sin(percentage) * 12;
    keyframes[Math.round(percentage) + '%'] = {
      color,
      transform: `translateY(${yOffset}%)`
    };

    return keyframes;
  },
  {} as any
);

const revolutionTime = 1;
const styles = StyleSheet.create({
  rainbowText: {
  },

  rainbowLetter: {
    animationName: [rainbowKeyframes],
    animationDuration: revolutionTime + 's',
    animationIterationCount: 'infinite'
  }
});
