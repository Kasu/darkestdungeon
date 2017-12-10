import * as React from 'react';
import {observer} from 'mobx-react';
import {css, StyleSheet} from 'aphrodite';
import {commonStyles, Row} from '../config/styles';
import {Hero} from '../state/types/Hero';
import {QuirkText} from './QuirkText';

@observer
export class HeroBreakdown extends React.Component<{hero: Hero}> {
  render () {
    const c = this.props.hero;

    const afflictionItem = c.affliction && (
      <Row classStyle={commonStyles.negativeText}>
        <span>Affliction:</span>
        <QuirkText quirk={c.affliction}/>
      </Row>
    );

    const experience = c.level.isMax ? 'MAX' : (
      <span>
        {c.relativeExperience}/{c.level.next.relativeExperience}
      </span>
    );

    return (
      <ul className={css(styles.container)}>
        <li>{c.classInfo.name} (Level {c.level.number})</li>
        <Row>Resolve XP: {experience}</Row>
        {afflictionItem}
        <li>Stress {c.stats.stress.value}/{c.stats.maxStress.value}</li>
      </ul>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 200
  }
});
