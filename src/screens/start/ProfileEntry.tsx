import {css, StyleSheet} from 'aphrodite';
import * as React from 'react';
import {observer} from 'mobx-react';
import {Profile} from '../../state/types/Profile';
import {Icon} from '../../ui/Icon';
import {grid} from '../../config/Grid';
import {commonColors, commonStyleFn, commonStyles, Row} from '../../config/styles';
import {LineButton} from '../../ui/LineButton';
import {InputField} from '../../ui/InputField';
import {fonts} from '../../assets/fonts';
import {AppStateComponent} from '../../AppStateComponent';
import {Difficulty} from '../../state/types/Difficulty';

const difficultyIcons = {
  [Difficulty.Radiant]: require('../../assets/dd/images/modes/radiant/fe_flow/save_icon.png'),
  [Difficulty.Stygian]: require('../../assets/dd/images/modes/new_game_plus/fe_flow/save_icon.png'),
  [Difficulty.Darkest]: require('../../assets/dd/images/modes/base/fe_flow/save_icon.png')
};

const deleteIcon = require('../../assets/dd/images/fe_flow/nukesave_button.png');

@observer
export class ProfileEntry extends AppStateComponent<{
  profile?: Profile,
  onDelete?: () => void,
  onSelect: () => void,
  classStyle?: any
}> {
  private inputField: InputField;

  editName (): Promise<string> {
    return new Promise ((resolve) => {
      const node = this.inputField.node;
      node.focus();
      node.selectionStart = node.value.length;

      const finish = () => {
        node.onblur = null;
        node.onkeydown = null;
        resolve(node.value);
      };

      node.onblur = finish;
      node.onkeydown = (e) => {
        if (e.key === 'Enter') {
          finish();
        }
      };
    });
  }

  private getProfileInfo (profile: Profile) {
    const route = this.appState.router.getRouteForPath(profile.path);
    return [
      route.title(profile),
      'Week ' + profile.week,
      profile.dateOfLastSave.toDateString()
    ];
  }

  render () {
    const isEmptySlot = !this.props.profile;
    const hasProfile = !!this.props.profile;
    const canDelete = hasProfile && this.props.profile.isNameFinalized;
    const isInputFieldDisabled = !hasProfile || this.props.profile.isNameFinalized;

    const infoElements = hasProfile &&
      this.getProfileInfo(this.props.profile).map(
        (str: string, index: number) => (
          <span key={index} className={css(commonStyles.nowrap)}>{str}</span>
        )
      );

    return (
      <Row classStyle={[styles.entry, this.props.classStyle]} valign="center">
        {hasProfile ?
          <Icon classStyle={styles.icons} src={difficultyIcons[this.props.profile.difficulty]}/> :
          <div className={css(styles.icons)}/>
        }

        <LineButton
          textGlow={false}
          defaultColor={commonColors.gray}
          classStyle={styles.selectArea}
          onClick={this.props.onSelect}>
          <InputField
            ref={(field) => this.inputField = field}
            classStyle={styles.inputField}
            defaultValue={isEmptySlot ? '' : this.props.profile.name}
            placeholder="Click to begin..."
            disabled={isInputFieldDisabled}
          />
          <div className={css(styles.infoBox)}>
            {infoElements}
          </div>
        </LineButton>

        {canDelete ?
          <Icon classStyle={styles.icons} src={deleteIcon} onClick={this.props.onDelete}/> :
          <div className={css(styles.icons)}/>
        }
      </Row>
    );
  }
}

export const profileEntryHeight = grid.ySpan(2);
const profileEntryPadding = grid.gutter * 2;
const styles = StyleSheet.create({
  entry: {
    height: profileEntryHeight
  },

  selectArea: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    padding: profileEntryPadding,
    alignItems: 'center',
    background: commonStyleFn.shineGradient('#0d0d0d'),
    boxShadow: commonStyleFn.innerShadow('black', grid.gutter * 2)
  },

  inputField: {
    flex: 1,
    height: 'auto',
    fontFamily: fonts.Darkest,
    fontSize: grid.fontSize(1)
  },

  icons: {
    width: profileEntryHeight / 3,
    height: profileEntryHeight / 3,

    ':last-child': {
      marginRight: profileEntryPadding
    }
  },

  infoBox: {
    width: grid.xSpan(1.5),
    marginLeft: profileEntryPadding,
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
});
