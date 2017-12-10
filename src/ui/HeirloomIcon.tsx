import * as React from 'react';
import {ItemInfo} from '../state/types/ItemInfo';
import {IconWithSide} from './IconWithSide';
import {grid} from '../config/Grid';
import {TooltipArea} from '../lib/TooltipArea';

export class HeirloomIcon extends React.Component<{
  info: ItemInfo,
  amount?: number,
  classStyle?: any
}> {
  render () {
    const amountString = this.props.amount !== undefined && (': ' + this.props.amount) + ' ';
    return (
      <TooltipArea
        classStyle={this.props.classStyle}
        tip={`${this.props.info.pluralName}${amountString}(Used to upgrade town buildings)`}>
        <IconWithSide
          src={this.props.info.iconUrl}
          size={grid.ySpan(0.75)}
          side={this.props.amount}
        />
      </TooltipArea>

    );
  }
}
