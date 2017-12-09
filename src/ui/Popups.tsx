import * as React from "react";
import {ModalState, PopupHandle} from "../state/PopupState";
import {css, StyleSheet} from "aphrodite";
import {LineButton} from "./LineButton";
import {grid} from "../config/Grid";
import {Input} from "../config/Input";
import {InputBinding} from "../state/InputState";
import {commonColors, commonStyleFn} from "../config/styles";
import {VerticalOutlineBox} from "./VerticalOutlineBox";
import Color = require("color");
import {Icon} from "./Icon";
import {AppStateComponent} from "../AppStateComponent";
import {when} from "mobx";

export type PopupProps = {
  headerIcon?: string,
  handle?: PopupHandle,
  closeable?: boolean,
  classStyle?: any,
  sounds?: boolean,
  muffle?: boolean,
  openSound?: any,
  closeSound?: any,
  fullScreen?: boolean
};

export class Popup extends AppStateComponent<PopupProps> {
  static defaultProps = {
    sounds: true,
    openSound: {src: require("../assets/dd/audio/ui_town_button_page_open.ogg"), volume: 0.8},
    closeSound: {src: require("../assets/dd/audio/ui_town_button_page_close.ogg"), volume: 0.8}
  };

  private stopWaitingForClose: () => void;

  componentWillMount () {
    if (this.props.sounds) {
      this.playOpenSoundAndWaitForClose();
    }
  }

  componentWillUnmount () {
    if (this.stopWaitingForClose) {
      this.stopWaitingForClose();
    }
  }

  playOpenSoundAndWaitForClose () {
    if (this.props.openSound) {
      this.appState.sfx.play(this.props.openSound);
    }

    if (this.props.handle) {
      if (this.props.muffle) {
        this.appState.music.muffle(true);
        this.appState.ambience.muffle(true);
        this.appState.sfx.muffle(true);
        this.appState.barker.stop();
      }
      this.stopWaitingForClose = when(
        () => !this.appState.popups.map.has(this.props.handle.id),
        () => this.handleClose()
      );
    }
  }

  handleClose () {
    if (this.props.muffle) {
      this.appState.music.muffle(false);
      this.appState.ambience.muffle(false);
      this.appState.sfx.muffle(false);
      this.appState.barker.start();
    }
    if (this.props.closeSound) {
      this.appState.sfx.play(this.props.closeSound);
    }
  }

  render () {
    const isDismissable = this.props.handle && this.props.handle.modalState !== ModalState.Modal;
    const hasCloseButton = this.props.handle && (this.props.closeable || isDismissable);
    const closeButton = hasCloseButton && (
      <Icon
        src={require("../assets/dd/images/shared/progression/progression_close.png")}
        classStyle={styles.closeButton}
        onClick={() => this.props.handle.close()}>
        <InputBinding
          match={Input.back}
          callback={() => this.props.handle.close()}
        />
      </Icon>
    );

    const headerIcon = this.props.headerIcon && (
      <div className={css(styles.header)}>
        <div className={css(styles.headerInner)}>
          <VerticalOutlineBox/>
          <Icon size={grid.ySpan(1)} src={this.props.headerIcon} scale={headerIconScale}/>
        </div>
      </div>
    );

    return (
      <div className={css(styles.popup, this.props.fullScreen && styles.fullScreen, this.props.classStyle)}>
        <div className={css(styles.splash)}/>
        <div className={css(styles.content)}>
          {headerIcon}
          {this.props.children}
          {closeButton}
        </div>
      </div>
    );
  }
}

