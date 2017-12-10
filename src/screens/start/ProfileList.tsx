import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {profileEntryHeight, ProfileEntry} from './ProfileEntry';
import {PopupHandle} from '../../state/PopupState';
import {observer} from 'mobx-react';
import {transaction} from 'mobx';
import {Prompt} from '../../ui/Popups';
import {AppStateComponent} from '../../AppStateComponent';
import {Profile, ProfileId} from '../../state/types/Profile';
import {enumMap, mapMap} from '../../lib/Helpers';
import {grid} from '../../config/Grid';
import {commonStyles} from '../../config/styles';
import {Difficulty} from '../../state/types/Difficulty';

@observer
export class ProfileList extends AppStateComponent<{
  onProfileSelected: (profile: Profile) => void
}> {
  private entryMap = new Map<ProfileId, ProfileEntry>();
  private listNode: HTMLUListElement;

  promptDelete (profile: Profile) {
    this.appState.popups.prompt(<DeletePrompt/>)
      .then((isAccepted) => {
        if (isAccepted) {
          this.appState.profiles.deleteProfile(profile.id);
        }
      });
  }

  promptCreate () {
    this.appState.popups.prompt(<CreatePrompt/>)
      .then((difficulty?: Difficulty) => {
        if (difficulty === undefined) {
          return;
        }

        const profile = this.appState.profiles.createProfile(difficulty);

        // Scroll to bottom
        this.listNode.scrollTop = this.listNode.scrollHeight;

        // Start editing name of new entry
        requestAnimationFrame(() => {
          this.entryMap.get(profile.id).editName()
            .then((newName) => {
              transaction(() => {
                profile.name = newName;
                profile.isNameFinalized = true;
              });
            });
        });
      });
  }

  render () {
    const entries = [];
    for (const profile of this.appState.profiles.map.values()) {
      entries.push(
        <ProfileEntry
          ref={(entry) => this.entryMap.set(profile.id, entry)}
          key={'profile-' + profile.id}
          profile={profile}
          classStyle={styles.entry}
          onSelect={() => this.props.onProfileSelected(profile)}
          onDelete={() => this.promptDelete(profile)}
        />
      );
    }

    entries.push(
      <ProfileEntry key="create" onSelect={() => this.promptCreate()}/>
    );

    return (
      <ul ref={(node) => this.listNode = node}
          className={css(styles.list, commonStyles.customScrollbar)}>
        {entries}
      </ul>
    );
  }
}

class DeletePrompt extends React.Component<{handle?: PopupHandle}> {
  render () {
    return (
      <Prompt
        handle={this.props.handle}
        query="Are you sure you want to delete this save file?"
        responses={[
          {label: 'Yes', value: true},
          {label: 'No', value: false}
        ]}
      />
    );
  }
}

class CreatePrompt extends React.Component<{handle?: PopupHandle}> {
  render () {
    const responses = mapMap(enumMap<Difficulty>(Difficulty), (difficulty, name) => {
      return {
        label: name,
        value: difficulty
      };
    });

    return (
      <Prompt
        closeable
        handle={this.props.handle}
        query="Select campaign"
        responses={responses}
      />
    );
  }
}

export const profileEntrySpacing = grid.gutter;
export const visibleProfileEntries = 3;
const styles = StyleSheet.create({
  list: {
    width: grid.vw(50),
    height: profileEntryHeight * visibleProfileEntries + profileEntrySpacing * 2,
    overflowY: 'scroll',
    marginTop: grid.border
  },

  entry: {
    ':not(:last-child)': {
      marginBottom: profileEntrySpacing
    }
  }
});
