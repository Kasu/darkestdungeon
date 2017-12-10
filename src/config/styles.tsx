import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {grid} from './Grid';
import * as Color from 'color';

export const commonColors = {
  bloodRed: '#401312',
  brightRed: 'rgba(246,46,17,1)',
  darkGold: new Color('rgb(200, 180, 110)').darken(0.3).toString(),
  gold: 'rgb(200, 180, 110)',
  brightGold: 'rgb(196, 176, 108)',
  red: 'rgb(177, 25, 0)',
  lightGray: 'rgb(173, 171, 161)',
  gray: '#333',
  darkGray: '#111',
  brightBlue: '#2d5cb0',
  brightGreen: '#389c5d'
};

export const commonStyleFn = {
  singleBackground () {
    return {
      backgroundSize: 'contain',
      backgroundPosition: '50% 50%',
      backgroundRepeat: 'no-repeat'
    };
  },

  boxShadow (inset: boolean = false, color = '#000000', size: number = grid.gutter) {
    const prefix = inset ? 'inset ' : '';
    return prefix + `0 0 ${size}px ${color}`;
  },

  innerShadow (color = '#000000', size: number = grid.gutter) {
    return this.boxShadow(true, color, size);
  },

  outerShadow (color = '#000000', size: number = grid.gutter) {
    return this.boxShadow(false, color, size);
  },

  border (color = '#333', size: number = grid.border) {
    return size + 'px solid ' + color;
  },

  outline (color?: string) {
    return this.border(color, 1);
  },

  textShadow (color = commonColors.gold, size: number = grid.gutter / 2) {
    return `0px 0px ${size}px ${color}`;
  },

  dockWithPadding (xPadding: number, yPadding: number): any {
    return {
      position: 'absolute',
      top: yPadding, right: xPadding, bottom: yPadding, left: xPadding
    };
  },

  dock (side?: string, padding = 0) {
    const style: any = {
      position: 'absolute',
      top: padding, right: padding,
      bottom: padding, left: padding
    };

    switch (side) {
      case 'topLeft':
        delete style.bottom;
        delete style.right;
        break;
      case 'top': delete style.bottom; break;
      case 'topRight':
        delete style.bottom;
        delete style.left;
        break;
      case 'right': delete style.left; break;
      case 'bottomRight':
        delete style.top;
        delete style.left;
        break;
      case 'bottom': delete style.top; break;
      case 'bottomLeft':
        delete style.top;
        delete style.right;
        break;
      case 'left': delete style.right; break;
    }
    return style;
  },

  shineGradient (color = commonColors.brightGold) {
    const parsedColor = new Color(color);
    const sideColor = parsedColor.darken(0.5);
    const t = 'transparent';
    return `linear-gradient(to right, ${t} 0%, ${sideColor} 5%, ${color} 50%, ${sideColor} 95%, ${t} 100%)`;
  },

  gradient (direction: string, steps: Array<[number, string | Color]>) {
    const stepsString = steps.map(([p, color]) => `${color} ${p}%`).join(',');
    return `linear-gradient(to ${direction}, ${stepsString})`;
  }
};

export const customScrollbarSize = grid.gutter + grid.border * 2;
export const commonStyles = StyleSheet.create({
  fill: {
    flex: 1,
    width: 'auto',
    height: 'auto'
  },

  dock: {
    ...commonStyleFn.dock()
  },

  nowrap: {
    whiteSpace: 'nowrap'
  },

  resetFlex: {
    flex: 'inherit'
  },

  commonName: {
    fontWeight: 'bold',
    color: commonColors.gold
  },

  boxBorder: {
    border: commonStyleFn.border()
  },

  positiveText: {
    whiteSpace: 'nowrap',
    color: commonColors.gold
  },

  negativeText: {
    whiteSpace: 'nowrap',
    color: commonColors.red
  },

  row: {
    flexDirection: 'row'
  },

  column: {
    flex: 1,
    flexDirection: 'column'
  },

  customScrollbar: {
    '::-webkit-scrollbar': {
      marginLeft: grid.gutter,
      width: customScrollbarSize,
      backgroundColor: commonColors.darkGray,
      borderLeft: commonStyleFn.border(),
      borderRight: commonStyleFn.border(),
      boxShadow: commonStyleFn.innerShadow(),
      justifyContent: 'center'
    },

    '::-webkit-scrollbar-thumb': {
      width: grid.gutter,
      height: grid.gutter,
      borderRadius: grid.border,
      border: commonStyleFn.border(commonColors.darkGold),
      background: commonStyleFn.shineGradient(commonColors.red),
      boxShadow: [
        commonStyleFn.innerShadow('black', grid.border * 2),
        commonStyleFn.outerShadow('black', grid.border * 2)
      ].join(',')
    }
  }
});

type CellProps = {
  valign?: string,
  align?: string,
  baseClassStyle?: any,
  classStyle?: any,
  children?: any,
  style?: any,
  onClick?: () => void
};

export const Cell = ({baseClassStyle, children, classStyle, ...rest}: CellProps) => {
  return (
    <div className={css(baseClassStyle, classStyle)} {...rest}>
      {children}
    </div>
  );
};

export const Row = (props: CellProps) => {
  const {align, valign, style, ...rest} = props;
  const updatedStyle = {justifyContent: align, alignItems: valign, ...style};
  return <Cell {...rest} baseClassStyle={commonStyles.row} style={updatedStyle}/>;
};

export const Column = (props: CellProps) => {
  const {align, valign, style, ...rest} = props;
  const updatedStyle = {justifyContent: valign, alignItems: align, ...style};
  return <Cell {...rest} baseClassStyle={commonStyles.column} style={updatedStyle}/>;
};
