import {autorun, IReactionDisposer, observable} from "mobx";
import {defaultAmbienceOSVolume} from "../config/general";
import {Howl} from "howler";

export class AmbienceState {
  private player?: AmbiencePlayer;
  private positions: {[key: string]: number} = {};
  private definition: AmbienceDefinition;

  activate (definition: AmbienceDefinition) {
    if (!definition) {
      this.deactivate();
      return;
    }

    // Ignore recurring activations of the same ambience
    if (this.definition && definition.id === this.definition.id) {
      return;
    }

    // Deactivate the current ambience and switch to the new one
    this.deactivate();
    this.definition = definition;
    this.player = new AmbiencePlayer(definition);
    this.player.play(this.positions[definition.id] || 0);
  }

  deactivate () {
    if (this.player) {
      this.positions[this.definition.id] = this.player.getBasePosition();
      this.player.stop();
      delete this.player;
      delete this.definition;
    }
  }

  muffle (isMuffled: boolean) {
    if (this.player) {
      this.player.muffle(isMuffled);
    }
  }
}

export class AmbienceDefinition {
  constructor (
    public base: IHowlProperties,
    public os: IHowlProperties[] = []
  ) {
    this.os.forEach((o) => {
      if (o.volume !== undefined) {
        o.volume = defaultAmbienceOSVolume;
      }
    });
  }

  get id () {
    return JSON.stringify(this.base.src);
  }
}

export class AmbiencePlayer {
  static fadeTime: number = 1000;

  private baseSound: Howl;
  private osSounds: Howl[] = [];

  private disposeReaction: IReactionDisposer;
  @observable private isOSOnCooldown: boolean = true;
  @observable private isPlaying: boolean;
  @observable private isMuffled: boolean;

  constructor (
    private definition: AmbienceDefinition
  ) {}

  getBasePosition (): number {
    return this.baseSound.seek() as number;
  }

  play (startPosition: number = 0) {
    this.stop();
    this.isPlaying = true;
    this.baseSound = new Howl({...this.definition.base, loop: true});
    this.osSounds = this.definition.os.map((props) => new Howl(props));

    this.baseSound.seek(startPosition);
    this.baseSound.play();
    this.baseSound.fade(0, definedOr(this.definition.base.volume, 1), AmbiencePlayer.fadeTime);

    this.disposeReaction = autorun(() => {
      if (this.osSounds.length > 0 && this.isPlaying &&
        !this.isMuffled && !this.isOSOnCooldown) {
        this.playNextOS();
      }
    });

    this.queueOSCooldownReset();
  }

  muffle (isMuffled: boolean): any {
    const baseVolume = definedOr(this.definition.base.volume, 1);
    this.isMuffled = isMuffled;
    this.fadeTo(isMuffled ? baseVolume * 0.3 : undefined);
  }

  playNextOS () {
    this.isOSOnCooldown = true;
    const index = Math.floor(Math.random() * this.osSounds.length);
    const os = this.osSounds[index];
    return new Promise((resolve) => {
      os.once("end", () => {
        this.queueOSCooldownReset();
        resolve();
      });
      os.play();
    });
  }

  queueOSCooldownReset () {
    const timeout = 3000 + Math.random() * 10000;
    setTimeout(() => this.isOSOnCooldown = false, timeout);
  }

  stop () {
    if (!this.isPlaying) {
      return Promise.resolve();
    }

    // Set as not playing immediately to avoid OS timeouts
    // to trigger asynchronously while we're fading out
    this.isPlaying = false;
    this.disposeReaction();

    // After all sounds have faded out we stop playing and unload
    return this.fadeTo(0).then((sounds) => {
      sounds.forEach((sound) => {
        sound.stop();
        sound.unload();
      });
    });
  }

  private fadeTo (targetVolume?: number) {
    const sounds = [this.baseSound, ...this.osSounds];
    const initialVolumes = [this.definition.base, ...this.definition.os].map((def) => definedOr(def.volume, 1));
    const promises = sounds.map((sound, index) => {
      return new Promise((resolve) => {
        const volume = targetVolume === undefined ? initialVolumes[index] : targetVolume;
        sound.fade(sound.volume(), volume, AmbiencePlayer.fadeTime);
        sound.once("fade", resolve);
      });
    });

    return Promise.all(promises).then(() => sounds);
  }
}

function definedOr (value: any, fallback: any) {
  return value !== undefined ? value : fallback;
}
