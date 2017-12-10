import * as React from 'react';
import {equippableItems, maxEquippedItems} from '../config/general';
import {ItemDropbox} from './ItemDropbox';
import {Character} from '../state/types/Character';
import {itemSize} from './ItemIcon';
import {grid} from '../config/Grid';
import {StyleSheet} from 'aphrodite';

export class EquipmentDropbox extends React.Component<{
  character: Character
}> {
  render () {
    return (
      <ItemDropbox
        classStyle={styles.equipmentDropbox}
        slots={maxEquippedItems}
        items={this.props.character.items}
        filter={(item) => !!equippableItems.get(item.info.type)}
        allowDrop={(droppedItem) => {
          const itemCount = this.props.character.items.filter(
            (heroItem) => heroItem.info.type === droppedItem.info.type
          ).length;
          return (itemCount + 1) <= equippableItems.get(droppedItem.info.type);
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  equipmentDropbox: {
    width: maxEquippedItems * itemSize.width + grid.gutter * (maxEquippedItems - 1),
    flexWrap: 'nowrap'
  }
});
