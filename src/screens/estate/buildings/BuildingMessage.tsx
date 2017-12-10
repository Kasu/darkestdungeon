import * as React from 'react';
import {StyleSheet} from 'aphrodite';
import {BannerHeader} from '../../../ui/BannerHeader';
import {grid} from '../../../config/Grid';

export const BuildingMessage = ({children, style}: any) => {
  return (
    <BannerHeader classStyle={styles.buildingMessage} style={style}>
      {children}
    </BannerHeader>
  );
};

const styles = StyleSheet.create({
  buildingMessage: {
    padding: grid.gutter
  }
});
