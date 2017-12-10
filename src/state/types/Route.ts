import {Path} from './Path';
import {AmbienceDefinition} from '../AmbienceState';
import {Profile} from './Profile';

const noop: () => null = () => null;

export class RouteConstructionProps {
  component: any;
  isMemorable?: boolean;
  music?: (state?: any, path?: Path) => IHowlProperties;
  ambience?: (state?: any, path?: Path) => AmbienceDefinition;
  image?: (profile: Profile) => string;
  title?: (profile: Profile) => string;
  children?: { [key: string]: Route };
  rerouter?: (fromPath: Path, toPath: Path) => Path;
}

export class Route extends RouteConstructionProps {
  private constructionProps: RouteConstructionProps;

  // Created by inherit
  public path?: Path;
  public parent?: Route;
  public root: Route = this;

  constructor (props: RouteConstructionProps) {
    super();

    this.constructionProps = props;

    this.component = props.component;
    this.isMemorable = props.isMemorable !== undefined ? props.isMemorable : true;
    this.children = props.children || {};
    this.rerouter = props.rerouter;
    this.image = props.image || noop;
    this.title = props.title || (() => this.path.value);

    this.ambience = props.ambience ?
      function () {
        let res;
        if (props.ambience) {
          res = props.ambience.apply(this, arguments);
          if (typeof res === 'string') {
            return new AmbienceDefinition({src: res});
          }
        }
        return res;
      } : noop;

    this.music = props.music ?
      function () {
        let res;
        if (props.music) {
          res = props.music.apply(this, arguments);
          if (typeof res === 'string') {
            return {src: res};
          }
        }
        return res;
      } : noop;
  }

  inherit (parent: Route, childPath: string) {
    const cascaded = new Route(this.constructionProps);
    cascaded.root = parent.root;
    cascaded.parent = parent;
    cascaded.path = new Path(
      parent.path.parts.concat(childPath).join(Path.separator)
    );
    if (cascaded.title === noop) {
      cascaded.title = parent.title;
    }
    if (cascaded.image === noop) {
      cascaded.image = parent.image;
    }
    if (cascaded.music === noop) {
      cascaded.music = parent.music;
    }
    if (cascaded.ambience === noop) {
      cascaded.ambience = parent.ambience;
    }
    return cascaded;
  }
}
