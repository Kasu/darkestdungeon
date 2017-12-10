import * as React from 'react';
import {commonStyles, Row} from '../../../config/styles';
import {css} from 'aphrodite';

export class UpgradeTooltip extends React.Component<{
  cost: any,
  isAvailable: boolean,
  prerequisiteName: string,
  prerequisiteLevel: number
}> {
  render () {
    return (
      <div>
        <Row classStyle={commonStyles.nowrap}>
          <span>Cost: </span>
          {this.props.cost}
        </Row>
        {this.props.children}
        {!this.props.isAvailable && (
          <div className={css(commonStyles.nowrap)}>
            <div className={css(commonStyles.commonName)}>Prerequisites:</div>
            <span className={css(commonStyles.negativeText)}>
              {this.props.prerequisiteName} Level {this.props.prerequisiteLevel}
            </span>
          </div>
        )}
      </div>
    );
  }
}
