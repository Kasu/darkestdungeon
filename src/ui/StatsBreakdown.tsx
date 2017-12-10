import * as React from 'react';
import {StatItem} from '../state/types/StatItem';
import {css, StyleSheet} from 'aphrodite';
import {commonStyles} from '../config/styles';

export class StatsBreakdown extends React.Component<{stats: StatItem}> {
  render () {
    const mods = this.props.stats.mods.map((mod, index) => (
      <div className={css(styles.source)} key={index}>
        {mod.stat.toString()} from {mod.source.statsSourceName} ({mod.source.name})
      </div>
    ));

    return (
      <div>
        <div className={css(commonStyles.positiveText)}>
          {this.props.stats.info.longName}
        </div>
        {mods}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  source: {
    whiteSpace: 'nowrap'
  }
});
