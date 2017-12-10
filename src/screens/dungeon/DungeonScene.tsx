import * as React from 'react';
import {commonStyleFn, Row} from '../../config/styles';
import {CurioModel} from '../../ui/CurioModel';
import {Hero} from '../../state/types/Hero';
import {observer} from 'mobx-react';
import {Quest} from '../../state/types/Quest';
import {DungeonSelections} from './DungeonSelections';
import {CharacterGroup} from './CharacterGroup';
import {Dungeon} from '../../state/types/Dungeon';
import {computed} from 'mobx';
import {StyleSheet} from 'aphrodite';
import {grid} from '../../config/Grid';

@observer
export class DungeonScene extends React.Component<{
  quest: Quest,
  dungeon: Dungeon,
  selections: DungeonSelections,
  onHeroOverviewRequested: (hero: Hero) => void,
  classStyle?: any
}> {

  @computed get roomImageUrl () {
    const isEntrance = this.props.quest.currentRoom.id === this.props.quest.map.entrance.id;
    return isEntrance && this.props.dungeon.info.entranceImageUrl ||
      this.props.dungeon.info.roomImageUrls[this.props.quest.currentRoom.roomImageIndex];
  }

  render () {
    return (
      <Row
        classStyle={[styles.questRoom, this.props.classStyle]}
        style={{backgroundImage: `url(${this.roomImageUrl})`}}>
        <CharacterGroup
          quest={this.props.quest}
          selections={this.props.selections}
          characters={this.props.quest.party}
          onCharacterRightClick={this.props.onHeroOverviewRequested}
        />

        {this.props.quest.currentRoom.curios.map((curio) =>
          <CurioModel
            key={curio.id}
            curio={curio}
            inventory={this.props.quest.items}
            selections={this.props.selections}
            isInteractionEnabled={!this.props.quest.inBattle}
          />
        )}

        {this.props.quest.inBattle && (
          <CharacterGroup
            quest={this.props.quest}
            selections={this.props.selections}
            characters={this.props.quest.enemies}
            reverse
          />
        )}
      </Row>
    );
  }
}

const styles = StyleSheet.create({
  questRoom: {
    ...commonStyleFn.singleBackground(),
    backgroundSize: 'cover',
    backgroundPosition: '0 100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: grid.ySpan(1)
  }
});
