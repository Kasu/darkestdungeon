import * as React from "react";
import {Column, commonColors, commonStyleFn, Row} from "../../../config/styles";
import {BannerHeader} from "../../../ui/BannerHeader";
import {AppStateComponent} from "../../../AppStateComponent";
import {findSubset} from "../../../lib/Helpers";
import {BuildingInfo} from "../../../state/types/BuildingInfo";
import {BuildingUpgradeCategory} from "./BuildingUpgradeCategory";
import {css, StyleSheet} from "aphrodite";
import {grid} from "../../../config/Grid";
import Color = require("color");
import {fonts} from "../../../assets/fonts";
import {HorizontalDivider} from "../../../ui/HorizontalDivider";

export class BuildingUpgradeShop extends AppStateComponent<{
  upgrades: BuildingInfo
}> {
  render () {
    const categories: any[] = [];
    let index = 0;
    const lastIndex = this.props.upgrades.children.size - 1;
    this.props.upgrades.children.forEach((category) => {
      categories.push(
        <BuildingUpgradeCategory key={category.key} category={category}/>
      );
      if (index++ !== lastIndex) {
        categories.push(
          <HorizontalDivider key={"divider" + index}/>
        );
      }
    });

    const shopUpgrades = this.props.upgrades.getItemsFlattened();
    const ownedUpgrades = findSubset(shopUpgrades, this.activeProfile.buildingUpgrades);
    const unlockProgress = ownedUpgrades.length / shopUpgrades.length;

    return (
      <div className={css(styles.upgradeShop)}>
        <Row>
          <Column classStyle={styles.description}>
            {this.props.upgrades.description}
          </Column>
          <Column classStyle={styles.upgradePercentageContainer}>
            <BannerHeader>
              <div>Upgraded:</div>
              <div className={css(styles.upgradePercentage)}>
                {Math.round(unlockProgress * 100)}%
              </div>
            </BannerHeader>
          </Column>
        </Row>
        {categories}
      </div>
    );
  }
}

const rightBorderSize = grid.border * 2;
const styles = StyleSheet.create({
  upgradeShop: {
    flex: 1,
    padding: grid.gutter * 2,
    background: "rgba(0, 0, 0, 0.8)",
    marginRight: grid.gutter,
    paddingRight: grid.gutter * 2 + rightBorderSize,
    paddingLeft: grid.gutter,

    ":after": {
      ...commonStyleFn.dock("right"),
      content: "' '",
      width: rightBorderSize,
      borderRadius: grid.border,
      background: commonStyleFn.gradient("bottom", [
        [0, commonColors.gold],
        [25, new Color(commonColors.gold).darken(0.5)],
        [100, "transparent"]
      ])
    }
  },

  description: {
    flex: 2,
    paddingRight: grid.xSpan(0.5)
  },

  upgradePercentageContainer: {
    flex: 1
  },

  upgradePercentage: {
    fontSize: grid.fontSize(1),
    fontFamily: fonts.Darkest,
    marginTop: grid.gutter
  }
});
