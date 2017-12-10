import * as React from 'react';
import {StyleSheet} from 'aphrodite';
import {Avatar} from './Avatar';
import {commonColors, commonStyleFn, commonStyles, Row} from '../config/styles';
import {Profile} from '../state/types/Profile';
import {observer} from 'mobx-react';
import {DragDropSlot} from '../lib/DragDropSlot';
import {Hero} from '../state/types/Hero';
import {TooltipArea} from '../lib/TooltipArea';
import {HeroBreakdown} from './HeroBreakdown';
import {grid} from '../config/Grid';
import {rosterEntryAvatarSize} from '../screens/estate/EstateRosterEntry';

@observer
export class LineupDropbox extends React.Component<{
  profile: Profile,
  lock?: boolean
}> {
  render () {
    return (
      <Row classStyle={styles.lineup}>
        {this.props.profile.lineupSlots.map((member, slotIndex) => (
          <LineupDropboxSlot
            key={slotIndex}
            member={member}
            lock={this.props.lock}
            onDragEnd={(draggedHero) => draggedHero.leaveLineup()}
            onDrop={(droppedHero) => this.props.profile.joinLineup(droppedHero, slotIndex)}
          />
        ))}
      </Row>
    );
  }
}

class LineupDropboxSlot extends React.Component<{
  member: Hero,
  lock: boolean,
  onDragEnd: (hero: Hero) => void
  onDrop: (hero: Hero) => void
}> {

  render () {
    const member = this.props.member;
    return (
      <TooltipArea classStyle={styles.slot} tip={member && <HeroBreakdown hero={member}/>}>
        <DragDropSlot
          type={Hero}
          item={member}
          allowDrag={() => !this.props.lock}
          allowDrop={(hero: Hero) => !(hero.residentInfo && hero.residentInfo.isLockedIn)}
          onDragEnd={this.props.onDragEnd}
          onDrop={this.props.onDrop}>
          {member && (
            <Avatar key={member.id} classStyle={commonStyles.fill} src={member.classInfo.avatarUrl}/>
          )}
        </DragDropSlot>
      </TooltipArea>
    );
  }
}

const styles = StyleSheet.create({
  lineup: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-25%, 0)',
    background: 'black',
    border: commonStyleFn.border(commonColors.gold),
    padding: grid.gutter
  },

  slot: {
    width: rosterEntryAvatarSize,
    height: rosterEntryAvatarSize,
    backgroundImage: `url(${require('../assets/dd/images/campaign/town/hero_slot/hero_slot.background.png')})`,
    ...commonStyleFn.singleBackground(),

    ':not(:last-child)': {
      marginRight: grid.gutter
    }
  }
});
