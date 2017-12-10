import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {commonStyleFn, commonStyles} from '../config/styles';
import {TooltipArea} from '../lib/TooltipArea';
import {Item} from '../state/types/Item';
import {grid} from '../config/Grid';
import {ItemBreakdown} from './ItemBreakdown';
import {Icon} from './Icon';

export class ItemIcon extends React.Component<{
  item?: Item,
  style?: any,
  classStyle?: any,
  onClick?: () => void,
  onRightClick?: () => void
}> {
  static defaultProps = {
    onClick: (): null => null,
    onRightClick: (): null => null
  };

  render () {
    const item = this.props.item;
    const containerStyle = [styles.icon, this.props.classStyle];

    if (!item) {
      return (
        <div className={css(containerStyle)}/>
      );
    }

    return (
      <Icon
        src={item.info.itemUrl}
        classStyle={containerStyle}
        onClick={this.props.onClick.bind(this)}
        onRightClick={this.props.onRightClick}
      >
        <TooltipArea
          tip={<ItemBreakdown item={item}/>}
          classStyle={commonStyles.dock}
          style={this.props.style}
        >
          {this.props.children}
        </TooltipArea>
      </Icon>
    );
  }
}

export const itemSize = {
  width: grid.xSpan(0.59),
  height: grid.ySpan(2)
};

const styles = StyleSheet.create({
  icon: {
    ...itemSize,
    border: commonStyleFn.border(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backgroundSize: 'auto 120%', // Scale up to remove borders embedded in dd assets
    justifyContent: 'center',
    alignItems: 'center'
  }
});
