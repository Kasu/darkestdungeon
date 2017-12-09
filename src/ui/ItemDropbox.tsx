import * as React from "react";
import {ItemIcon, itemSize} from "./ItemIcon";
import {observer} from "mobx-react";
import {DragDropSlot} from "../lib/DragDropSlot";
import {Item} from "../state/types/Item";
import {contains, count, removeItem} from "../lib/Helpers";
import {grid} from "../config/Grid";
import {css, StyleSheet} from "aphrodite";
import {commonColors, commonStyleFn, commonStyles, customScrollbarSize} from "../config/styles";
import {IArraySplice} from "mobx";
import {AppStateComponent} from "../AppStateComponent";
import {ItemType} from "../state/types/ItemInfo";
import {ObservableArray} from "mobx/lib/types/observablearray";

const itemSounds: {[key: string]: IHowlProperties} = {
  [ItemType.Heirloom]: {src: require("../assets/dd/audio/ui_dun_loot_take_heirloom.ogg"), volume: 0.2},
  [ItemType.Treasure]: {src: require("../assets/dd/audio/ui_dun_loot_take_jewelry.ogg"), volume: 0.2},
  [ItemType.Consumable]: {src: require("../assets/dd/audio/ui_dun_loot_take_provisions.ogg"), volume: 0.2},
  [ItemType.Armor]: {src: require("../assets/dd/audio/ui_dun_loot_take_all.ogg"), volume: 0.4},
  [ItemType.Weapon]: {src: require("../assets/dd/audio/ui_dun_loot_take_all.ogg"), volume: 0.4},
  [ItemType.Trinket]: {src: require("../assets/dd/audio/ui_dun_trink_equip.ogg"), volume: 0.4}
};

@observer
export class ItemDropbox extends AppStateComponent<{
  items: Item[],
  extraComponent?: React.SFC<{item: Item}> | React.ComponentClass<{item: Item}>,

  acceptFrom?: Item[],
  filter?: (item: Item) => boolean,
  canInteractWith?: (item: Item) => boolean,
  allowDrop?: (item: Item) => boolean,
  compare?: (a: Item, b: Item) => number,
  slots?: number,

  onItemClick?: (item: Item) => void
  onItemRightClick?: (item: Item) => void,
  classStyle?: any
}> {
  static defaultProps = {
    filter: () => true,
    allowDrop: () => true,
    canInteractWith: () => true,
    onItemClick: (): null => null,
    onItemRightClick: (): null => null
  };

  private reactionDisposers: Array<() => void>;

  componentWillMount () {
    this.reactionDisposers = [
      // Play item sound effects as they're added
      (this.props.items as any as ObservableArray<Item>).observe(
        (change: IArraySplice<Item>) => {
          // Determine which items to play (we won't play the same sfx twice)
          const soundsToPlay = change.added.reduce((dict, item) => {
            const sound = itemSounds[item.info.type];
            if (sound) {
              dict[item.info.type] = sound;
            }
            return dict;
          }, {} as {[key: string]: IHowlProperties});

          for (const sound of Object.values(soundsToPlay)) {
            this.appState.sfx.play(sound);
          }
        }
      )
    ];
  }

  componentWillUnmount () {
    while (this.reactionDisposers.length) {
      this.reactionDisposers.pop()();
    }
  }

  releaseItem (item: Item, monitor: any) {
    if (monitor.didDrop()) {
      removeItem(this.props.items, item);
    }
  }

  receiveItem (item: Item) {
    this.props.items.push(item);
  }

  allowDrop (item: Item) {
    return this.props.filter(item) &&
      (!this.props.acceptFrom || contains(this.props.acceptFrom, item)) &&
      this.props.allowDrop(item);
  }

  stackItems (items: Item[]) {
    const rest: Item[][] = [];
    const dict = items.reduce((stacks, item) => {
      if (item.info.isStackable) {
        const itemList = stacks.get(item.info.id) || [];
        stacks.set(item.info.id, itemList);
        itemList.push(item);
      } else {
        rest.push([item]);
      }
      return stacks;
    }, new Map<string, Item[]>());

    return Array.from(dict.values()).concat(rest);
  }

  render () {
    let stacks = this.stackItems(
      this.props.items.filter(this.props.filter)
    );

    if (this.props.compare) {
      stacks = stacks.sort((stackA, stackB) => {
        return this.props.compare(stackA[0], stackB[0]);
      });
    }

    // If no free slots are specified we'll add one row
    const freeSlots = this.props.slots !== undefined ?
      Math.max(0, this.props.slots - stacks.length) :
      Math.ceil((stacks.length + 1) / maxItemsInRow) * maxItemsInRow - stacks.length;

    count(freeSlots).forEach(() => stacks.push(null));

    return (
      <div className={css(styles.dropbox, commonStyles.customScrollbar, this.props.classStyle)}>
        {stacks.map((stack, index) => {
          const item = stack && stack[0];
          return (
            <DragDropSlot
              key={item ? item.id : ("slot" + index)}
              classStyle={styles.slot}
              type={Item}
              allowDrag={this.props.canInteractWith}
              allowDrop={this.allowDrop.bind(this)}
              onDragEnd={this.releaseItem.bind(this)}
              onDrop={this.receiveItem.bind(this)}
              item={item}>
              <ItemIcon
                item={item}
                onClick={this.onItemClick.bind(this, item)}
                onRightClick={this.onItemRightClick.bind(this, item)}
                classStyle={item && !this.props.canInteractWith(item) && styles.lockedItem}>
                {stack && stack.length > 1 && (
                  <div className={css(styles.stackSize)}>
                    {stack.length}
                  </div>
                )}
              </ItemIcon>
              {this.props.extraComponent && (
                React.createElement(this.props.extraComponent, {item})
              )}
            </DragDropSlot>
          );
        })}
      </div>
    );
  }

  onItemClick (item: Item) {
    if (item && this.props.canInteractWith(item)) {
      this.props.onItemClick(item);
    }
  }

  onItemRightClick (item: Item) {
    if (item && this.props.canInteractWith(item)) {
      this.props.onItemRightClick(item);
    }
  }
}

const itemMargin = grid.gutter / 2;
const maxItemsInRow = 9;
const styles = StyleSheet.create({
  dropbox: {
    flexWrap: "wrap",
    flexDirection: "row",
    maxWidth: (itemSize.width + (itemMargin * 2)) * maxItemsInRow + customScrollbarSize,
    overflowY: "scroll",
    overflowX: "hidden"
  },

  slot: {
    flex: "auto",
    margin: itemMargin
  },

  stackSize: {
    ...commonStyleFn.dock("topLeft"),
    color: commonColors.gold,
    fontWeight: "bold",
    marginTop: grid.gutter / 2,
    marginLeft: grid.gutter / 2
  },

  lockedItem: {
    opacity: 0.5
  }
});
