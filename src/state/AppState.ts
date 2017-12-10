import {RouterState} from "./RouterState";
import {AmbienceState} from "./AmbienceState";
import {MusicState} from "./MusicState";
import {PopupState} from "./PopupState";
import {observable, reaction} from "mobx";
import {ProfileState} from "./ProfileState";
import {OptionsState} from "./OptionsState";
import {deserialize, serialize} from "serializr";
import {AppBounds} from "../AppBounds";
import {Profile} from "./types/Profile";
import {Route} from "./types/Route";
import {Path} from "./types/Path";
import {SFXPlayer} from "./SFXPlayer";
import {BarkDistributor} from "./BarkDistributor";
import {Difficulty} from "./types/Difficulty";
import {I18nState} from "./I18nState";

export class AppState {
  private reactionDisposers: Array<() => void>;

  public bounds: AppBounds = new AppBounds();
  public router: RouterState = new RouterState();
  public ambience: AmbienceState = new AmbienceState();
  public music: MusicState = new MusicState();
  public popups: PopupState = new PopupState();
  public options: OptionsState = new OptionsState();
  public sfx: SFXPlayer = new SFXPlayer();
  public barker: BarkDistributor = new BarkDistributor();
  public profiles: ProfileState = new ProfileState();
  public i18n: I18nState = new I18nState();

  public isRunningJest: boolean; // HACK ugly workaround
  @observable showGridOverlay: boolean = false;

  // A react portal node placed above the first layer of popups
  @observable public portalNode: HTMLDivElement; // HACK this probably shouldn't be part of state

  toggleGridOverlay () {
    this.showGridOverlay = !this.showGridOverlay;
  }

  /**
   * Starts composite state behavior
   */
  initialize () {
    let previousPath = this.router.path;
    this.reactionDisposers = [
      // Path changes
      reaction(
        () => [
          this.router.path,
          this.router.route,
          this.router.route.music(this, this.router.path)
        ],
        ([path, route, music]: [Path, Route, IHowlProperties]) => {
          // Close all popups as soon as the path changes.
          // This avoids popups staying visible during screen transitions.
          if (previousPath.root !== path.root) {
            this.popups.closeAll();
          }
          previousPath = path;

          // Update memorized path for active profile
          if (route.isMemorable) {
            this.profiles.activeProfile.path = new Path(path.value);
          }

          // Change music and ambience
          this.ambience.activate(route.ambience(this, path));
          this.music.play(music);
        }
      ),
      // Save whenever interesting data changes
      reaction(
        () => {
          return {
            profiles: Array.from(this.profiles.map.values()).map((p) => [
              p.name,
              p.isNameFinalized,
              p.path,
              p.estateEvent,
              p.estateEvent.shown,
              p.gold,
              p.heirloomCounts,
              p.selectedQuest.status,
              p.selectedQuest.currentRoomId,
              p.selectedQuest.inBattle,
              p.selectedQuest.turn,
              p.selectedQuest.turnActorIndex,
              p.selectedQuest.items.length,
              p.selectedQuest.currentRoom.curios.filter((c) => c.hasBeenInteractedWith).length
            ])
          };
        },
        () => this.save()
      ),
      // Add disposer to stop bark distribution
      () => this.barker.stop()
    ];

    // Start bark distribution
    this.barker.start();
  }

  ensureProfile () {
    if (this.profiles.map.size === 0) {
      const nullProfile = this.profiles.createProfile(Difficulty.Radiant);
      nullProfile.name = "Null";
      nullProfile.isNameFinalized = true;
    }

    // Activate the first profile
    this.profiles.setActiveProfile(Array.from(this.profiles.map.keys())[0]);
  }

  save () {
    const jsProfileList = [];
    for (const profile of this.profiles.map.values()) {
      jsProfileList.push(serialize(profile));
    }

    localStorage.setItem("profileList", JSON.stringify(jsProfileList));
    console.log("Saved");
  }

  load () {
    const rawProfileList = localStorage.getItem("profileList");
    if (rawProfileList) {
      try {
        const jsProfileList = JSON.parse(rawProfileList);

        const profileList = [];
        for (const jsProfile of jsProfileList) {
          const profile = deserialize(Profile, jsProfile);
          profileList.push(profile);
          this.profiles.addProfile(profile);
        }
      } catch (e) {
        console.error("Unable to parse localStorage data: " + e);
      }
    }
  }

  /**
   * Ends composite state behavior
   */
  dispose () {
    this.reactionDisposers.forEach((dispose) => dispose());
  }
}
