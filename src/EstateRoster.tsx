import * as React from "react";
import {AppState} from "./AppState";
import {css, StyleSheet} from "aphrodite";
import {EstateRosterEntry} from "./EstateRosterEntry";
import {Character} from "./ProfileState";
import {observer} from "mobx-react";
import {SortOptions} from "./SortOptions";
import {CharacterInfo} from "./CharacterInfo";
import {ModalState, PopupAlign} from "./PopupState";

@observer
export class EstateRoster extends React.Component<{state: AppState}> {
  showCharacterInfo (character: Character) {
    this.props.state.popups.show({
      align: PopupAlign.TopLeft,
      position: {x: 50, y: 50},
      modalState: ModalState.Opaque,
      group: "characterInfo",
      content: (
        <CharacterInfo
          profile={this.props.state.profiles.activeProfile}
          character={character}
        />
      )
    });
  }

  render () {
    const profile = this.props.state.profiles.activeProfile;
    const characters = profile.characters;
    const sortedCharacters = characters.slice().sort(Character.comparers.rosterIndex);
    return (
      <div className={css(styles.roster)}>
        <div className={css(styles.header)}>
          <span>
            {profile.characters.length} / {profile.rosterSize}
          </span>
          <SortOptions
            comparers={Character.visibleComparers}
            onChange={(fn) => profile.sortCharacters(fn)}
          />
        </div>
        <ul>
          {sortedCharacters.map((character) => (
            <EstateRosterEntry
              key={character.id}
              character={character}
              onSelect={() => this.showCharacterInfo(character)}
            />
          ))}
        </ul>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  roster: {
    position: "absolute",
    top: 0, right: 0
  },

  header: {
    flexDirection: "row",
    alignItems: "center"
  }
});