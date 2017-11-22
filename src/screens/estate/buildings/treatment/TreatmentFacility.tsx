import * as React from "react";
import {BuildingInfo, BuildingInfoId} from "../../../../state/types/BuildingInfo";
import {count, mapMap} from "../../../../lib/Helpers";
import {CommonHeader} from "../../../../ui/CommonHeader";
import {Column, Row} from "../../../../config/styles";
import {StaticState} from "../../../../state/StaticState";
import {observer} from "mobx-react";
import {Hero} from "../../../../state/types/Hero";
import {GoldText} from "../../../../ui/GoldText";
import {AppStateComponent} from "../../../../AppStateComponent";
import {Alert, Prompt} from "../../../../ui/Popups";
import {BuildingUpgradeEffects} from "../../../../state/types/BuildingUpgradeEffects";
import {QuirkPicker} from "./QuirkPicker";
import {TreatmentSlot} from "./TreatmentSlot";

@observer
export class TreatmentFacility extends AppStateComponent<{
  info: BuildingInfo
}> {
  async promptLockInFor (resident: Hero, residencyEffects: BuildingUpgradeEffects) {
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
      <Prompt query={
        <span>
          Do you wish to pay <GoldText amount={cost}/> for this residency?
        </span>
      }/>
    );

    if (proceed) {
      this.activeProfile.purchaseResidency(resident);
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
    if (residencyEffects.treatQuirk && hero.quirks.filter((q) => !q.stats.isPositive).length === 0) {
      return false;
    }
    return !residencyEffects.recovery || hero.stats.stress.value > 0;
  }

  render () {
    return (
      <div>
        <div>
          {mapMap(this.props.info.children, (info) => {
            const unlockedEffects = this.activeProfile.getUpgradeEffects(info.id);
            const maximumSize = StaticState.instance.getUpgradeEffects([info.id]).size;
            return (
              <Row key={info.id}>
                <Column style={{flex: 1}}>
                  <CommonHeader label={info.name}/>
                  <p>{info.description}</p>
                  <p>{unlockedEffects.size} / {maximumSize}</p>
                </Column>
                <Row style={{flex: 3}}>
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
                        goldAvailable={this.activeProfile.gold}
                        goldRequired={slotCost}
                        onRemove={() => resident.leaveResidence()}
                        onInsert={(hero) => hero.enterResidence(info.id, slotIndex)}
                        onLockIn={() => this.promptLockInFor(resident, unlockedEffects)}
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