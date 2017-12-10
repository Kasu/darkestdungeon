import {randomizeItem, wait} from '../lib/Helpers';
import {TokenOwner} from './TokenOwner';
import {action, observable} from 'mobx';

export type BarkCallback = (bark: string) => Promise<any>;

export class BarkDistributor {
  @observable public isActive: boolean;
  private subscriptions: BarkSubscription[] = [];
  private tokens = new TokenOwner();

  public barks: string[] = [];

  constructor (
    public timeoutMin: number = 5 * 1000,
    public timeoutMax: number = 60 * 2 * 1000
  ) {}

  subscribe (callback: BarkCallback) {
    const sub = new BarkSubscription(this, callback);
    this.subscriptions.push(sub);
    return sub;
  }

  unsubscribe (sub: BarkSubscription) {
    const index = this.subscriptions.indexOf(sub);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
    }
  }

  @action
  start () {
    if (this.isActive) {
      return;
    }
    this.isActive = true;
    this.nextBark();
  }

  @action
  stop () {
    this.isActive = false;
  }

  private async nextBark () {
    if (this.tokens.lent.length > 0) {
      return;
    }

    const timeout = this.timeoutMin + (this.timeoutMax - this.timeoutMin) * Math.random();

    let token = this.tokens.borrow();
    await wait(timeout);
    token.return();

    if (!this.isActive) {
      return;
    }

    const sub = randomizeItem(this.subscriptions);
    const bark = randomizeItem(this.barks);

    if (sub && bark) {
      token = this.tokens.borrow();
      await sub.callback(bark);
      token.return();
    }

    if (this.isActive) {
      this.nextBark();
    }
  }
}

export class BarkSubscription {
  constructor (
    private distributor: BarkDistributor,
    public callback: BarkCallback
  ) {}

  unsubscribe () {
    this.distributor.unsubscribe(this);
  }
}
