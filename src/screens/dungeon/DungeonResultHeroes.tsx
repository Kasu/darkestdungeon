import * as React from 'react';
import {Column, commonStyles, Row} from '../../config/styles';
import {Avatar} from '../../ui/Avatar';
import {css} from 'aphrodite';
import {HeroFlag} from '../../ui/HeroFlag';
import {QuirkFaces} from '../../ui/QuirkFaces';
import {Hero} from '../../state/types/Hero';
import {Quest, QuestStatus} from '../../state/types/Quest';
import {Experienced} from '../../state/types/Experienced';
import {Dungeon} from '../../state/types/Dungeon';

export class DungeonResultHeroes extends React.Component<{
  quest: Quest,
  dungeon: Dungeon
}> {
  render () {
    const heroes = [
      ...this.props.quest.party,
      ...this.props.quest.deceased
    ];

    const gainedExperience = this.props.quest.status === QuestStatus.Victory ?
      this.props.dungeon.experienceWorth :
      0;

    return (
      <div>
        {heroes.map((hero) => (
          <HeroResult
            key={hero.id}
            hero={hero}
            exp={hero.projectExperience(gainedExperience)}
          />
        ))}
      </div>
    );
  }
}

class HeroResult extends React.Component<{
  hero: Hero,
  exp: Experienced
}> {
  render () {
    return (
      <Row>
        <Column>
          <div className={css(commonStyles.commonName)}>
            {this.props.hero.name}
            </div>
          <Row>
            <Avatar src={this.props.hero.classInfo.avatarUrl}/>
            <QuirkFaces/>
          </Row>
        </Column>
        {this.props.hero.isAlive ? <HeroFlag hero={this.props.hero} exp={this.props.exp} /> : 'Dead'}
      </Row>
    );
  }
}
