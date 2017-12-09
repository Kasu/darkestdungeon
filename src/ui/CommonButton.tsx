import * as React from "react";
import {StyleSheet} from "aphrodite";
import {fonts} from "../assets/fonts";
import {grid} from "../config/Grid";
import {commonColors} from "../config/styles";
import {LineButton} from "./LineButton";

export enum CommonButtonSize {
  Medium
}

export class CommonButton extends React.Component<{
  label?: string,
  size?: CommonButtonSize,
  color?: string,
  style?: any,
  clickSound?: IHowlProperties,
  classStyle?: any,
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}> {
  static defaultProps = {
    size: CommonButtonSize.Medium,
    color: commonColors.brightRed
  };

  render () {
    const gridRows = sizeToGridRows[this.props.size];
    const gridColumns = sizeToGridColumns[this.props.size];
    const dynamicStyle = {
      fontSize: grid.fontSize(gridRows),
      height: grid.ySpan(gridRows),
      minWidth: grid.xSpan(gridColumns),
      color: this.props.color,
      ...this.props.style
    };

    return (
      <LineButton
        defaultColor={this.props.color}
        hoverColor={this.props.color}
        textGlow={false}
        clickSound={this.props.clickSound}
        classStyle={[styles.commonButton, this.props.classStyle]}
        style={dynamicStyle}
        onClick={this.props.onClick}>
        {this.props.label}
        {this.props.children}
      </LineButton>
    );
  }
}

const sizeToGridRows: {[key: string]: number} = {
  [CommonButtonSize.Medium]: 1
};

const sizeToGridColumns: {[key: string]: number} = {
  [CommonButtonSize.Medium]: 3
};

const styles = StyleSheet.create({
  commonButton: {
    fontFamily: fonts.Darkest,
    color: commonColors.red,
    paddingLeft: grid.gutter,
    paddingRight: grid.gutter,
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 20%,rgba(0,0,0,1) 80%,rgba(0,0,0,0) 100%)",

    ":not(:hover)": {
      opacity: 0.6
    }
  }
});
