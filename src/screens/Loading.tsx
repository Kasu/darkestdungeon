import * as React from 'react';
import {Path} from '../state/types/Path';
import {observer} from 'mobx-react';
import {Sprite} from '../lib/Sprite';
import {smoke} from '../assets/sprites';
import {css, StyleSheet} from 'aphrodite';
import {AppStateComponent} from '../AppStateComponent';
import {grid} from '../config/Grid';
import {commonColors, commonStyles} from '../config/styles';
import {CommonHeader} from '../ui/CommonHeader';
import {randomizeItem} from '../lib/Helpers';
import {loadingMessages} from '../config/loadingMessages';

@observer
export class Loading extends AppStateComponent<{target: Path}> {
  private allowNavigation: boolean;
  private loadingMessage: string;

  async componentWillMount () {
    this.loadingMessage = randomizeItem(loadingMessages);
    this.allowNavigation = true;

    await preloadAssetsForTarget(this.props.target);

    if (this.allowNavigation && this.props.target) {
      this.appState.router.goto(this.props.target);
    }
  }

  componentWillUnmount () {
    this.allowNavigation = false;
  }

  render () {
    const targetRoute = this.props.target && this.appState.router.getRouteForPath(this.props.target);
    const targetBackgroundUrl = targetRoute && targetRoute.image(this.activeProfile);
    const targetTitle = targetRoute && targetRoute.title(this.activeProfile);

    const dynamicStyle = {
      background: targetBackgroundUrl ? `url(${targetBackgroundUrl})` : undefined
    };

    return (
      <div className={css(styles.container)} style={dynamicStyle}>
        <CommonHeader classStyle={[styles.line, styles.header]} color={commonColors.gray}>
          {targetTitle || 'Loading'}
        </CommonHeader>

        <div className={css(commonStyles.fill)}/>

        <CommonHeader classStyle={[styles.line, styles.footer]} color={commonColors.gray}>
          {this.loadingMessage}
        </CommonHeader>
        <Sprite {...smoke} classStyle={styles.smoke}/>
      </div>
    );
  }
}

function preloadAssetsForTarget (target: Path) {
  // NOTE no preloading being done, just waiting to make loading screen look good
  return new Promise((resolve) => setTimeout(resolve, 4000));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundSize: 'cover',
    backgroundPosition: '50% 50%',
    alignItems: 'center',

    paddingTop: grid.paddingTop + grid.ySpan(1.5),
    paddingRight: grid.paddingRight,
    paddingBottom: grid.paddingBottom + grid.ySpan(0.5),
    paddingLeft: grid.paddingLeft
  },

  line: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: grid.gutter * 2
  },

  header: {
    width: grid.xSpan(4)
  },

  footer: {
    width: grid.xSpan(6),
    whiteSpace: 'pre-wrap'
  },

  smoke: {
    width: grid.ySpan(2),
    height: grid.ySpan(2),
    marginTop: grid.gutter * 2
  }
});
