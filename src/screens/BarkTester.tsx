import * as React from 'react';
import {observer} from 'mobx-react';
import {AppStateComponent} from '../AppStateComponent';
import {BarkTooltip} from '../ui/BarkTooltip';
import {randomizeItem} from '../lib/Helpers';
import {observable} from 'mobx';

@observer
export class BarkTester extends AppStateComponent {
  @observable barkText: string;

  playRandomBark () {
    this.barkText = randomizeItem(this.appState.barker.barks);
  }

  render () {
    return (
      <div>
        <button onClick={() => this.playRandomBark()}>
          Play bark
        </button>
        <div style={{margin: '12% 25%', justifyContent: 'center', alignItems: 'center'}}>
          <BarkTooltip text={this.barkText} />
        </div>
      </div>
    );
  }
}
