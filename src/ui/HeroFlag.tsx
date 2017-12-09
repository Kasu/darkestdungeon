import * as React from "react";
import {observer} from "mobx-react";
import {css, StyleSheet} from "aphrodite";
import {LevelIcon} from "./LevelIcon";
import {StressMeter} from "./StressMeter";
import {Hero} from "../state/types/Hero";
import {QuirkText} from "./QuirkText";
import {Experienced} from "../state/types/Experienced";
import {commonColors, commonStyleFn} from "../config/styles";
import {grid} from "../config/Grid";
import {CommonHeader} from "./CommonHeader";
import {fonts} from "../assets/fonts";

@observer
export class HeroFlag extends React.Component<{
  hero: Hero,
  exp?: Experienced,
  classStyle?: any
}> {
  render () {
    const hero = this.props.hero;
    const exp = this.props.exp !== undefined ? this.props.exp : hero;
    return (
      <div className={css(styles.container, this.props.classStyle)}>
        <div className={css(styles.levelBox)}>
          <LevelIcon exp={exp}/>
        </div>

        <StressMeter classStyle={styles.stress} percentage={hero.stats.stressPercentage}/>

        {hero.affliction && (
          <CommonHeader color={commonColors.lightGray} classStyle={styles.stripe}>
            <QuirkText quirk={hero.affliction} classStyle={styles.stripeText}/>
          </CommonHeader>
        )}
      </div>
    );
  }
}

const flagPadding = grid.gutter;
const styles = StyleSheet.create({
  container: {
    width: grid.xSpan(1),

    background: "black",
    border: commonStyleFn.border(),
    borderTop: 0,
    padding: grid.border,
    paddingTop: 0,
    borderRadius: grid.border * 2
  },

  levelBox: {
    alignItems: "center",
    border: commonStyleFn.border(commonColors.darkGray, 1),
    borderTop: 0,
    margin: grid.border,
    marginTop: 0,
    padding: grid.gutter
  },

  stress: {
    alignSelf: "center",
    marginTop: grid.border,
    marginBottom: grid.border
  },

  stripe: {
    marginRight: -flagPadding * 2,
    marginLeft: -flagPadding * 2,
    padding: grid.border,
    marginBottom: grid.gutter / 2
  },

  stripeText: {
    textAlign: "center",
    fontFamily: fonts.Default,
    fontWeight: "normal",
    color: commonColors.lightGray
  }
});
