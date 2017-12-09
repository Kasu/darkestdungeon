import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {Column, commonStyleFn, Row} from "../../../config/styles";
import {observable} from "mobx";
import {observer} from "mobx-react";
import {BuildingUpgradeShop} from "./BuildingUpgradeShop";
import {BuildingInfo} from "../../../state/types/BuildingInfo";
import {grid} from "../../../config/Grid";
import {LargeHeader} from "../../../ui/LargeHeader";
import {Icon} from "../../../ui/Icon";
import {AppStateComponent} from "../../../AppStateComponent";
import {BarkTooltipArea} from "../../../ui/BarkTooltipArea";
import {TooltipSide} from "../../../lib/TooltipArea";
import {randomizeItem} from "../../../lib/Helpers";

const moreInfoIconUrl = require("../../../assets/dd/images/shared/progression/more_info_icon.png");
const lessInfoIconUrl = require("../../../assets/dd/images/shared/progression/less_info_icon.png");
const npcBarkWaitTime = 1000;

@observer
export class BuildingOverview extends AppStateComponent<{
  info: BuildingInfo,
  classStyle?: any,
  coverupRight?: boolean,
  coverupTop?: boolean
}> {
  static defaultProps = {
    coverupRight: true,
    coverupTop: true
  };

  private npcBarker: BarkTooltipArea;
  private npcBarkTimeoutId: any;
  @observable areUpgradesVisible = false;

  componentWillMount () {
    if (this.props.info.enterSound) {
      this.appState.sfx.play(this.props.info.enterSound);
    }
  }

  componentDidMount () {
    this.npcBarkTimeoutId = setTimeout(() => this.makeNpcBark(), npcBarkWaitTime);
  }

  componentWillUnmount () {
    clearTimeout(this.npcBarkTimeoutId);
  }

  makeNpcBark () {
    if (this.npcBarker) {
      this.npcBarker.receiveBark(randomizeItem(this.props.info.npcBarks));
    }
  }

  render () {
    const areUpgradesEnabled = this.props.info.children.size > 0;
    const shouldRenderUpgrades = areUpgradesEnabled && this.areUpgradesVisible;
    const upgradeIconUrl = this.areUpgradesVisible ? lessInfoIconUrl : moreInfoIconUrl;
    const showNpcBark = this.props.info.npcImageUrl && this.props.info.npcBarks.length > 0;

    return (
      <Row
        classStyle={[styles.container, this.props.classStyle]}
        style={{backgroundImage: `url(${this.props.info.backgroundUrl})`}}>

        <div className={css(this.props.coverupRight ? styles.coverupRight : styles.coverupRightSmall)}/>
        {this.props.coverupTop && <div className={css(styles.coverupTop)}/>}

        <Column>
          {this.props.info.npcImageUrl && (
            <div
              onClick={() => this.makeNpcBark()}
              className={css(styles.npc)}
              style={{backgroundImage: `url(${this.props.info.npcImageUrl})`}}
            >
              {showNpcBark && (
                <BarkTooltipArea
                  ref={(npcBarker) => this.npcBarker = npcBarker}
                  classStyle={styles.npcBarker}
                  side={TooltipSide.Below}
                  subscribe={false}
                />
              )}
            </div>
          )}
          <LargeHeader
            label={this.props.info.name}
            icon={this.props.info.avatarUrl}
            iconChildren={areUpgradesEnabled && (<Icon src={upgradeIconUrl} classStyle={styles.upgradeIcon}/>)}
            onClick={areUpgradesEnabled ? () => this.areUpgradesVisible = !this.areUpgradesVisible : undefined}
          />
          {shouldRenderUpgrades && <BuildingUpgradeShop upgrades={this.props.info} />}
        </Column>

        <Column classStyle={styles.content}>
          {this.props.children}
        </Column>
      </Row>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundSize: "cover",
    backgroundPosition: "50% 50%",
    width: grid.xSpan(12),
    height: grid.ySpan(13)
  },

  coverupRight: {
    ...commonStyleFn.dock(),
    background: commonStyleFn.gradient("right", [
      [0, "transparent"],
      [30, "transparent"],
      [45, "black"],
      [100, "black"]
    ])
  },

  coverupRightSmall: {
    ...commonStyleFn.dock(),
    background: commonStyleFn.gradient("right", [
      [85, "transparent"],
      [100, "black"]
    ])
  },

  coverupTop: {
    ...commonStyleFn.dock(),
    background: commonStyleFn.gradient("bottom", [
      [0, "black"],
      [20, "black"],
      [30, "transparent"]
    ])
  },

  npc: {
    ...commonStyleFn.dock(),
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "50% 100%",
    marginRight: -grid.xSpan(1),
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  npcBarker: {
    width: grid.ySpan(2),
    height: grid.ySpan(2)
  },

  upgradeIcon: {
    width: grid.ySpan(1),
    height: grid.ySpan(1)
  },

  upgradeSignClose: {
    backgroundColor: "red"
  },

  upgradeSignShow: {
    backgroundColor: "green"
  },

  content: {
    padding: `${grid.ySpan(1) + grid.gutter}px ${grid.xSpan(1)}px`,
    paddingLeft: 0
  }
});
