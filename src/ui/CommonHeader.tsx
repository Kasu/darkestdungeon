import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {commonColors, commonStyleFn} from "../config/styles";
import {VerticalOutlineBox} from "./VerticalOutlineBox";
import {grid} from "../config/Grid";
import Color = require("color");
import {fonts} from "../assets/fonts";

export class CommonHeader extends React.Component<{
  label?: string,
  color?: string,
  classStyle?: any
}> {
  static defaultProps = {
    color: VerticalOutlineBox.defaultProps.color
  };

  render () {
    const darkColor = new Color(this.props.color).darken(0.9).toString();
    return (
      <div className={css(styles.commonHeader, this.props.classStyle)} style={{
        background: commonStyleFn.shineGradient(darkColor)
      }}>
        {this.props.label}
        {this.props.children}
        <VerticalOutlineBox color={this.props.color}/>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  commonHeader: {
    padding: grid.gutter,
    paddingLeft: grid.gutter * 2,
    whiteSpace: "nowrap",
    fontFamily: fonts.Darkest,
    color: commonColors.gold
  }
});
