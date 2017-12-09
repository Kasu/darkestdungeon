import * as React from "react";
import {Heirlooms} from "../../ui/Heirlooms";
import {Row} from "../../config/styles";
import {ScreenFooter} from "../ScreenFooter";
import {StyleSheet} from "aphrodite";
import {HeirloomTrader} from "../../ui/HeirloomTrader";
import {CommonButton, CommonButtonSize} from "../../ui/CommonButton";
import {AppStateComponent} from "../../AppStateComponent";
import {GoldIcon, GoldIconSize} from "../../ui/GoldIcon";
import {grid} from "../../config/Grid";
import {inventoryIcon} from "./EstateInventory";
import {pauseIcon} from "../../ui/PauseMenu";
import {observer} from "mobx-react";
import {IReactionDisposer, observable, reaction} from "mobx";
import {Icon, IconHighlightType} from "../../ui/Icon";
import {TooltipArea} from "../../lib/TooltipArea";
import {randomizeItem} from "../../lib/Helpers";

const sounds = {
  heirloomsChanged: {src: require("../../assets/dd/audio/ui_dun_loot_take_estsatecurrency.ogg"), volume: 0.5},
  goldChanged: [
    {src: require("../../assets/dd/audio/ui_town_coins_ring_08.ogg"), volume: 1},
    {src: require("../../assets/dd/audio/ui_town_coins_ring_04.ogg"), volume: 1},
    {src: require("../../assets/dd/audio/ui_town_coins_sprk_sml_05.ogg"), volume: 1},
    {src: require("../../assets/dd/audio/ui_town_coins_sprk_sml_10.ogg"), volume: 1},
    {src: require("../../assets/dd/audio/ui_town_coins_sprk_sml_08.ogg"), volume: 1}
  ]
};

@observer
export class EstateFooter extends AppStateComponent<{
  continueLabel: string,
  inventory: boolean,
  onInventoryRequested: () => void,
  onContinueRequested: () => void,
  onPauseRequested: () => void
}> {
  private reactionDisposers: IReactionDisposer[];
  @observable private showHeirloomTrader: boolean;

  toggleHeirloomTrader () {
    this.showHeirloomTrader = !this.showHeirloomTrader;
  }

  componentWillMount () {
    this.reactionDisposers = [
      reaction(
        () => this.activeProfile.goldAfterDebt,
        () => this.appState.sfx.play(randomizeItem(sounds.goldChanged))
      ),
      reaction(
        () => Array.from(this.activeProfile.heirloomCounts.values()).reduce((sum, c) => sum + c, 0),
        () => {
          this.appState.sfx.play(sounds.heirloomsChanged);
        }
      )
    ];
  }

  componentWillUnmount () {
    while (this.reactionDisposers.length) {
      this.reactionDisposers.pop()();
    }
  }

  render () {
    return (
      <ScreenFooter behind={<HeirloomTrader isVisible={this.showHeirloomTrader}/>}>
        <Row valign="center" style={{flex: 1}}>
          <GoldIcon
            size={GoldIconSize.Large}
            amount={this.activeProfile.goldAfterDebt}
            classStyle={styles.gold}
          />
          <Heirlooms counts={this.activeProfile.heirloomCounts} showAll/>
          <TooltipArea tip="Trade heirlooms">
            <Icon
              src={require("../../assets/dd/images/campaign/town/heirloom_exchange/he_icon_idle.png")}
              classStyle={styles.swapIcon}
              highlight={IconHighlightType.Lines}
              onClick={() => this.toggleHeirloomTrader()}
            />
          </TooltipArea>
        </Row>

        <CommonButton
          size={CommonButtonSize.Medium}
          label={this.props.continueLabel}
          onClick={this.props.onContinueRequested}
        />

        <Row valign="center" align="flex-end" style={{flex: 1}}>
          {this.props.inventory && (
            <Icon
              src={inventoryIcon}
              scale={2}
              highlight={IconHighlightType.Lines}
              onClick={this.props.onInventoryRequested}
              classStyle={styles.iconOnRight}
            />
          )}
          <Icon
            src={pauseIcon}
            scale={2}
            highlight={IconHighlightType.Lines}
            onClick={this.props.onPauseRequested}
            classStyle={styles.iconOnRight}
          />
        </Row>
      </ScreenFooter>
    );
  }
}

const styles = StyleSheet.create({
  swapIcon: {
    width: grid.ySpan(1),
    height: grid.ySpan(1),
    marginLeft: grid.gutter * 3
  },

  iconOnRight: {
    marginLeft: grid.gutter * 6,
    width: grid.ySpan(0.75),
    height: grid.ySpan(0.75)
  },

  gold: {
    marginRight: grid.xSpan(0.5),
    minWidth: grid.xSpan(2)
  }
});