const promptIcon = require("../assets/dd/images/modes/base/fe_flow/mode_select_dialog_icon.png");
export class Prompt extends React.Component<
  PopupProps & {
  query?: any,
  responses?: PromptResponse[],
  yesLabel?: string,
  noLabel?: string,
  yesSound?: IHowlProperties,
  noSound?: IHowlProperties
}> {
  static defaultProps = {
    yesLabel: "Yes",
    noLabel: "No"
  };

  getDefaultResponses () {
    return [
      {label: this.props.yesLabel, sound: this.props.yesSound, value: true},
      {label: this.props.noLabel, sound: this.props.noSound, value: false}
    ];
  }

  render () {
    const {query, responses, classStyle, ...rest} = this.props;

    return (
      <Popup headerIcon={promptIcon} classStyle={[styles.prompt, classStyle]} {...rest}>
        {query && (
          <div className={css(styles.promptQuery)}>
            {query}
          </div>
        )}

        {this.props.children}

        {(responses || this.getDefaultResponses()).map((response) => (
          <LineButton
            key={response.label}
            classStyle={styles.promptButton}
            clickSound={response.sound}
            onClick={() => this.props.handle.close(response.value)}
            label={response.label}/>
        ))}
      </Popup>
    );
  }
}

export class Alert extends React.Component<
  PopupProps & {
  message: any,
  dismissLabel?: string
  dismissValue?: any
}> {
  static defaultProps = {
    dismissLabel: "Ok",
    dismissValue: false
  };

  render () {
    const {message, dismissLabel, dismissValue, ...rest} = this.props;
    return (
      <Prompt {...rest}
        query={message}
        responses={[{label: dismissLabel, value: dismissValue}]}>
        {this.props.children}
      </Prompt>
    );
  }
}

type PromptResponse = {
  label: string,
  value: any,
  sound?: IHowlProperties
};

const headerIconScale = 2;
const splashSize = grid.ySpan(2);
export const popupBorder1Size = grid.gutter / 2;
export const popupBorder2Size = grid.border;
export const popupContentPadding = grid.gutter;
export const popupOffset = popupBorder1Size + popupBorder2Size + popupContentPadding;
const styles = StyleSheet.create({
  popup: {
    background: "black",
    padding: popupBorder1Size,
    boxShadow: commonStyleFn.outerShadow(),
    minWidth: grid.vw(25),
    maxWidth: grid.vw(85)
  },

  fullScreen: {
    width: grid.outerWidth,
    height: grid.outerHeight,
    maxWidth: grid.outerWidth
  },

  splash: {
    ...commonStyleFn.dock("topRight", -splashSize / 2),
    width: splashSize,
    height: splashSize,
    background: `url(${require("../assets/images/splash1.png")})`,
    backgroundSize: "contain",
    backgroundPosition: "50% 50%",
    backgroundRepeat: "no-repeat",
    pointerEvents: "none"
  },

  content: {
    flex: 1,
    border: commonStyleFn.border(commonColors.gold, popupBorder2Size),
    boxShadow: commonStyleFn.innerShadow(undefined, grid.gutter * 4),
    padding: popupContentPadding
  },

  header: {
    marginBottom: popupContentPadding,
    background: commonStyleFn.gradient("bottom", [
      [0, new Color(commonColors.gold).darken(1)],
      [20, new Color(commonColors.gold).darken(0.85)],
      [50, new Color(commonColors.gold).darken(0.85)],
      [100, new Color(commonColors.gold).darken(1)]
    ]),

    ":before": {
      ...commonStyleFn.dock(),
      content: '" "',
      background: commonStyleFn.gradient("right", [
        [0, "black"],
        [50, "transparent"],
        [100, "black"]
      ])
    }
  },

  headerInner: {
    marginLeft: "25%",
    marginRight: "25%",
    alignItems: "center"
  },

  closeButton: {
    ...commonStyleFn.dock("topRight", popupContentPadding)
  },

  prompt: {
    maxWidth: grid.vw(33)
  },

  promptQuery: {
    fontWeight: "bold",
    marginBottom: grid.gutter * 2,
    textAlign: "center",
    whiteSpace: "pre-wrap"
  },

  promptButton: {
    ":not(:last-child)": {
      marginBottom: grid.gutter
    }
  }
});
