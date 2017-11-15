import * as React from "react";
import {EstateTemplate} from "./EstateTemplate";
import {Path} from "./RouterState";
import {Alert, Prompt} from "./Popups";
import {Quest} from "./ProfileState";
import {observer} from "mobx-react";
import {EstateDungeonBreakdown} from "./EstateDungeonBreakdown";
import {QuestBreakdown} from "./QuestBreakdown";
import {PartyDropbox} from "./PartyDropbox";
import {AppStateComponent} from "./AppStateComponent";

@observer
export class EstateDungeons extends AppStateComponent<{path: Path}> {
  groupQuestsByDungeon (quests: Quest[]) {
    return quests.reduce(
      (groups: any, quest) => {
        const list = groups[quest.dungeonId] || (groups[quest.dungeonId] = []);
        list.push(quest);
        return groups;
      },
      {} as {[key: string]: Quest[]}
    );
  }

  checkPartyBeforeContinue () {
    const profile = this.appState.profiles.activeProfile;
    if (profile.party.length === profile.maxPartySize) {
      return Promise.resolve(true);
    }

    if (profile.party.length === 0) {
      return this.appState.popups.prompt(
        <Alert message="Please form a party before embarking"/>
      );
    }

    if (!profile.selectedQuest) {
      return this.appState.popups.prompt(
        <Alert message="Please select a quest before embarking"/>
      );
    }

    return this.appState.popups.prompt(
      <Prompt
        query={"Grave danger awaits the underprepared. " +
        "Do you wish to continue without a full contingent?"}
        yesLabel="Still Embark"
        noLabel="Cancel Embark"
      />
    );
  }

  render () {
    const profile = this.appState.profiles.activeProfile;
    const questLookup = this.groupQuestsByDungeon(profile.quests);
    return (
      <EstateTemplate
        partyFeaturesInRoster={true}
        path={this.props.path}
        backPath="estateOverview"
        continueCheck={() => this.checkPartyBeforeContinue()}
        continueLabel="Provision"
        continuePath="estateProvision">
        {profile.dungeons.map((d) =>
          <EstateDungeonBreakdown
            key={d.id}
            name={d.info.name}
            level={d.level.number}
            progress={d.levelProgress}
            quests={questLookup[d.id]}
            selectedQuestId={profile.selectedQuestId}
            onQuestSelected={(quest) => profile.selectedQuestId = quest.id}
          />
        )}
        {profile.selectedQuest && (
          <QuestBreakdown
            quest={profile.selectedQuest}
          />
        )}
        <PartyDropbox members={profile.party}/>
      </EstateTemplate>
    );
  }
}
