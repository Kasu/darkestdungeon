import * as React from 'react';
import {Hero} from '../../../state/types/Hero';
import {Column, commonStyleFn, Row} from '../../../config/styles';
import {HeroUpgradeType} from './HeroUpgradeShop';
import {css, StyleSheet} from 'aphrodite';
import {AppStateComponent} from '../../../AppStateComponent';
import {StaticState} from '../../../state/StaticState';
import {BuildingInfo} from '../../../state/types/BuildingInfo';
import {compact, count} from '../../../lib/Helpers';
import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {Skill} from '../../../state/types/Skill';
import {Item} from '../../../state/types/Item';
import {ItemIcon} from '../../../ui/ItemIcon';
import {SkillIcon} from '../../../ui/SkillIcon';
import {BuildingUpgradeEffects} from '../../../state/types/BuildingUpgradeEffects';
import {TooltipArea, TooltipSide} from '../../../lib/TooltipArea';
import {UpgradeTooltip} from './UpgradeTooltip';
import {Prompt} from '../../../ui/Popups';
import {GoldIcon} from '../../../ui/GoldIcon';
import {upgradeIconUrls} from './BuildingUpgradeIcon';
import {grid} from '../../../config/Grid';
import {BuildingMessage} from './BuildingMessage';
import {CommonHeader} from '../../../ui/CommonHeader';

@observer
export class HeroUpgradeGrid extends AppStateComponent<{
  type: HeroUpgradeType,
  info: BuildingInfo,
  hero: Hero
}> {
  @computed get upgradeDescription () {
    switch (this.props.type) {
      case HeroUpgradeType.Equipment:
        return this.props.hero.classInfo.equipmentDescription;
      case HeroUpgradeType.Skills:
        return this.props.hero.classInfo.skillDescription;
    }
  }

  @computed get upgradeTargets (): Array<Item | Skill> {
    switch (this.props.type) {
      case HeroUpgradeType.Equipment:
        return compact([
          this.props.hero.weapon,
          this.props.hero.armor
        ]);
      case HeroUpgradeType.Skills:
        return this.props.hero.skills;
    }
  }

  get buildingInfo () {
    return StaticState.instance.buildingInfoRoot.get(this.props.info.id);
  }

  get buildingEffects () {
    return StaticState.instance.getUpgradeEffects([this.props.info.id]);
  }

  @computed get unlockedEffects () {
    return this.activeProfile.getUpgradeEffects(this.props.info.id);
  }

  get upgrades () {
    const maximumLevel = this.buildingEffects.level;
    return this.upgradeTargets.map((target) =>
      count(maximumLevel).map(() => target)
    );
  }

  async promptPurchaseOf (target: Item | Skill) {
    // Confirm purchase before proceeding
    const proceed = await this.appState.popups.prompt(
      <Prompt query={
        <Row>
          Do you wish to pay <GoldIcon amount={this.unlockedEffects.cost}/> for this upgrade?
        </Row>
      }/>
    );

    if (proceed) {
      if (target instanceof Item) {
        this.activeProfile.purchaseItemLevelUp(target);
      } else {
        this.activeProfile.purchaseSkillLevelUp(target);
      }

      if (this.buildingInfo.useSound) {
        this.appState.sfx.play(this.buildingInfo.useSound);
      }
    }
  }

  render () {
    if (this.upgrades.length === 0 && this.props.type === HeroUpgradeType.Equipment) {
      return (
        <BuildingMessage>
          {this.props.hero.name} has nothing available for upgrade. <br/>
          Equip a weapon or armor to enable upgrades.
        </BuildingMessage>
      );
    }

    return (
      <Row>
        <Column classStyle={styles.description}>
          <CommonHeader label={this.props.hero.classInfo.name}/>
          <p className={css(styles.descriptionText)}>{this.upgradeDescription}</p>
        </Column>
        <Column classStyle={styles.grid}>
          {this.upgrades.map((row, rowIndex) => (
            <Row key={rowIndex} classStyle={styles.row} valign="center">
              {row[0] instanceof Item ?
                <ItemIcon classStyle={styles.skillOrItem} item={row[0] as Item}/> :
                <SkillIcon classStyle={[styles.skillOrItem, styles.skill]} skill={row[0] as Skill}/>}

              {row.map((target, colIndex) => {
                return (
                  <HeroUpgradeCell
                    key={colIndex}
                    thing={target}
                    level={colIndex + 1}
                    buildingInfo={this.buildingInfo}
                    unlockedEffects={this.unlockedEffects}
                    goldAvailable={this.activeProfile.gold}
                    onPurchase={() => this.promptPurchaseOf(target)}
                  />
                );
              })}
            </Row>
          ))}
        </Column>
      </Row>
    );
  }
}

