import * as React from 'react';
import {TitleHeader} from '../../ui/TitleHeader';
import {profileEntrySpacing, ProfileList, visibleProfileEntries} from './ProfileList';
import {css, StyleSheet} from 'aphrodite';
import {pauseIcon, PauseMenu} from '../../ui/PauseMenu';
import {AppStateComponent} from '../../AppStateComponent';
import {Profile} from '../../state/types/Profile';
import {Icon, IconHighlightType} from '../../ui/Icon';
import {commonColors, commonStyleFn} from '../../config/styles';
import {grid} from '../../config/Grid';
import {InputBinding} from '../../state/InputState';
import {Input} from '../../config/Input';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import {CommonButton} from '../../ui/CommonButton';
import {profileEntryHeight} from './ProfileEntry';

const sounds = {
  profileSelected: {src: require('../../assets/dd/audio/gen_title_startgame.ogg')},
  campaignClicked: {src: require('../../assets/dd/audio/gen_title_campaignbutton.ogg')}
};

@observer
export class Start extends AppStateComponent {
  @observable isContentOffset = false;
  @observable isTransitioned = false;

  transitionOut () {
    this.appState.sfx.play(sounds.profileSelected);
    this.isTransitioned = true;
    // Wait the transition time + linger time to show the logo before changing screen
    return new Promise((resolve) => setTimeout(resolve, contentTransitionTime + 1000));
  }

  goBack () {
    if (this.isTransitioned) {
      this.isTransitioned = false;
    } else if (this.isContentOffset) {
      this.isContentOffset = false;
    } else {
      this.pause();
    }
  }

  pause () {
    this.appState.popups.show({
      id: 'pause',
      content: <PauseMenu mainMenu={false}/>
    });
  }

  render () {
    const iconTransitionStyle = this.isTransitioned && styles.invisible;
    const titleTransitionStyle = this.isTransitioned && styles.titleOffset;
    const contentTransitionStyle = this.isTransitioned && [styles.screenOffset, styles.invisible] ||
      this.isContentOffset && styles.contentOffset;

    return (
      <div className={css(styles.start)}>
        <div className={css(styles.content, contentTransitionStyle)}>
          <div className={css(styles.skybox)}>
            <div className={css(styles.estate)}/>
          </div>
          <div className={css(styles.contentBelow)}>
            <CommonButton
              color={commonColors.gold}
              classStyle={styles.campaignButton}
              label="Campaign"
              clickSound={sounds.campaignClicked}
              onClick={() => this.isContentOffset = true}
            />
            <ProfileList onProfileSelected={(profile) => this.onProfileSelected(profile)}/>
          </div>
        </div>

        <TitleHeader classStyle={[styles.title, titleTransitionStyle]}/>
        <Icon
          src={pauseIcon}
          size={grid.ySpan(1.5)}
          highlight={IconHighlightType.Lines}
          classStyle={[styles.pauseMenuIcon, iconTransitionStyle]}
          onClick={() => this.pause()}
        />

        <InputBinding match={Input.back} callback={() => this.goBack()}/>
      </div>
    );
  }

  async onProfileSelected (profile: Profile) {
    if (!profile.isNameFinalized) {
      return;
    }

    await this.transitionOut();
    this.appState.profiles.setActiveProfile(profile.id);
    this.appState.router.goto(profile.path);
  }
}

const contentTransitionTime = 1000;
const contentBelowHeight = profileEntryHeight * visibleProfileEntries +
  profileEntrySpacing * (visibleProfileEntries - 1);
const contentBelowPadding = grid.ySpan(1);
const contentBelowOffset = contentBelowHeight + contentBelowPadding;

const transitionableStyle = {
  transition: [
    `transform ${contentTransitionTime}ms ease-in-out`,
    `opacity ${contentTransitionTime}ms ease-in-out`
  ].join(',')
};

const styles = StyleSheet.create({
  start: {
    flex: 1
  },

  // Static elements

  title: {
    marginTop: grid.paddingTop,
    ...transitionableStyle
  },

  pauseMenuIcon: {
    position: 'absolute',
    bottom: grid.paddingBottom,
    right: grid.paddingRight,
    ...transitionableStyle
  },

  // Content elements

  content: {
    ...commonStyleFn.dock(),
    ...transitionableStyle
  },

  skybox: {
    backgroundImage: `url(${require('../../assets/dd/images/fe_flow/title_bg.png')})`,
    backgroundSize: 'cover',
    backgroundPosition: '51% 100%',
    backgroundRepeat: 'no-repeat',
    width: grid.outerWidth,
    height: grid.outerHeight,
    justifyContent: 'flex-end'
  },

  estate: {
    backgroundImage: `url(${require('../../assets/dd/images/fe_flow/title_house.png')})`,
    backgroundSize: '100% auto',
    backgroundPosition: '50% 0%',
    backgroundRepeat: 'no-repeat',
    height: grid.ySpan(10)
  },

  contentBelow: {
    backgroundColor: 'black',
    alignItems: 'center',

    height: contentBelowHeight,
    padding: contentBelowPadding,
    paddingTop: 0,

    // HACK avoids red line glitch that probably happens due to scaling and sub pixel rendering
    top: -1,
    marginBottom: -2
  },

  campaignButton: {
    position: 'absolute',
    top: -contentBelowPadding - grid.ySpan(1)
  },

  // Transition values

  contentOffset: {
    transform: `translate(0, -${contentBelowOffset}px)`
  },

  screenOffset: {
    transform: `translate(0, -${grid.outerHeight}px)`
  },

  titleOffset: {
    transform: `translate(0, ${grid.ySpan(6)}px)`
  },

  invisible: {
    opacity: 0
  }
});
