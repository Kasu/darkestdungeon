import * as React from 'react';
import {StaticState} from '../state/StaticState';
import {Column, commonStyleFn, commonStyles, Row} from '../config/styles';
import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {cap, without} from '../lib/Helpers';
import {ItemInfo} from '../state/types/ItemInfo';
import {AppStateComponent} from '../AppStateComponent';
import {HeirloomIcon} from './HeirloomIcon';
import {StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {Popup} from './Popups';
import {screenFooterHeight} from '../screens/ScreenFooter';
import {confirmIconUrl, Icon} from './Icon';

const iconUrls = {
  up: require('../assets/dd/images/campaign/town/heirloom_exchange/heirloom_exchange.arrow_up.png'),
  down: require('../assets/dd/images/campaign/town/heirloom_exchange/heirloom_exchange.arrow_down.png')
};

const sounds = {
  confirmTrade: {src: require('../assets/dd/audio/ui_town_heirloomconfirm.ogg'), volume: 0.5}
};

@observer
export class HeirloomTrader extends AppStateComponent<{isVisible?: boolean}> {
  heirloomList = StaticState.instance.heirlooms;
  @observable heirloomIndex: number = 0;
  @observable tradeAmount: number = this.minTradableHeirlooms;

  @computed get selectedHeirloom () {
    let normalizedIndex = this.heirloomIndex < 0 ?
      (this.heirloomList.length - this.heirloomIndex) :
      this.heirloomIndex;
    normalizedIndex %= this.heirloomList.length;
    return this.heirloomList[normalizedIndex];
  }

  @computed get maxTradableHeirlooms () {
    return this.activeProfile.heirloomCounts.get(this.selectedHeirloom.heirloomType) || 0;
  }

  get minTradableHeirlooms () {
    return this.maxTradableHeirlooms ? 1 : 0;
  }

  @computed get otherHeirlooms () {
    return without(this.heirloomList, [this.selectedHeirloom]);
  }

  offsetSelectedHeirloom (offset: number) {
    this.heirloomIndex += offset;
    this.refreshTradeAmount();
  }

  tradeSelectedHeirlooms (targetHeirloom: ItemInfo) {
    this.activeProfile.tradeHeirlooms(
      this.tradeAmount, this.selectedHeirloom.heirloomType, targetHeirloom.heirloomType
    );
    this.refreshTradeAmount();
  }

  refreshTradeAmount () {
    this.tradeAmount = cap(this.tradeAmount, this.minTradableHeirlooms, this.maxTradableHeirlooms);
  }

  render () {
    const canIncrease = (this.tradeAmount + 1) <= this.maxTradableHeirlooms;
    const canDecrease = (this.tradeAmount - 1) >= this.minTradableHeirlooms;
    return (
      <Popup classStyle={[styles.container, this.props.isVisible && styles.visible]} sounds={false}>
        <Row>
          <Column align="center" valign="center" style={{flex: 1}}>
            <Icon src={iconUrls.up} onClick={() => this.offsetSelectedHeirloom(1)}/>
            <HeirloomIcon info={this.selectedHeirloom}/>
            <Icon src={iconUrls.down} onClick={() => this.offsetSelectedHeirloom(-1)}/>
          </Column>

          <Column align="center" valign="center" style={{flex: 1}}>
            <Icon src={iconUrls.up} onClick={canIncrease ? () => this.tradeAmount += 1 : undefined}/>
            <span>x{this.tradeAmount}</span>
            <Icon src={iconUrls.down} onClick={canDecrease ? () => this.tradeAmount -= 1 : undefined}/>
          </Column>

          <Column align="flex-end" valign="center" style={{flex: 2}}>
            {this.otherHeirlooms.map((targetHeirloom) => {
              const convertedAmount = this.activeProfile.getConvertedHeirloomValue(
                this.tradeAmount, this.selectedHeirloom.heirloomType, targetHeirloom.heirloomType
              );
              const canTrade = convertedAmount > 0;
              return (
                <Row classStyle={commonStyles.fill} key={targetHeirloom.id} valign="center">
                  <HeirloomIcon info={targetHeirloom} amount={convertedAmount}/>
                  <Icon
                    classStyle={[styles.acceptIcon, canTrade && styles.acceptIconEnabled]}
                    src={confirmIconUrl}
                    clickSound={sounds.confirmTrade}
                    onClick={canTrade ? () => this.tradeSelectedHeirlooms(targetHeirloom) : undefined}
                  />
                </Row>
              );
            })}
          </Column>
        </Row>
      </Popup>
    );
  }
}

const traderHeight = grid.ySpan(2.5);
const acceptHeight = grid.ySpan(0.5);
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: traderHeight,
    minWidth: grid.xSpan(3),
    bottom: screenFooterHeight,
    left: grid.paddingLeft + grid.xSpan(2.5),
    background: commonStyleFn.shineGradient('#220b2e'),
    transform: `translate(0, ${traderHeight}px)`,
    opacity: 0,

    transition: [
      'opacity 0.3s cubic-bezier(0,0,.58,1)',
      'transform 0.3s cubic-bezier(0,0,.58,1)'
    ].join(',')
  },

  visible: {
    opacity: 1,
    transform: 'translate(0, 0)'
  },

  acceptIcon: {
    height: acceptHeight,
    width: acceptHeight * 2,
    backgroundColor: 'green',
    opacity: 0.3,
    marginLeft: grid.gutter
  },

  acceptIconEnabled: {
    opacity: 1
  }
});
