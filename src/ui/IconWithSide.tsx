import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {Row} from '../config/styles';
import {observer} from 'mobx-react';
import {Icon, IconProps} from './Icon';

@observer
export class IconWithSide extends React.Component<
  IconProps & {
  side: any,
  iconStyle?: any,
  style?: any
}> {
  static defaultProps = Icon.defaultProps;

  render () {
    const {side, iconStyle, classStyle, style, ...rest} = this.props;
    const dynamicStyle = {
      marginLeft: (this.props.scale - 1) * grid.gutter * 4
    };

    return (
      <Row valign="center" classStyle={classStyle} style={style}>
        <Icon classStyle={iconStyle} {...rest}>
          {this.props.children}
        </Icon>
        <div className={css(styles.side)} style={dynamicStyle}>
          {side}
        </div>
      </Row>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center'
  },

  side: {
    marginLeft: grid.gutter / 2,
    justifyContent: 'center'
  }
});
