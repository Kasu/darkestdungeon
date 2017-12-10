import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {commonColors, commonStyleFn} from '../config/styles';

export class InputField extends React.Component<{
  defaultValue: string,
  placeholder?: string,
  disabled?: boolean,
  classStyle?: any,
  minLength?: number,
  maxLength?: number,
  onChange?: (newValue: string) => void
}> {
  node: HTMLInputElement;

  render () {
    return (
      <div className={css(styles.container, this.props.classStyle)}>
        <div className={css(styles.shine)}>
          <input
            ref={(node) => this.node = node}
            className={css(styles.input, this.props.disabled && styles.disabled)}
            defaultValue={this.props.defaultValue}
            placeholder={this.props.placeholder}
            maxLength={this.props.maxLength}
            minLength={this.props.minLength}
            disabled={this.props.disabled}
            onChange={() => {
              if (this.props.onChange) {
                this.props.onChange(this.node.value);
              }
              return true;
            }}
          />
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    background: 'black',
    border: commonStyleFn.border(commonColors.darkGray),
    boxShadow: commonStyleFn.outerShadow('black', grid.gutter * 2),
    borderRadius: grid.border
  },

  shine: {
    flex: 1,
    background: 'black',
    boxShadow: commonStyleFn.innerShadow(commonColors.gray),
    borderRadius: grid.gutter / 2,
    padding: `${grid.gutter / 2}px ${grid.gutter * 2}px`,
    margin: grid.border * 1.5
  },

  input: {
    flex: 1,
    background: 'transparent',
    fontFamily: 'inherit',
    color: commonColors.gold,
    outline: 'none'
  },

  disabled: {
    pointerEvents: 'none'
  }
});
