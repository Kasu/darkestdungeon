import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {observer} from 'mobx-react';
import {grid} from './config/Grid';
import {count} from './lib/Helpers';
import {Column, Row} from './config/styles';
import {Layer} from './ui/Layer';

@observer
export class GridOverlay extends React.Component {
  render () {
    return (
      <div className={css(styles.gridOverlay)}>
        <div className={css(styles.grid)}>
          {count(grid.rows).map((rowNumber) => (
            <Row key={rowNumber} classStyle={styles.row}>
              {count(grid.columns).map((columnNumber) => (
                <Column key={columnNumber} classStyle={styles.cell}/>
              ))}
            </Row>
          ))}
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  gridOverlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,

    paddingTop: grid.paddingTop,
    paddingRight: grid.paddingRight,
    paddingBottom: grid.paddingBottom,
    paddingLeft: grid.paddingLeft,

    opacity: 0.4,
    background: 'red',
    zIndex: Layer.GridOverlay,
    pointerEvents: 'none'
  },

  clipper: {
    overflow: 'hidden',
    flex: 1
  },

  grid: {
    background: 'blue',
    width: grid.width,
    height: grid.height
  },

  row: {
    ':not(:last-child)': {
      marginBottom: grid.gutterHeight
    }
  },

  cell: {
    width: grid.columnWidth,
    height: grid.rowHeight,
    background: 'green',
    ':not(:last-child)': {
      marginRight: grid.gutterWidth
    }
  }
});
