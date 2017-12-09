import * as React from "react";
import {StyleSheet} from "aphrodite";
import {grid} from "../config/Grid";
import {LineButton} from "./LineButton";
import {observable} from "mobx";
import {observer} from "mobx-react";

export enum IconHighlightType {
  Lines,
  Opacity
}

export type IconProps = {
  src?: string,
  highlight?: IconHighlightType,

  size?: number,
  width?: number,
  height?: number,
  scale?: number,

  clickSound?: IHowlProperties,
  classStyle?: any,
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
  onRightClick?: (e: React.MouseEvent<HTMLDivElement>) => void
};

export const confirmIconUrl = require(
  "../assets/dd/images/campaign/town/buildings/hero_activity/hero_activity.confirm_button.png"
);

export const cancelIconUrl = require(
  "../assets/dd/images/campaign/town/buildings/hero_activity/hero_activity.cancel_button.png"
);

@observer
export class Icon extends React.Component<IconProps> {
  static defaultProps = {
    scale: 1,
    highlight: IconHighlightType.Opacity
  };

  hoverState = observable(false);

  render () {
    const customSize = this.props.size !== undefined ? this.props.size : undefined;
    const customWidth = this.props.width !== undefined ? this.props.width : customSize;
    const customHeight = this.props.height !== undefined ? this.props.height : customSize;

    const dynamicIconStyle = {
      backgroundImage: this.props.src ? `url(${this.props.src})` : undefined,
      transform: this.props.scale !== 1 ? `scale(${this.props.scale})` : undefined,
      transformOrigin: "50% 100%",
      width: customWidth,
      height: customHeight
    };

    let hoverLineColor = "transparent";
    switch (this.props.highlight) {
      case IconHighlightType.Lines:
        hoverLineColor = LineButton.defaultProps.hoverColor;
        break;
      case IconHighlightType.Opacity:
        if (this.props.onClick && !this.hoverState.get()) {
          (dynamicIconStyle as any).opacity = 0.6;
        }
        break;
    }

    return (
      <LineButton
        hoverState={this.hoverState}
        outlineScale={1 / this.props.scale}
        hoverColor={hoverLineColor}
        textGlow={false}
        onClick={this.props.onClick}
        onRightClick={this.props.onRightClick}
        clickSound={this.props.clickSound}
        classStyle={[styles.icon, this.props.classStyle]}
        style={dynamicIconStyle}>
        {this.props.children}
      </LineButton>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    backgroundSize: "contain",
    backgroundPosition: "50% 50%",
    backgroundRepeat: "no-repeat",
    width: grid.ySpan(0.5),
    height: grid.ySpan(0.5),
    justifyContent: "center",
    alignItems: "center"
  }
});
