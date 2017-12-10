import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {action, computed, IReactionDisposer, observable, reaction} from 'mobx';
import {Tooltip} from '../ui/Tooltip';
import {BoundsObserver} from './BoundsObserver';
import {css} from 'aphrodite';
import {AppStateComponent} from '../AppStateComponent';
import {Bounds, Point, Size} from '../Bounds';
import {grid} from '../config/Grid';
import {observer} from 'mobx-react';
import {SizeObserver} from './SizeObserver';
import {commonStyles} from '../config/styles';
import {StyleSheet} from 'aphrodite';
import {Layer} from '../ui/Layer';

export enum TooltipSide {
  Above,
  Right,
  Below,
  Left
}

export type TooltipAreaProps = {
  tip?: any,
  side?: TooltipSide,
  classStyle?: any,
  onClick?: () => void,
  style?: any,
  show?: boolean,
  wrap?: boolean
};

/**
 * Opens a tooltip next to the area.
 * - Triggered when the mouse hovers the area
 * - Or manually by calling show/hide
 *
 * NOTE: Manually showing a tooltip disables mouse
 * triggers until you manually hide it again.
 */
@observer
export class TooltipArea extends AppStateComponent<TooltipAreaProps> {
  static defaultProps = {
    side: TooltipSide.Below,
    wrap: true
  };

  private stopWatchingVisibility: IReactionDisposer;
  private tooltipState = new TooltipState();
  private boundsObserver = new BoundsObserver(this.appState);
  private node: HTMLDivElement;
  @observable private isHovered = false;

  componentDidMount () {
    this.tooltipState.setDesiredSide(this.props.side);

    this.stopWatchingVisibility = reaction(
      () => this.shouldRenderTooltip,
      (shouldObserve) => {
        if (shouldObserve) {
          this.boundsObserver.observe(this.node, (bounds: Bounds) => this.tooltipState.setAreaBounds(bounds));
        } else if (this.boundsObserver.isObserving) {
          this.boundsObserver.stopObserving();
          this.tooltipState.resetBounds();
        }
      },
      true
    );
  }

  componentWillUpdate () {
    this.tooltipState.setDesiredSide(this.props.side);
  }

  componentWillUnmount () {
    this.boundsObserver.stopObserving();
    this.stopWatchingVisibility();
  }

  @computed get shouldRenderTooltip () {
    return !!(this.props.tip && (
      this.props.show !== undefined ? this.props.show : this.isHovered
    ));
  }

  wrap (tip: any) {
    if (this.props.wrap) {
      tip = (
        <StyledTooltip>
          {tip}
        </StyledTooltip>
      );
    }

    return (
      <PositionedTooltip state={this.tooltipState}>
        {tip}
      </PositionedTooltip>
    );
  }

  render () {
    const tip = this.shouldRenderTooltip ?
      this.wrap(this.props.tip) :
      undefined;

    return (
      <div
        ref={(node) => this.node = node}
        className={css(this.props.classStyle)}
        style={this.props.style}
        onClick={this.props.onClick}
        onMouseEnter={() => this.isHovered = true}
        onMouseLeave={() => this.isHovered = false}>

        {this.props.children}

        {tip && (
          ReactDOM.createPortal(tip, this.appState.portalNode)
        )}
      </div>
    );
  }
}

class TooltipState {
  @observable private areaBounds: Bounds = null;
  @observable private tooltipSize: Size = null;
  @observable private desiredSide: TooltipSide = TooltipSide.Below;

  @computed get hasBounds () {
    return this.areaBounds && this.tooltipSize;
  }

  @computed get adjustedSide () {
    const offset = this.getOffset(this.desiredSide);
    const projectedBounds = new Bounds(
      this.areaBounds.x + offset.x,
      this.areaBounds.y + offset.y,
      this.tooltipSize.width,
      this.tooltipSize.height
    );

    if (projectedBounds.left < 0) {
      return TooltipSide.Right;
    } if (projectedBounds.right > grid.outerWidth) {
      return TooltipSide.Left;
    } if (projectedBounds.top < 0) {
      return TooltipSide.Below;
    } if (projectedBounds.bottom > grid.outerHeight) {
      return TooltipSide.Above;
    }
    return this.desiredSide;
  }

  @computed get offset () {
    return this.getOffset(this.adjustedSide);
  }

  @computed get position () {
    const {x, y} = this.offset;
    return {
      x: this.areaBounds.x + x,
      y: this.areaBounds.y + y
    };
  }

  @action
  resetBounds () {
    this.areaBounds = null;
    this.tooltipSize = null;
  }

  @action
  setTooltipSize (size: Size) {
    this.tooltipSize = size;
  }

  @action
  setAreaBounds (bounds: Bounds) {
    this.areaBounds = bounds;
  }

  @action
  setDesiredSide (side: TooltipSide) {
    this.desiredSide = side;
  }

  getOffset (side: TooltipSide): Point {
    switch (side) {
      case TooltipSide.Above:
        return {
          y: -this.tooltipSize.height,
          x: (this.areaBounds.width - this.tooltipSize.width) / 2
        };
      case TooltipSide.Right:
        return {
          x: this.areaBounds.width,
          y: (this.areaBounds.height - this.tooltipSize.height) / 2
        };
      case TooltipSide.Below:
        return {
          y: this.areaBounds.height,
          x: (this.areaBounds.width - this.tooltipSize.width) / 2
        };
      case TooltipSide.Left:
        return {
          x: -this.tooltipSize.width,
          y: (this.areaBounds.height - this.tooltipSize.height) / 2
        };
    }
  }
}

@observer
class PositionedTooltip extends React.Component<{state: TooltipState}> {
  @computed get style () {
    if (!this.props.state.hasBounds) {
      return {opacity: 0};
    }

    const {x, y} = this.props.state.position;
    return {
      left: x,
      top: y
    };
  }

  render () {
    return (
      <div className={css(styles.tooltip)} style={this.style}>
        <SizeObserver onSizeChanged={(size) => this.props.state.setTooltipSize(size)}/>
        {this.props.children}
      </div>
    );
  }
}

const StyledTooltip = ({children}: any) => {
  if (typeof children === 'string') {
    children = <span className={css(commonStyles.nowrap)}>{children}</span>;
  }

  return <Tooltip>{children}</Tooltip>;
};

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: Layer.Tooltips
  }
});