class HeroUpgradeCell extends React.Component<{
  thing: Item | Skill,
  level: number,
  buildingInfo: BuildingInfo,
  unlockedEffects: BuildingUpgradeEffects,
  goldAvailable: number,
  onPurchase: () => void
}> {
  render () {
    const isAvailable = this.props.level <= this.props.unlockedEffects.level;
    const isUpgraded = this.props.thing.level >= this.props.level;
    const canUpgrade = isAvailable && !isUpgraded;
    const canAfford = this.props.goldAvailable >= this.props.unlockedEffects.cost;
    const canPurchase = canUpgrade && canAfford;
    return (
      <TooltipArea
        onClick={canPurchase ? this.props.onPurchase : undefined}
        classStyle={styles.cell}
        side={TooltipSide.Left}
        tip={!isUpgraded && (
          <UpgradeTooltip
            isAvailable={isAvailable}
            cost={<GoldIcon amount={this.props.unlockedEffects.cost} compareWith={this.props.goldAvailable}/>}
            prerequisiteName={this.props.buildingInfo.name}
            prerequisiteLevel={this.props.level - 1}
          />
        )}>
        {this.props.thing instanceof Item ?
          <ItemIcon classStyle={styles.hiddenSkillOrItem} item={this.props.thing.asLevel(this.props.level)}/> :
          <SkillIcon classStyle={styles.hiddenSkillOrItem} skill={this.props.thing.asLevel(this.props.level)}/>}

        {!isAvailable && <div className={css(styles.upgradeOverlay, styles.unavailable)}/>}
        {isUpgraded && <div className={css(styles.upgradeOverlay, styles.upgraded)}/>}
        {canUpgrade && <div className={css([styles.upgradeOverlay, styles.available])}/>}
      </TooltipArea>
    );
  }
}

const upgradeSize = grid.ySpan(0.9);
const styles = StyleSheet.create({
  description: {
    paddingRight: grid.gutter
  },

  descriptionText: {
    margin: grid.gutter
  },

  grid: {
    flex: 'none'
  },

  row: {
    marginBottom: grid.gutter
  },

  cell: {
    width: upgradeSize,
    height: upgradeSize,
    marginRight: grid.gutter,

    ':hover': {
      boxShadow: commonStyleFn.outerShadow('white')
    }
  },

  skill: {
    width: grid.ySpan(1.2),
    height: grid.ySpan(1.2)
  },

  skillOrItem: {
    marginRight: grid.gutter
  },

  // Hidden behind upgrade icons to provide tooltip information
  hiddenSkillOrItem: {
    flex: 1,
    width: 'auto',
    height: 'auto'
  },

  upgradeOverlay: {
    ...commonStyleFn.dock(),
    ...commonStyleFn.singleBackground(),
    pointerEvents: 'none'
  },

  available: {
    backgroundImage: `url(${upgradeIconUrls.available})`
  },

  unavailable: {
    backgroundImage: `url(${upgradeIconUrls.locked})`
  },

  upgraded: {
    backgroundImage: `url(${upgradeIconUrls.owned})`
  }
});
