import * as React from 'react';
import {AppStateComponent} from '../AppStateComponent';
import {TooltipArea, TooltipAreaProps, TooltipSide} from '../lib/TooltipArea';
import {observable, when} from 'mobx';
import {observer} from 'mobx-react';
import {BarkSubscription} from '../state/BarkDistributor';
import {BarkTooltip} from './BarkTooltip';

@observer
export class BarkTooltipArea extends AppStateComponent<
  TooltipAreaProps & {
  subscribe?: boolean
}> {
  static defaultProps = {
    side: TooltipSide.Left,
    subscribe: true
  };

  private resolvePendingBark: () => void;
  @observable private barkText: string;
  private subscription: BarkSubscription;

  componentDidMount () {
    if (this.props.subscribe) {
      this.subscription = this.appState.barker.subscribe(this.receiveBark.bind(this));
    }
  }

  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.resolvePendingBark) {
      this.resolvePendingBark();
    }
  }

  receiveBark (bark: string) {
    return new Promise((resolve) => {
      this.resolvePendingBark = resolve;
      this.barkText = bark;
      when(() => !this.barkText, () => {
        delete this.resolvePendingBark;
        resolve();
      });
    });
  }

  render () {
    const {subscribe, ...rest} = this.props;
    return (
      <TooltipArea
        {...rest}
        show={!!this.barkText && this.appState.barker.isActive}
        wrap={false}
        tip={
          <BarkTooltip
            text={this.barkText}
            onFinished={() => this.barkText = null}
          />
        }>
        {this.props.children}
      </TooltipArea>
    );
  }
}
