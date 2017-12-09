import {Path} from "../state/types/Path";
import {Start} from "../screens/start/Start";
import {Loading} from "../screens/Loading";
import {EstateOverview} from "../screens/estate/EstateOverview";
import {EstateDungeons} from "../screens/estate/EstateDungeons";
import {EstateProvision} from "../screens/estate/EstateProvision";
import {DungeonResult} from "../screens/dungeon/DungeonResult";
import {BarkTester} from "../screens/BarkTester";
import {PopupTester} from "../screens/PopupTester";
import {AmbienceDefinition} from "../state/AmbienceState";
import {AppState} from "../state/AppState";
import {DungeonOverview} from "../screens/dungeon/DungeonOverview";
import {StageCoach} from "../screens/estate/buildings/StageCoach";
import {Graveyard} from "../screens/estate/buildings/Graveyard";
import {Tavern} from "../screens/estate/buildings/Tavern";
import {Sanitarium} from "../screens/estate/buildings/Sanitarium";
import {Abbey} from "../screens/estate/buildings/Abbey";
import {Guild} from "../screens/estate/buildings/Guild";
import {Blacksmith} from "../screens/estate/buildings/Blacksmith";
import {BattleTester} from "../screens/BattleTester";
import {Route} from "../state/types/Route";
import {Profile} from "../state/types/Profile";

export const defaultEstateAmbience = new AmbienceDefinition(
  {src: require("../assets/dd/audio/amb_town_gen_base.ogg")},
  [
    {src: require("../assets/dd/audio/amb_town_gen_base_os_01.ogg")},
    {src: require("../assets/dd/audio/amb_town_gen_base_os_02.ogg")},
    {src: require("../assets/dd/audio/amb_town_gen_base_os_03.ogg")}
  ]
);

const loadingRerouter = (fromPath: Path, toPath: Path) => {
  if (!toPath.args.bypassRerouter) {
    return new Path("loading", {
      target: new Path(
        toPath.value, {
          ...toPath.args,
          bypassRerouter: true
        }
      )
    });
  }
};

const estateLoadingRerouter = (from: Path, to: Path) => {
  if (!/^estate/.test(from.value)) {
    return loadingRerouter(from, to);
  }
};

