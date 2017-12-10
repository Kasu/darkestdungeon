import * as React from 'react';
import {BannerHeader} from '../../ui/BannerHeader';
import {Row} from '../../config/styles';
import {ItemIcon} from '../../ui/ItemIcon';
import {CommonHeader} from '../../ui/CommonHeader';
import {Quest} from '../../state/types/Quest';
import {observer} from 'mobx-react';
import {computed} from 'mobx';
import {Heirlooms} from '../../ui/Heirlooms';
import {countHeirlooms} from '../../state/types/Item';

@observer
export class DungeonResultItems extends React.Component<{
  quest: Quest
}> {
  @computed get totalSellValue () {
    return this.sellables.reduce((sum, item) => sum + item.info.sellValue, 0);
  }

  @computed get sellables () {
    return this.props.quest.items.filter((item) => item.info.isSellable);
  }

  render () {
    return (
      <div>
        <BannerHeader>Quest Rewards</BannerHeader>
        <Row>
          {this.props.quest.rewards.map((item) =>
            <ItemIcon key={item.id} item={item}/>
          )}
        </Row>

        <CommonHeader label="Collected Treasure"/>
        <Row>
          {this.sellables.map((item) => (
            <ItemIcon key={item.id} item={item}/>
          ))}
        </Row>
        <Row>
          Value: {this.totalSellValue}
        </Row>
        <CommonHeader label="Collected Heirlooms"/>
        <Heirlooms counts={countHeirlooms(this.props.quest.items)} showAll/>
      </div>
    );
  }
}
