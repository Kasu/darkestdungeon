import {observable} from 'mobx';

export class OptionsState {
  public controls = new ControlOptions();
  public graphics = new GraphicsOptions();
  public audio = new AudioOptions();
  public gameplay = new GameplayOptions();
  public misc = new MiscOptions();
}

class ControlOptions {
  @observable controllerEnabled = true;
  @observable holdRequiredInDungeon = false;
  @observable interactWithLeftStickUp = true;
  @observable vibration = true;
}

class GraphicsOptions {
  @observable gamma = 1;
  @observable combatPivotCamera = true;
  @observable blurEffect = true;
}

class AudioOptions {
  @observable subtitles = SubtitlePosition.Top;
  @observable mute = false;
  @observable muteWhileInBackground = true;
}

class GameplayOptions {
  @observable questWarnings = true;
  @observable embarkWarnings = true;
  @observable deckBasedStageCoach = true;
  @observable curioTrackerUI = true;
  @observable monstersLeaveCorpses = true;
  @observable combatDelayPenalties = true;
  @observable mortalityDebuffs = true;
  @observable combatRetreatsCanFail = true;
  @observable StandardEnemyCrits = true;
  @observable townEvents = TownEventFrequency.Normal;
  @observable neverAgain = true;
}

class MiscOptions {
  @observable tutorials = true;
  @observable barkTime = 2;
  @observable barkDismissal = true;
  @observable partyAutoSort = true;
  @observable debugOutput = true;
  @observable autoCenterDungeonMap = true;
}

enum TownEventFrequency {
  Off,
  Normal,
  Plentiful
}

enum SubtitlePosition {
  Top,
  Bottom,
  Off
}