export const routes: {[key: string]: Route} = {
  start: new Route({
    component: Start,
    isMemorable: false,
    ambience: () => routes.estateDungeons.ambience.apply(this, arguments)
  }),

  loading: new Route({
    component: Loading,
    isMemorable: false
  }),

  estateOverview: new Route({
    title: () => "Hamlet",
    image: () => require("../assets/dd/images/loading_screen/loading_screen.town_visit.png"),
    rerouter: estateLoadingRerouter,
    component: EstateOverview,
    music: () => {
      return {
        src: require("../assets/dd/audio/mus_town_stemmed.ogg"),
        volume: 0.25
      };
    },
    ambience: () => defaultEstateAmbience,
    children: {
      "StageCoach": new Route({component: StageCoach}),
      "Graveyard": new Route({
        component: Graveyard,
        ambience: () => new AmbienceDefinition(
          {src: require("../assets/dd/audio/amb_town_graveyard.ogg")},
          [
            {src: require("../assets/dd/audio/amb_town_graveyard_os_01.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_02.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_03.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_04.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_05.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_06.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_07.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_09.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_10.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_11.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_12.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_13.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_14.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_15.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_16.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_17.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_18.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_19.ogg")},
            {src: require("../assets/dd/audio/amb_town_graveyard_os_20.ogg")}
          ]
        )
      }),
      "Tavern": new Route({
        component: Tavern,
        ambience: () => new AmbienceDefinition(
          {src: require("../assets/dd/audio/amb_town_tavern.ogg")},
          [
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_01.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_02.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_03.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_04.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_05.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_06.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_07.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_08.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_09.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_bar_10.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_01.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_02.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_03.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_04.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_05.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_06.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_07.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_08.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_09.ogg")},
            {src: require("../assets/dd/audio/amb_town_tavern_os_chair_10.ogg")}
          ]
        )
      }),
      "Sanitarium": new Route({
        component: Sanitarium,
        ambience: () => new AmbienceDefinition(
          {src: require("../assets/dd/audio/amb_town_sanitarium.ogg")},
          [
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_01.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_02.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_03.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_04.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_05.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_06.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_07.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_08.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_09.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_10.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_11.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_12.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_13.ogg")},
            {src: require("../assets/dd/audio/amb_town_sanitarium_os_gen_14.ogg")}
          ]
        )
      }),
      "Abbey": new Route({
        component: Abbey,
        ambience: () => new AmbienceDefinition(
          {src: require("../assets/dd/audio/amb_town_abbey.ogg")},
          [
            {src: require("../assets/dd/audio/amb_town_abbey_os_chants.ogg")},
            {src: require("../assets/dd/audio/amb_town_abbey_os_whispers.ogg")}
          ]
        )
      }),
      "Guild": new Route({
        component: Guild,
        ambience: () => new AmbienceDefinition(
          {src: require("../assets/dd/audio/amb_town_guild.ogg")}
        )
      }),
      "Blacksmith": new Route({
        component: Blacksmith,
        ambience: () => new AmbienceDefinition(
          {src: require("../assets/dd/audio/amb_town_blacksmith.ogg")},
          [
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_01.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_02.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_03.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_04.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_05.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_06.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_07.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_08.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_09.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_10.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_11.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_12.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_13.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_14.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_15.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_16.ogg")},
            {src: require("../assets/dd/audio/amb_town_blacksmith_os_17.ogg")}
          ]
        )
      })
    }
  }),

  estateDungeons: new Route({
    title: () => "Hamlet (map)",
    image: () => routes.estateOverview.image.apply(this, arguments),
    rerouter: estateLoadingRerouter,
    component: EstateDungeons,
    music: () => routes.estateOverview.music.apply(this, arguments),
    ambience: () => new AmbienceDefinition(
      {src: require("../assets/dd/audio/amb_town2_gen_base.ogg")},
      [
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_01.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_02.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_03.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_04.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_05.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_06.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_07.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_08.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_09.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_10.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_11.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_12.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_13.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_14.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_15.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_16.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_17.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_18.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_19.ogg")},
        {src: require("../assets/dd/audio/amb_town2_gen_base_os_20.ogg")}
      ]
    )
  }),

  estateProvision: new Route({
    title: () => "Hamlet (provision)",
    image: () => routes.estateOverview.image.apply(this, arguments),
    rerouter: estateLoadingRerouter,
    component: EstateProvision,
    music: () => routes.estateDungeons.music.apply(this, arguments),
    ambience: () => routes.estateDungeons.ambience.apply(this, arguments)
  }),

  dungeonOverview: new Route({
    title: (profile: Profile) => {
      return profile.selectedDungeon ? profile.selectedDungeon.info.name : "Dungeons";
    },
    image: (profile: Profile) => {
      return profile.selectedDungeon ? profile.selectedDungeon.info.imageUrl : "";
    },
    rerouter: loadingRerouter,
    component: DungeonOverview,
    ambience: () => require("../assets/dd/audio/amb_dun_weald_base.ogg"),
    music: (state: AppState) => {
      if (state.profiles.activeProfile.selectedQuest.inBattle) {
        return require("../assets/dd/audio/mus_combat_hallway_part_a.ogg");
      }
    }
  }),

  dungeonResult: new Route({
    component: DungeonResult,
    isMemorable: false
  }),

  barkTester: new Route({
    component: BarkTester,
    isMemorable: false
  }),

  popupTester: new Route({
    component: PopupTester,
    isMemorable: false
  }),

  battleTester: new Route({
    component: BattleTester,
    isMemorable: false
  })
};
