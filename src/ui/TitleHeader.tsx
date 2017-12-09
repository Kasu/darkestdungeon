import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {fonts} from "../assets/fonts";
import {Sprite} from "../lib/Sprite";
import {smoke} from "../assets/sprites";
import {grid} from "../config/Grid";

export class TitleHeader extends React.Component<{
  classStyle?: any
}> {
  render () {
    return (
      <div className={css(styles.container, this.props.classStyle)}>
        <span className={css(styles.textLeft, styles.text)}>Dankest</span>
        <Sprite {...smoke} classStyle={styles.torch}/>
        <span className={css(styles.textRight, styles.text)}>Dungeon</span>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    color: "black",
    flexDirection: "row",
    fontFamily: fonts.Darkest,
    fontSize: grid.vw(10)
  },

  text: {
    textShadow: "0px 0px 1vw red",
    transition: "text-shadow 0.5s"
  },

  textLeft: {
    flex: 1,
    alignItems: "flex-end"
  },

  textRight: {
    flex: 1
  },

  torch: {
    width: grid.vw(10),
    height: grid.vw(10)
  }
});
