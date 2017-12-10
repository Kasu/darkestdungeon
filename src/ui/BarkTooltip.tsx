import {observable} from 'mobx';
import * as React from 'react';
import {observer} from 'mobx-react';
import {StyleSheet} from 'aphrodite';
import {AppStateComponent} from '../AppStateComponent';
import {grid} from '../config/Grid';
import {Tooltip} from './Tooltip';
import {removeItem, wait} from '../lib/Helpers';

// We can track these globally since the audio player is a global system anyway
const tooltipsPlayingLetterSounds: BarkTooltip[] = [];

@observer
export class BarkTooltip extends AppStateComponent<{
  text: string,
  onFinished?: () => void
}> {
  @observable displayedText: string = '';
  originalText: string;
  isBarking: boolean;

  static finishWaitTimePerWord = 250;
  static finishWaitTimeMin = 3000;
  static letterInterval = 70;
  static letterSound = {src: [require('../assets/dd/audio/ui_shr_text_loop.ogg')], volume: 0.4};
  static popupSound = {src: [require('../assets/dd/audio/ui_shr_text_popup.ogg')]};

  componentWillMount () {
    this.bark(this.props.text);
  }

  componentDidUpdate ({text}: {text: string}) {
    if (text !== this.props.text) {
      this.bark(this.props.text);
    }
  }

  componentWillUnmount () {
    removeItem(tooltipsPlayingLetterSounds, this);
    this.isBarking = false;
  }

  private async bark (text: string) {
    if (text === undefined || this.isBarking) {
      return;
    }

    this.originalText = text;
    this.displayedText = '';
    this.isBarking = true;

    const wordCount = text.split(/[\s:,.;]+/).length;
    const readTime = Math.max(BarkTooltip.finishWaitTimePerWord * wordCount, BarkTooltip.finishWaitTimeMin);

    // Keep track of which tooltips are playing letter sounds
    // (This is so we can avoid playing duplicate sounds)
    tooltipsPlayingLetterSounds.push(this);
    this.appState.sfx.play(BarkTooltip.popupSound);
    await this.showNextLetterAndContinue();
    removeItem(tooltipsPlayingLetterSounds, this);

    await wait(readTime);

    this.isBarking = false;
    this.displayedText = '';
    this.originalText = '';

    if (this.props.onFinished) {
      this.props.onFinished();
    }
  }

  private async showNextLetterAndContinue (): Promise<any> {
    await this.showNextLetter();
    const weAreDone = this.originalText === this.displayedText || !this.isBarking;
    return weAreDone ?
      Promise.resolve() :
      this.showNextLetterAndContinue();
  }

  private showNextLetter () {
    // Never play overlapping letter sounds
    const isPrimaryBarker = this === tooltipsPlayingLetterSounds[0];
    if (isPrimaryBarker) {
      requestAnimationFrame(() => this.appState.sfx.play(BarkTooltip.letterSound));
    }

    this.displayedText = this.originalText.slice(0, this.displayedText.length + 1);
    return wait(BarkTooltip.letterInterval);
  }

  render () {
    return (
      <Tooltip classStyle={styles.barkTooltip}>
        {this.displayedText}
      </Tooltip>
    );
  }
}

const styles = StyleSheet.create({
  barkTooltip: {
    flex: 1,
    minWidth: grid.xSpan(2),
    maxWidth: grid.xSpan(3.5),
    padding: grid.ySpan(0.5),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
