import * as React from 'react';
import {StyleSheet} from 'aphrodite';
import {commonStyleFn} from '../config/styles';
import {grid} from '../config/Grid';
import {Icon} from './Icon';

export class Avatar extends React.Component<{
  src: string,
  classStyle?: any,
  clickSound?: IHowlProperties,
  onClick?: () => void
}> {
  render () {
    return (
      <Icon
        src={this.props.src}
        classStyle={[styles.avatar, this.props.classStyle]}
        clickSound={this.props.clickSound}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </Icon>
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: 'black',
    border: commonStyleFn.border(),
    width: grid.ySpan(1),
    height: grid.ySpan(1),

    // HACK most dd assets have borders already so we zoom in to remove them
    backgroundSize: '120% 120%',
    backgroundPosition: '50% 50%'
  }
});
