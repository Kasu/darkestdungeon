import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {AppStateComponent} from '../AppStateComponent';
import {Curio} from '../state/types/Curio';
import {Alert, Prompt} from './Popups';
import {ItemDropbox} from './ItemDropbox';
import {Item} from '../state/types/Item';
import {moveItem} from '../lib/Helpers';
import {DungeonSelections} from '../screens/dungeon/DungeonSelections';
import {StatsTextList} from './StatsText';
import {QuirkText} from './QuirkText';
import {commonStyleFn, Row} from '../config/styles';
import {computed, when} from 'mobx';
import {observer} from 'mobx-react';
import {ModalState} from '../state/PopupState';

@observer
export class CurioModel extends AppStateComponent<{
  curio: Curio,
  inventory: Item[],
  selections: DungeonSelections,
  isInteractionEnabled: boolean
}> {
  async interactWith () {
    const curio = this.props.curio;
    const hero = this.props.selections.hero;

    if (curio.items.length) {
      const stopWatchingItems = when(
        () => curio.items.length === 0,
        () => curio.hasBeenInteractedWith = true
      );

      const takeAll = await this.appState.popups.prompt({
        id: 'curio' + curio.id,
        modalState: ModalState.Opaque,
        content: (
          <Prompt query="You've found treasure!" yesLabel="Take all" noLabel="Leave">
            <ItemDropbox items={curio.items}/>
          </Prompt>
        )
      });

      if (takeAll) {
        while (curio.items.length) {
          moveItem(curio.items[0], curio.items, this.props.inventory);
        }
      }

      stopWatchingItems();
    }

    if (curio.buff) {
      this.props.selections.hero.applyBuff(curio.buff, 'Curio');
      await this.appState.popups.prompt({
        id: 'curio' + curio.id,
        content: (
          <Alert message={hero.name + ' received new buff'}>
            <StatsTextList stats={curio.buff.nonNeutral}/>
          </Alert>
        )
      });
      curio.hasBeenInteractedWith = true;
    }

    if (curio.replaceQuirk) {
      const {replacedQuirk, newQuirk} = hero.replaceQuirk();
      await this.appState.popups.prompt({
        id: 'curio' + curio.id,
        content: (
          <Alert message={hero.name + ' received new quirk'}>
            <Row>
              <QuirkText quirk={newQuirk}/>
              {replacedQuirk && (
                <Row>
                  <span>replaced</span>
                  <QuirkText quirk={replacedQuirk}/>
                </Row>
              )}
            </Row>
          </Alert>
        )
      });
      curio.hasBeenInteractedWith = true;
    }
  }

  @computed get allowInteraction () {
    return !this.props.curio.hasBeenInteractedWith && this.props.isInteractionEnabled;
  }

  render () {
    return (
      <div
        className={css(styles.model)}
        onClick={this.allowInteraction ? this.interactWith.bind(this) : undefined}>
        <div>Curio</div>
        {this.props.curio.hasBeenInteractedWith && (
          <div>X</div>
        )}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  model: {
    background: 'purple',
    padding: 3,
    margin: 3,
    border: commonStyleFn.border()
  }
});
