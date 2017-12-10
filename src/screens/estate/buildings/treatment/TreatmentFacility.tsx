import * as React from 'react';
import {BuildingInfo, BuildingInfoId} from '../../../../state/types/BuildingInfo';
import {count, mapMap} from '../../../../lib/Helpers';
import {CommonHeader} from '../../../../ui/CommonHeader';
import {Column, Row} from '../../../../config/styles';
import {StaticState} from '../../../../state/StaticState';
import {observer} from 'mobx-react';
import {Hero} from '../../../../state/types/Hero';
import {AppStateComponent} from '../../../../AppStateComponent';
import {Alert, Prompt} from '../../../../ui/Popups';
import {BuildingUpgradeEffects} from '../../../../state/types/BuildingUpgradeEffects';
import {QuirkPicker} from './QuirkPicker';
import {TreatmentSlot} from './TreatmentSlot';
import {GoldIcon} from '../../../../ui/GoldIcon';
import {css, StyleSheet} from 'aphrodite';
import {grid} from '../../../../config/Grid';

@observer
export class TreatmentFacility extends AppStateComponent<{
  info: BuildingInfo
}> {
  async promptLockInFor (resident: Hero, buildingInfo: BuildingInfo, residencyEffects: BuildingUpgradeEffects) {
    // If the residency treats quirks/diseases you need to have one selected
    if (residencyEffects.hasTreatments && !resident.residentInfo.treatmentId) {
      this.appState.popups.show(
        <Alert message={`Select ${residencyEffects.treatmentArea} to treat`}/>
      );
      return;
    }

    // Confirm procedure before proceeding
    const cost = this.activeProfile.getResidencyCost(resident.residentInfo);
    const proceed = await this.appState.popups.prompt(
      <Prompt
        query={<Row>Do you wish to pay {<GoldIcon amount={cost}/>} for this residency?</Row>}
      />
    );

    if (proceed) {
      this.activeProfile.purchaseResidency(resident);
      if (buildingInfo.useSound) {
        this.appState.sfx.play(buildingInfo.useSound);
      }
    }
  }

  async promptReleaseFor (resident: Hero) {
    const proceed = await this.appState.popups.prompt(
      <Prompt query="Releasing a resident before treatment has finished won't give you a refund. Proceed?"/>
    );
    if (proceed) {
      resident.leaveResidence();
    }
  }

  componentWillUnmount () {
    this.activeProfile.clearNonLockedResidents();
  }

  canHelp (hero: Hero, treatmentId: BuildingInfoId, residencyEffects: BuildingUpgradeEffects) {
    if (!hero) {
      return true;
    }
    if (!hero.acceptsTreatmentFrom(treatmentId)) {
      return false;
    }
    if (residencyEffects.treatDisease && hero.diseases.length === 0) {
      return false;
    }
    if (residencyEffects.treatFlaw && hero.flaws.length === 0) {
      return false;
    }
    return !residencyEffects.recovery || hero.stats.stress.value > 0;
  }

  render () {
    return (
      <div className={css(styles.treatmentFacilities)}>
        <div>
          {mapMap(this.props.info.children, (info) => {
            const unlockedEffects = this.activeProfile.getUpgradeEffects(info.id);
            const maximumSize = StaticState.instance.getUpgradeEffects([info.id]).size;
            return (
              <Row key={info.id} classStyle={styles.treatmentFacility}>
                <Column classStyle={styles.description}>
                  <CommonHeader label={info.name}/>
                  <p className={css(styles.descriptionText)}>{info.description}</p>
                </Column>
                <Row>
                  {count(maximumSize).map((c, slotIndex) => {
                    const resident = this.activeProfile.findResident(info.id, slotIndex);
                    const slotCost = !unlockedEffects.hasTreatments ? unlockedEffects.cost : (
                      resident && resident.residentInfo.treatmentId ?
                        this.activeProfile.getResidencyCost(resident.residentInfo) :
                        undefined
                    );

                    return (
                      <TreatmentSlot
                        key={slotIndex}
                        buildingInfo={info}
                        goldAvailable={this.activeProfile.gold}
                        goldRequired={slotCost}
                        onRemove={() => resident.leaveResidence()}
                        onInsert={(hero) => hero.enterResidence(info.id, slotIndex)}
                        onLockIn={() => this.promptLockInFor(resident, info, unlockedEffects)}
                        onRelease={() => this.promptReleaseFor(resident)}
                        canHelp={(hero: Hero) => this.canHelp(hero, info.id, unlockedEffects)}
                        resident={resident}
                        isAvailable={slotIndex < unlockedEffects.size}
                      />
                    );
                  })}
                </Row>
              </Row>
            );
          })}
        </div>
        <QuirkPicker profile={this.activeProfile}/>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  treatmentFacilities: {
    marginBottom: grid.gutter
  },

  treatmentFacility: {
    marginBottom: grid.gutter * 2
  },

  description: {
    flex: 1,
    marginRight: grid.gutter
  },

  descriptionText: {
    margin: grid.gutter
  }
});
