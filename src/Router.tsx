import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {observer} from 'mobx-react';
import {TransitionGroup} from 'react-transition-group';
import Transition from 'react-transition-group/Transition';
import {RouterState} from './state/RouterState';

const transitionDuration = 500;

@observer
export class Router extends React.Component<{router: RouterState}> {
  render () {
    const router = this.props.router;
    const content = React.createElement(router.route.root.component, {
      path: router.route.root.path,
      route: router.route.root,
      ...router.path.args
    });

    return (
      <div className={css(styles.container)}>
        <TransitionGroup className={css(styles.transitionGroup)}>
          {[
            <Screen key={router.path.root}>
              {content}
            </Screen>
          ]}
        </TransitionGroup>
      </div>
    );
  }
}

const Screen = ({children, ...props}: any) => (
  <Transition {...props} timeout={transitionDuration}>
    {(state: string) => (
      <div className={css(styles.screen)}
           style={{opacity: screenStates[state] || 0}}>
        {children}
      </div>
    )}
  </Transition>
);

const screenStates: {[key: string]: number} = {
  entering: 0,
  entered: 1
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  transitionGroup: {
    flex: 1,
    position: 'relative'
  },

  screen: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    transition: `opacity ${transitionDuration}ms ease-in-out`
  }
});
