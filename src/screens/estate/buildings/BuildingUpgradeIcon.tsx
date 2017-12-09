import * as React from "react";
import {observer} from "mobx-react";
import {AppStateComponent} from "../../../AppStateComponent";
import {BuildingUpgradeInfo} from "../../../state/types/BuildingUpgradeInfo";
import {BuildingInfo} from "../../../state/types/BuildingInfo";
import {Prompt} from "../../../ui/Popups";
import {Heirlooms} from "../../../ui/Heirlooms";
import {TooltipArea} from "../../../lib/TooltipArea";
import {UpgradeTooltip} from "./UpgradeTooltip";
import {StyleSheet} from "aphrodite";
import {commonStyleFn} from "../../../config/styles";
import {grid} from "../../../config/Grid";
import {Icon} from "../../../ui/Icon";

const upgradePurchaseSound: IHowlProperties = {
  src: require("../../../assets/dd/audio/town_gen_building_upgrade.ogg"),
  volume: 0.5
};

@observer
export class BuildingUpgradeIcon extends AppStateComponent<{
  item: BuildingUpgradeInfo,
  category: BuildingInfo,
  prerequisite?: BuildingUpgradeInfo,
  level: number
}> {
  async promptUnlock () {
    const proceed = await this.appState.popups.prompt(
      <Prompt query={(
        <div>
          Do you wish to purchase this upgrade for <Heirlooms counts={this.props.item.cost}/>?
        </div>
      )}/>
    );

    if (proceed) {
      this.activeProfile.purchaseUpgrade(this.props.item);
      this.appState.sfx.play(upgradePurchaseSound);
    }
  }

  getIconUrl (isUpgraded: boolean, isAvailable: boolean) {
    if (isUpgraded) {
      return upgradeIconUrls.owned;
    }
    if (isAvailable) {
      return upgradeIconUrls.available;
    }
    return upgradeIconUrls.locked;
  }

  render () {
    const {item} = this.props;

    const isUpgraded = this.activeProfile.ownsUpgrade(item);
    const canAfford = this.activeProfile.hasEnoughHeirlooms(item.cost);
    const isAvailable = !this.props.prerequisite || this.activeProfile.ownsUpgrade(this.props.prerequisite);
    const canBuy = canAfford && isAvailable && !isUpgraded;

    const tooltip = (
      <UpgradeTooltip
        cost={<Heirlooms counts={item.cost} compare={this.activeProfile.heirloomCounts}/>}
        isAvailable={isAvailable}
        prerequisiteName={this.props.category.name}
        prerequisiteLevel={this.props.level - 1}
      >
        <pre>{item.description}</pre>
      </UpgradeTooltip>
    );

    return (
      <div>
        <TooltipArea tip={tooltip}>
          <Icon
            classStyle={[styles.step, canBuy && styles.canInteract]}
            src={this.getIconUrl(isUpgraded, isAvailable)}
            onClick={canBuy ? () => this.promptUnlock() : undefined}
          />
        </TooltipArea>
      </div>
    );
  }
}

export const upgradeIconUrls = {
  owned: require("../../../assets/dd/images/campaign/town/buildings/upgrade/requirement_purchased_icon.png"),
  locked: require("../../../assets/dd/images/campaign/town/buildings/upgrade/requirement_locked_icon.png"),
  available: require("../../../assets/dd/images/campaign/town/buildings/upgrade/requirement_purchasable_icon.png")
};

export const stepSize = grid.ySpan(0.75);
const styles = StyleSheet.create({
  step: {
    width: stepSize,
    height: stepSize,
    border: commonStyleFn.outline("black"),
    backgroundSize: "contain",
    backgroundPosition: "50% 50%"
  },

  canInteract: {
    ":hover": {
      boxShadow: commonStyleFn.outerShadow("white")
    }
  }
});
