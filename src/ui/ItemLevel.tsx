import * as React from "react";
import {StyleSheet} from "aphrodite";
import {ItemType} from "../state/types/ItemInfo";
import {commonColors, commonStyleFn, Row} from "../config/styles";
import {grid} from "../config/Grid";
import {Icon} from "./Icon";

const itemIcons: {[key: string]: string} = {
  [ItemType.Weapon]: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+swordsmans_crest.png"),
  [ItemType.Armor]: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+cadogans_shield.png")
};

export class ItemLevel extends React.Component<{
  type: ItemType,
  level: number,
  classStyle?: any,
  style?: any
}> {
  render () {
    return (
      <Row classStyle={[styles.itemLevel, this.props.classStyle]} style={this.props.style}>
        <Icon classStyle={styles.icon} src={itemIcons[this.props.type]}/>
        <span>{this.props.level}</span>
      </Row>
    );
  }
}

const styles = StyleSheet.create({
  itemLevel: {
    background: "black",
    border: commonStyleFn.border(commonColors.darkGray),
    borderBottom: 0,
    fontSize: grid.fontSize(0.5),
    fontWeight: "bold",
    paddingRight: grid.gutter,
    paddingLeft: grid.gutter
  },

  icon: {
    width: grid.ySpan(0.5),
    height: grid.ySpan(0.5)
  }
});
