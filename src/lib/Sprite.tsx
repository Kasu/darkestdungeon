import * as React from "react";
import {observable} from "mobx";
import {observer} from "mobx-react";
import {SpriteInfo} from "../assets/SpriteInfo";
import {Bounds, Size} from "../Bounds";
import {SizeObserver} from "./SizeObserver";
import {css} from "aphrodite";
const {Tween} = require("tween.js");

@observer
export class Sprite extends React.Component<
  SpriteInfo & {
  classStyle?: any,
  style?: any,
  loop?: boolean,
  autoPlay?: boolean,
  debug?: boolean
}> {
  static defaultProps = {
    loop: true,
    autoPlay: true
  };

  private tween: any;
  private isPlaying: boolean;

  @observable private frame = 0;
  @observable private scaledSpriteBounds = new Bounds();

  componentDidMount () {
    if (this.props.autoPlay) {
      this.play();
    }
  }

  componentDidUpdate () {
    // We may need to restart the loop when receiving prop updates
    if (!this.isPlaying && this.props.loop && this.props.autoPlay) {
      this.play();
    }
  }

  componentWillUnmount () {
    this.tween.stop();
  }

  stop () {
    if (this.tween) {
      this.tween.stop();
    }
    this.frame = 0;
  }

  playPart (name: string) {
    return this.play(
      this.props.parts[name][0],
      this.props.parts[name][1]
    );
  }

  play (startFrame: number = 0, endFrame: number = this.props.frames - 1) {
    this.stop();

    return new Promise((resolve) => {
      this.isPlaying = true;
      const duration = (endFrame - startFrame) * 1000 / this.props.fps;
      const obj = {floatingFrame: startFrame};
      this.tween = new Tween(obj)
        .onUpdate(() => this.frame = Math.floor(obj.floatingFrame))
        .onStop(resolve)
        .onComplete(() => { this.onPlayedOnce(); resolve(); })
        .to({floatingFrame: endFrame}, duration)
        .start();
    });
  }

  private updateBounds (size: Size) {
    const container = new Bounds(0, 0, size.width, size.height);
    const spriteAspectRatio = this.props.frameSize.width / this.props.frameSize.height;
    this.scaledSpriteBounds = Bounds.fitRatio(container, spriteAspectRatio);
  }

  private calculateStyle () {
    const sheetSizeScaled = this.scaledSpriteBounds.scale(this.props.columns, this.props.rows);
    const rowIndex = Math.floor(this.frame / this.props.columns) || 0;
    const columnIndex = this.frame % this.props.columns || 0;

    return {
      ...(this.props.debug && {backgroundColor: "rgba(0, 10, 128, 0.63)"}),
      position: "absolute",
      top: this.scaledSpriteBounds.y,
      left: this.scaledSpriteBounds.x,
      width: this.scaledSpriteBounds.width,
      height: this.scaledSpriteBounds.height,
      overflow: "hidden",
      backgroundImage: "url(" + this.props.url + ")",
      backgroundRepeat: "no-repeat",
      backgroundSize: sheetSizeScaled.width + "px " + sheetSizeScaled.height + "px",
      backgroundPositionX: -this.scaledSpriteBounds.width * columnIndex,
      backgroundPositionY: -this.scaledSpriteBounds.height * rowIndex
    } as any;
  }

  render () {
    return (
      <div className={css(this.props.classStyle)} style={{
        ...(this.props.debug && {backgroundColor: "rgba(0, 128, 0, 0.63)"}),
        ...this.props.style
      }}>
        <div style={this.calculateStyle()}>
          {this.props.children}
        </div>
        <SizeObserver onSizeChanged={(size) => this.updateBounds(size)} />
      </div>
    );
  }

  onPlayedOnce () {
    this.isPlaying = false;
    if (this.props.loop) {
      // tween.js does not allow spawning new playbacks from tween callbacks
      requestAnimationFrame(() => this.play());
    }
  }
}
