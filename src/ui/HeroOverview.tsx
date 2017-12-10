import * as React from 'react';
import {observer} from 'mobx-react';
import {Popup, PopupProps} from './Popups';
import {css, StyleSheet} from 'aphrodite';
import {Column, commonColors, commonStyleFn, commonStyles, Row} from '../config/styles';
import {QuirkText} from './QuirkText';
import {CommonHeader} from './CommonHeader';
import {PositionDots} from './PositionDots';
import {HeroFlag} from './HeroFlag';
import {CharacterModel} from './CharacterModel';
import {Hero} from '../state/types/Hero';
import {StatsTextList} from './StatsText';
import {Skill} from '../state/types/Skill';
import {heroNameMaxLength, heroNameMinLength, maxSelectedSkills} from '../config/general';
import {EquipmentDropbox} from './EquipmentDropbox';
import {SkillIcon} from './SkillIcon';
import {grid} from '../config/Grid';
import {Icon} from './Icon';
import {fonts} from '../assets/fonts';
import {TooltipArea} from '../lib/TooltipArea';
import {BuildingMessage} from '../screens/estate/buildings/BuildingMessage';
import {InputField} from './InputField';
import {AppStateComponent} from '../AppStateComponent';

const dismissIconUrl = require('../assets/dd/images/shared/character/icon_dismiss.png');

const sounds = {
  equipSkill: {src: require('../assets/dd/audio/ui_town_char_skill_equip.ogg'), volume: 0.6},
  unequipSkill: {src: require('../assets/dd/audio/ui_town_char_skill_unequip.ogg'), volume: 0.6},
  skillLocked: {src: require('../assets/dd/audio/ui_town_button_click_locked.ogg'), volume: 0.6}
};

@observer
export class HeroOverview extends AppStateComponent<
  PopupProps & {
  hero: Hero,
  enableSkillSelection?: () => boolean,
  onDismissRequested?: () => void,
  onSkillSelected?: (skill: Skill) => void,
  classStyle?: any
}> {
  static defaultProps = {
    enableSkillSelection: () => true
  };

  toggleSkillSelection (skill: Skill) {
    if (!this.props.enableSkillSelection()) {
      return;
    }

    if (skill.level === 0) {
      this.appState.sfx.play(sounds.skillLocked);
      return;
    }

    const numSelected = this.props.hero.skills.filter((s) => s.isSelected).length;
    const isSelecting = !skill.isSelected;
    if (isSelecting) {
      if (numSelected < maxSelectedSkills) {
        skill.isSelected = true;
        this.appState.sfx.play(sounds.equipSkill);
      }
    } else {
      skill.isSelected = false;
      this.appState.sfx.play(sounds.unequipSkill);
    }
  }

  render () {
    const {hero, classStyle, ...rest} = this.props;
    const onSkillSelected = this.props.onSkillSelected || this.toggleSkillSelection.bind(this);
    return (
      <Popup {...rest}>
        <div className={css(styles.container, classStyle)}>
          <div className={css(styles.left)}>
            <InputField
              minLength={heroNameMinLength}
              maxLength={heroNameMaxLength}
              placeholder="Hero name"
              defaultValue={hero.name}
              classStyle={styles.name}
              onChange={(newName) => hero.changeName(newName)}>
              {hero.name}
            </InputField>

            <Row classStyle={styles.nameOfClass}>
              {this.props.onDismissRequested && (
                <TooltipArea tip="Dismiss Hero" classStyle={styles.dismissIcon}>
                  <Icon src={dismissIconUrl} onClick={this.props.onDismissRequested}/>
                </TooltipArea>
              )}
              <strong>{hero.level.name} {hero.classInfo.name}</strong>
            </Row>

            <HeroFlag hero={hero}/>

            <CharacterModel
              character={hero}
              classStyle={styles.model}
            />
          </div>

          <Row classStyle={commonStyles.fill}>
            <Column classStyle={styles.leftSections}>
              <Section color={commonColors.lightGray} label="Quirks">
                <Row>
                  <Column>
                    {hero.perks.map((q) => <QuirkText key={q.id} quirk={q}/>)}
                  </Column>
                  <Column classStyle={styles.flaws}>
                    {hero.flaws.map((q) => <QuirkText key={q.id} quirk={q}/>)}
                  </Column>
                </Row>
                {(hero.perks.length === 0 && hero.flaws.length === 0) && (
                  <BuildingMessage style={{margin: grid.ySpan(1)}}>
                    Nothing abnormal
                  </BuildingMessage>
                )}
              </Section>

              <Section color={commonColors.lightGray} label="Base Stats">
                <Row>
                  <Column classStyle={styles.baseStatsLeft}>
                    <StatsTextList stats={hero.stats.base.slice(0, Math.floor(hero.stats.base.length / 2))}/>
                  </Column>
                  <Column>
                    <StatsTextList stats={hero.stats.base.slice(Math.floor(hero.stats.base.length / 2))}/>
                  </Column>
                </Row>
              </Section>

              <Section color={commonColors.lightGray} label="Equipment" darken>
                <EquipmentDropbox character={hero}/>
              </Section>
            </Column>

            <Column classStyle={styles.rightSections}>
              <Section color={commonColors.brightRed} label="Skills">
                <Row classStyle={styles.positions}>
                  <Column classStyle={styles.positionContainer}>
                    <strong>Positions</strong>
                    <PositionDots
                      color={commonColors.gold}
                      classStyle={styles.positionDots}
                      innerValues={PositionDots.getPositionValues(hero.selectedSkills)}
                      outerValues={PositionDots.getSupportValues(hero.selectedSkills)}
                    />
                  </Column>
                  <Column classStyle={styles.positionContainer}>
                    <strong>Targets</strong>
                    <PositionDots
                      color={commonColors.red}
                      classStyle={styles.positionDots}
                      innerValues={PositionDots.getHostileValues(hero.selectedSkills).reverse()}
                    />
                  </Column>
                </Row>
                <Row classStyle={styles.skillIcons}>
                  {hero.skills.map((skill) => (
                    <SkillIcon
                      key={skill.info.id}
                      skill={skill}
                      classStyle={styles.skillIcon}
                      clickSound={null}
                      onClick={onSkillSelected.bind(this, skill)}
                    />
                  ))}
                </Row>
              </Section>

              <Section color={commonColors.brightBlue} label="Resistances">
                <StatsTextList stats={Array.from(hero.stats.resistances.values())}/>
              </Section>

              <Section color={commonColors.brightGreen} label="Diseases" darken>
                {hero.diseases.length > 0 && (
                  <BuildingMessage style={{margin: grid.ySpan(0.75)}}>
                    Still healthy
                  </BuildingMessage>
                )}

                {hero.diseases.map((q) => (
                  <QuirkText key={q.id} quirk={q}/>
                ))}
              </Section>
            </Column>
          </Row>
        </div>
      </Popup>
    );
  }
}

