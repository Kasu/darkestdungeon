import * as React from "react";
import {css} from "aphrodite";
import {commonColors, commonStyles, Row} from "../config/styles";
import {Avatar} from "./Avatar";
import {StyleSheet} from "aphrodite";
import {grid} from "../config/Grid";
import {VerticalOutlineBox} from "./VerticalOutlineBox";
import {fonts} from "../assets/fonts";

export class LargeHeader extends React.Component<{
  label?: string,
  icon?: string,
  iconChildren?: any,
  onClick?: () => void,
  classStyle?: any
}> {
  render () {
    const icon = this.props.icon && (
      <Avatar src={this.props.icon} classStyle={styles.headerIcon} onClick={this.props.onClick}>
        {this.props.iconChildren}
      </Avatar>
    );
    return (
      <Row valign="center" classStyle={[styles.header, this.props.classStyle]}>
        {icon}
        <h1 className={css(styles.headerLabel, commonStyles.commonName)}>
          {this.props.label}
          {this.props.children}
          <VerticalOutlineBox color={commonColors.gray}/>
        </h1>
      </Row>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    fontSize: grid.fontSize(1),
    fontFamily: fonts.Darkest,
    fontWeight: "normal"
  },

  headerIcon: {
    width: grid.ySpan(2),
    height: grid.ySpan(2),
    justifyContent: "center",
    alignItems: "center"
  },

  headerLabel: {
    marginTop: grid.gutter,
    marginBottom: grid.gutter,
    padding: grid.gutter * 2,
    paddingRight: grid.gutter * 4,
    background: "linear-gradient(to right, #000 0%, #100 75%, rgba(0,0,0,0) 100%)"
  }
});
