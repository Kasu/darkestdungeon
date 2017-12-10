import * as React from 'react';
import {Item} from '../state/types/Item';
import {ItemLevel} from './ItemLevel';
import {StatsTextList} from './StatsText';
import {commonStyles, Row} from '../config/styles';
import {css, StyleSheet} from 'aphrodite';
import {grid} from '../config/Grid';
import {equippableItems} from '../config/general';

export class ItemBreakdown extends React.Component<{
  item: Item
}> {
  render () {
    const item = this.props.item;
    const isEquippable = equippableItems.get(item.info.type) > 0;

    return (
      <div className={css(styles.container)}>
        <Row>
          <div className={css(commonStyles.commonName)}>
            {item.info.name}
          </div>
          {isEquippable && (
            <ItemLevel
              classStyle={styles.level}
              type={item.info.type}
              level={item.level}
            />
          )}
        </Row>

        {item.info.description}

        {isEquippable && (
          <StatsTextList stats={item.stats.nonNeutral}/>
        )}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    maxWidth: grid.xSpan(3),
    minWidth: grid.xSpan(2),
    alignItems: 'center',
    textAlign: 'center'
  },

  level: {
    marginLeft: grid.gutter
  },

  stats: {
    marginTop: grid.gutter
  }
});