const Section = ({label, color, children}: any) => {
  return (
    <div className={css(styles.section)}>
      <CommonHeader label={label} color={color}/>
      <div className={css(styles.sectionContent)}>
        {children}
      </div>
    </div>
  );
};

const leftWidth = grid.xSpan(2);
const styles = StyleSheet.create({
  container: {
    width: grid.xSpan(12),
    height: grid.ySpan(13),
    padding: `${grid.ySpan(1) + grid.gutter}px ${grid.xSpan(1)}px`,
    paddingBottom: 0,
    paddingLeft: leftWidth,
    backgroundImage: `url(${require('../assets/dd/images/dungeons/town/town.room_wall.start.png')})`,
    ...commonStyleFn.singleBackground()
  },

  left: {
    ...commonStyleFn.dock('left'),
    width: leftWidth,
    alignItems: 'center'
  },

  name: {
    alignSelf: 'flex-start',
    fontSize: grid.fontSize(0.7),
    fontFamily: fonts.Darkest,
    color: commonColors.gold,
    width: grid.xSpan(4)
  },

  nameOfClass: {
    alignSelf: 'flex-start',
    marginTop: grid.gutter,
    marginBottom: grid.gutter * 2
  },

  dismissIcon: {
    marginRight: grid.gutter,
    bottom: -grid.border
  },

  model: {
    position: 'absolute',
    bottom: 0
  },

  leftSections: {
    marginRight: grid.gutter
  },

  rightSections: {
    marginLeft: grid.gutter
  },

  section: {
    flex: 1
  },

  sectionContent: {
    flex: 1,
    padding: `${grid.gutter}px ${grid.gutter * 2}px`
  },

  darken: {
    ':before': {
      ...commonStyleFn.dock(),
      content: '" "',
      background: commonStyleFn.gradient('bottom', [
        [0, 'transparent'],
        [80, 'rgba(0, 0, 0, 0.8)'],
        [100, 'black']
      ])
    }
  },

  flaws: {
    textAlign: 'right'
  },

  baseStatsLeft: {
    marginRight: grid.gutter * 4
  },

  positions: {
    flex: 1
  },

  positionContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  positionDots: {
    margin: grid.gutter
  },

  skillIcons: {
    flex: 1,
    justifyContent: 'center'
  },

  skillIcon: {
    width: grid.ySpan(1),
    height: grid.ySpan(1),
    ':not(:last-child)': {
      marginRight: grid.gutter
    }
  }
});
