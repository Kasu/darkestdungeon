import * as React from "react";
import {css, StyleSheet} from "aphrodite";
import {AppStats} from "./ui/AppStats";
import {AppStateComponent} from "./AppStateComponent";
import {observer} from "mobx-react";
import {InputBinding} from "./state/InputState";
import {observable} from "mobx";
import {mapMap} from "./lib/Helpers";

@observer
export class DevTools extends AppStateComponent {
  pathSelect: HTMLSelectElement;
  localeSelect: HTMLSelectElement;

  @observable isVisible = true;

  render () {
    const inputBindings = (
      <InputBinding global match="§" callback={() => this.isVisible = !this.isVisible}/>
    );

    if (!this.isVisible) {
      return inputBindings;
    }

    const pathOptions = mapMap(this.appState.router.routes, (route, path) => (
      <option key={path} value={path}>{path}</option>
    ));

    const localeOptions = this.appState.i18n.availableLocales.map((locale) => (
      <option key={locale} value={locale}>{locale}</option>
    ));

    return (
      <div className={css(styles.container)}>
        <div className={css(styles.currentPath)}>
          {this.appState.router.path.toString()}
        </div>
        <select ref={(node) => this.pathSelect = node}
                className={css(styles.paths)}
                onChange={() => this.gotoSelectedPath()}>
          {pathOptions}
        </select>
        <select ref={(node) => this.localeSelect = node}
                defaultValue={this.appState.i18n.locale}
                onChange={() => this.appState.i18n.locale = this.localeSelect.value}>
          {localeOptions}
        </select>
        <button onClick={() => this.gotoSelectedPath()}>
          Go
        </button>
        <button onClick={() => this.activeProfile.gotoNextWeek()}>
          Week++
        </button>
        <button onClick={() => this.appState.toggleGridOverlay()}>
          Grid
        </button>
        {!this.appState.isRunningJest && <AppStats/>}
        {inputBindings}
      </div>
    );
  }

  gotoSelectedPath () {
    this.appState.router.goto(this.pathSelect.value);
  }
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: "row"
  },

  paths: {
    flex: 1,
    flexDirection: "row"
  },

  currentPath: {
    padding: 3,
    justifyContent: "center",
    alignItems: "center"
  }
});
