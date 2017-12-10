import * as React from 'react';
import {TooltipArea} from '../../../../lib/TooltipArea';
import {Avatar} from '../../../../ui/Avatar';
import {commonStyleFn, commonStyles} from '../../../../config/styles';
import {css, StyleSheet} from 'aphrodite';
import {Hero} from '../../../../state/types/Hero';
import {DragDropSlot} from '../../../../lib/DragDropSlot';
import {grid} from '../../../../config/Grid';
import {GoldIcon} from '../../../../ui/GoldIcon';
import {BuildingInfo} from '../../../../state/types/BuildingInfo';
import {cancelIconUrl, confirmIconUrl, Icon} from '../../../../ui/Icon';

export class TreatmentSlot extends React.Component<{
  buildingInfo: BuildingInfo,
  goldRequired?: number,
  goldAvailable: number,
  onRemove: () => void,
  onInsert: (hero: Hero) => void,
  canHelp: (hero: Hero) => boolean,
  onLockIn: () => void,
  onRelease: () => void,
  isAvailable: boolean,
  resident?: Hero
}> {
  getSlotProps (residentCandidate: Hero, canDrop: boolean, isOver: boolean) {
    const style: any = {};
    const styleList: any[] = [styles.inner];

    if (!this.props.isAvailable) {
      Object.assign(style, {
        backgroundImage: `url(${this.props.buildingInfo.parent.slotImageUrl})`,
        backgroundSize: '150%',
        backgroundPosition: '50% 80%'
      });
    } else if (!this.props.canHelp(residentCandidate)) {
      styleList.push(styles.rejected);
    } else if (canDrop) {
      styleList.push(
        styles.highlighted,
        isOver && styles.hovered
      );
    }

    return {style, className: css(styleList)};
  }

  render () {
    return (
      <DragDropSlot
        type={Hero}
        item={this.props.resident}
        classStyle={styles.outer}
        onDragEnd={this.props.onRemove}
        onDrop={this.props.onInsert}
        allowDrag={(hero: Hero) => !hero.residentInfo.isLockedIn}
        allowDrop={(hero: Hero) => {
          return !this.props.resident &&
            !(hero.residentInfo && hero.residentInfo.isLockedIn) &&
            this.props.canHelp(hero) &&
            this.props.isAvailable;
        }}>
        {(draggedHero: Hero, isOver, isDragging, canDrag, canDrop) => {
          const canLockIn = this.props.goldRequired !== undefined;
          const showCost = canLockIn && (
            canDrop || (this.props.resident && !this.props.resident.residentInfo.isLockedIn)
          );
          const canAfford = this.props.goldAvailable >= this.props.goldRequired;

          let actionButton;
          let lockedInIcon;
          if (this.props.resident) {
            const info = this.props.resident.residentInfo;
            let actionFn = info.isLockedIn ? this.props.onRelease : this.props.onLockIn;
            let actionTip = info.isLockedIn ? 'Stop Treatment' : 'Start Treatment';
            const actionIconUrl = info.isLockedIn ? cancelIconUrl : confirmIconUrl;
            if (!canAfford && !info.isLockedIn) {
              actionTip = 'Not enough gold';
              actionFn = undefined;
            }

            if (info.isLockedIn) {
              lockedInIcon = (
                <Icon
                  src={this.props.buildingInfo.parent.iconUrl}
                  classStyle={styles.lockedInIcon}
                />
              );
            }

            actionButton = (
              <Icon classStyle={styles.actionButton} src={actionIconUrl} onClick={actionFn}>
                <TooltipArea tip={actionTip} style={commonStyleFn.dock()}/>
              </Icon>
            );

            if (!info.isLockedIn && !canLockIn) {
              actionButton = null;
            }
          }

          return (
            <div {...this.getSlotProps(draggedHero, canDrop, isOver)}>
              {this.props.resident && (
                <Avatar classStyle={commonStyles.fill} src={this.props.resident.classInfo.avatarUrl}/>
              )}
              {lockedInIcon}
              {actionButton}
              {showCost && (
                <GoldIcon
                  classStyle={styles.cost}
                  amount={this.props.goldRequired}
                  compareWith={this.props.goldAvailable}
                />
              )}
            </div>
          );
        }}
      </DragDropSlot>
    );
  }
}

const slotIconUrls = {
  background: require('../../../../assets/dd/images/campaign/town/hero_slot/hero_slot.background.png'),
  highlight: require('../../../../assets/dd/images/campaign/town/hero_slot/hero_slot.backgroundhightlight.png'),
  rejected: require('../../../../assets/dd/images/campaign/town/hero_slot/hero_slot.locked_for_hero.png')
};

const slotSize = grid.ySpan(2);
const styles = StyleSheet.create({
  outer: {
    width: slotSize,
    height: slotSize,

    ':not(last-child)': {
      marginRight: grid.gutter / 2
    }
  },

  inner: {
    flex: 1,
    backgroundImage: `url(${slotIconUrls.background})`,
    ...commonStyleFn.singleBackground()
  },

  rejected: {
    backgroundImage: `url(${slotIconUrls.rejected})`
  },

  highlighted: {
    ':before': {
      content: '" "',
      ...commonStyleFn.dock(),
      ...commonStyleFn.singleBackground(),
      backgroundImage: `url(${slotIconUrls.highlight})`,
      opacity: 0.5
    }
  },

  hovered: {
    ':before': {
      content: '" "',
      ...commonStyleFn.dock(),
      ...commonStyleFn.singleBackground(),
      backgroundImage: `url(${slotIconUrls.highlight})`,
      opacity: 1
    }
  },

  cost: {
    ...commonStyleFn.dock('top'),
    padding: grid.border * 2,
    background: commonStyleFn.gradient('bottom', [
      [0, 'rgba(0, 0, 0, 0.7)'],
      [50, 'rgba(0, 0, 0, 0.7)'],
      [100, 'transparent']
    ])
  },

  lockedInIcon: {
    ...commonStyleFn.dock(),
    width: slotSize,
    height: slotSize,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },

  actionButton: {
    position: 'absolute',
    width: grid.ySpan(1),
    height: grid.ySpan(0.5),
    bottom: -grid.ySpan(0.5),
    left: (slotSize - grid.ySpan(1)) / 2
  }
});
