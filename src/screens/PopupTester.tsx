import * as React from 'react';
import {PopupAlign, PopupContent, ModalState} from '../state/PopupState';
import {TooltipArea, TooltipSide} from '../lib/TooltipArea';
import {css, StyleSheet} from 'aphrodite';
import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {Popup, Prompt} from '../ui/Popups';
import {AppStateComponent} from '../AppStateComponent';
import {enumMap, mapMap} from '../lib/Helpers';
import {commonStyleFn, commonStyles, Row} from '../config/styles';

@observer
export class PopupTester extends AppStateComponent {
  @observable popupQueue: Array<[PopupContent, PopupAlign, ModalState]> = [];

  renderPlacementButtons (modalState: ModalState) {
    return mapMap(enumMap<PopupAlign>(PopupAlign), (align, name) => (
      <button key={name} onClick={
        (e: any) => {
          e.stopPropagation();
          this.push(
            <Popup closeable><pre>{JSON.stringify({align, modalState}, null, 2)}</pre></Popup>,
            align,
            modalState
          );
        }
      }>
        {name}
      </button>
    ));
  }

  render () {
    const tooltipAreas = mapMap(enumMap<TooltipSide>(TooltipSide), (side, name) => (
      <TooltipArea
        key={name}
        classStyle={styles.tooltipAreas}
        side={side}
        tip={<Tip/>}>
        {name}
      </TooltipArea>
    ));

    return (
      <div className={css(styles.fill)} onClick={(e) => this.pop(e)}>
        <Row>
          <TooltipArea
            side={TooltipSide.Right}
            show={this.popupQueue.length > 0}
            tip="Click to place popup. Ctrl+click for default position.">
            Modal Popups
          </TooltipArea>
          <div className={css(commonStyles.fill)}/>
        </Row>
        <br/>
        <Row>
          <span>Align: </span>
          {this.renderPlacementButtons(ModalState.Modal)}
        </Row>
        <br/>

        <h1>Modal Popups (dismissable)</h1>
        <br/>
        <Row>
          <span>Align: </span>
          {this.renderPlacementButtons(ModalState.ModalDismiss)}
        </Row>
        <br/>

        <h1>Opaque Popups</h1>
        <br/>
        <Row>
          <span>Align: </span>
          {this.renderPlacementButtons(ModalState.Opaque)}
        </Row>
        <br/>

        <h1>Tooltips</h1>
        <br/>
        <Row>
          {tooltipAreas}
        </Row>
        <br/>

        <button onClick={() => this.prompt()}>Prompt</button>
      </div>
    );
  }

  async prompt () {
    const popups = this.appState.popups;
    const answer = await popups.prompt(<Prompt query="Do you?"/>);
    popups.show(<Popup>You chose: {JSON.stringify(answer)}</Popup>);
  }

  push<P> (content: PopupContent<P>, align: PopupAlign, modalState: ModalState) {
    this.popupQueue.push([content, align, modalState]);
  }

  pop (e: React.MouseEvent<HTMLDivElement>) {
    if (this.popupQueue.length > 0) {
      const [content, align, modalState] = this.popupQueue.shift();
      const position = !e.ctrlKey ?
        this.appState.bounds.transformClientPoint(e.clientX, e.clientY) :
        undefined;

      this.appState.popups.show({content, align, position, modalState});
    }
  }
}

@observer
class Tip extends React.Component {
  private intervalId: any;
  @observable private size = 0;

  @computed get messages () {
    const rows = [];
    for (let i = 0; i < this.size; i += 1) {
      let str = '';
      for (let n = 0; n < this.size; n += 1) {
        str += 'W';
      }
      rows.push(str);
    }
    return rows;
  }

  componentWillMount () {
    this.intervalId = setInterval(() => this.size += 1, 150);
  }

  componentWillUnmount () {
    clearInterval(this.intervalId);
  }

  render () {
    return (
      <div className={css(styles.tip)}>
        {this.messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#999'
  },

  tip: {
    maxWidth: 300,
    maxHeight: 300,
    overflow: 'hidden'
  },

  anything: {
    border: commonStyleFn.border('green'),
    backgroundColor: 'black',
    color: 'white',
    padding: 10
  },

  tooltipAreas: {
    marginLeft: '20px'
  }
});
