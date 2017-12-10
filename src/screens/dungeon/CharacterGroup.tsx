import {observer} from 'mobx-react';
import * as React from 'react';
import {Quest} from '../../state/types/Quest';
import {Character} from '../../state/types/Character';
import {DungeonSelections} from './DungeonSelections';
import {Hero} from '../../state/types/Hero';
import {Row} from '../../config/styles';
import {contains} from '../../lib/Helpers';
import {CharacterModel} from '../../ui/CharacterModel';

@observer
export class CharacterGroup extends React.Component<{
  quest: Quest,
  characters: Character[],
  selections: DungeonSelections,
  reverse?: boolean,
  onCharacterRightClick?: (c: Character) => void
}> {
  static defaultProps = {
    onCharacterRightClick: (): null => null
  };

  render () {
    const quest = this.props.quest;
    const selections = this.props.selections;
    const visibleCharacterOrder = this.props.reverse ?
      this.props.characters.slice().reverse() :
      this.props.characters;

    return (
      <Row>
        {visibleCharacterOrder.map((character) => {
          const highlight = quest.inBattle ?
            character === quest.turnActor :
            character === selections.hero;

          let onClick: () => void;
          let onMouseEnter: () => void;
          let onMouseLeave: () => void;
          let target: boolean;

          if (quest.inBattle) {
            if (quest.canHeroAct && selections.skill) {
              const targetCharacters = selections.skill.info.target.select(quest.allies, quest.enemies);
              target = contains(targetCharacters, character);
              if (target) {
                onClick = () => quest.performTurnAction(selections.skill, [character]);
              }
            }
          } else if (character instanceof Hero) {
            onClick = () => selections.selectHero(character);
          }

          if (!(character instanceof Hero)) {
            onMouseEnter = () => selections.selectEnemy(character);
            onMouseLeave = () => selections.selectEnemy(null);
          }

          return (
            <CharacterModel
              onClick={onClick}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onRightClick={this.props.onCharacterRightClick.bind(this, character)}
              key={character.id}
              character={character}
              highlight={highlight}
              target={target}>
              {quest.getActorIndex(character)}
            </CharacterModel>
          );
        })}
      </Row>
    );
  }
}
