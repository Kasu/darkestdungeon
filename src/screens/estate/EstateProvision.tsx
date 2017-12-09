import * as React from "react";
import {EstateTemplate} from "./EstateTemplate";
import {Path} from "../../state/types/Path";
import {Popup, popupOffset, Prompt} from "../../ui/Popups";
import {BuildingOverview} from "./buildings/BuildingOverview";
import {StyleSheet} from "aphrodite";
import {LineupDropbox} from "../../ui/LineupDropbox";
import {observer} from "mobx-react";
import {Store} from "./Store";
import {AppStateComponent} from "../../AppStateComponent";
import {Item} from "../../state/types/Item";
import {QuestStatus} from "../../state/types/Quest";
import {StaticState} from "../../state/StaticState";
import {recommendedFoodCount} from "../../config/general";

@observer
export class EstateProvision extends AppStateComponent<{path: Path}> {
  private store: Store;
  private initialStoreItems: Item[] = this.activeProfile.getStoreItems();

  checkItemsBeforeContinue () {
    const foodInCart = this.store.cart.filter((i) => i.info.id === "Food");
    if (foodInCart.length < recommendedFoodCount) {
      return this.appState.popups.prompt(
        <Prompt
          query={"You haven't purchased much food for your expedition. " +
          `It's recommended to take at least ${recommendedFoodCount} food for this quest. Still Embark?`}
        />
      ).then((proceed) => {
        if (proceed) {
          this.startQuest();
        }
        return proceed;
      });
    }

    return Promise.resolve(true);
  }

  startQuest () {
    this.store.purchase();
    this.selectedQuest.status = QuestStatus.Started;
    this.activeProfile.sendLineupOnQuest(this.selectedQuest);
  }

  render () {
    return (
      <EstateTemplate
        background={require("../../assets/dd/images/campaign/town/provision/provision.background.png")}
        path={this.props.path}
        backPath="estateDungeons"
        roster={false}
        inventory={false}
        continueCheck={() => this.checkItemsBeforeContinue()}
        continueSound={{src: require("../../assets/dd/audio/ui_town_button_setoff.ogg"), volume: 0.7}}
        continueLabel="Embark"
        continuePath="dungeonOverview">
        <Popup classStyle={styles.fakePopup} sounds={false}>
          <BuildingOverview info={StaticState.instance.buildings.get("provision")}>
            <Store
              ref={(store) => this.store = store}
              initialStoreItems={this.initialStoreItems}
              profile={this.activeProfile}
            />
          </BuildingOverview>
        </Popup>
        <LineupDropbox profile={this.activeProfile} lock/>
      </EstateTemplate>
    );
  }
}

const styles = StyleSheet.create({
  fakePopup: {
    marginTop: -popupOffset,
    marginLeft: -popupOffset
  }
});
