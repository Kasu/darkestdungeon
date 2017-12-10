import {computed, observable, transaction, when} from 'mobx';
import {Route} from './types/Route';
import {ensurePath, Path, PathTypes} from './types/Path';

export class RouterState  {
  @observable private history: Path[] = [new Path('')];
  @observable private currentIndex: number = 0;

  @observable public routes = new Map<string, Route>();

  @computed get path () {
    return this.history.length > 0 ?
      this.history[this.currentIndex] :
      undefined;
  }

  @computed get route () {
    return this.getRouteForPath(this.path);
  }

  getRouteForPath (path: Path) {
    let route = this.routes.get(path.root);
    if (!route) {
      return route404;
    }

    route.path = new Path(path.root);
    const childPaths = path.parts.slice(1);
    while (childPaths.length) {
      const childPath = childPaths.shift();
      const child = route.children[childPath];
      if (!child) {
        route = route404.inherit(route, childPath);
        break;
      } else {
        route = child.inherit(route, childPath);
      }
    }

    return route;
  }

  addRoutes (routes: {[key: string]: Route}) {
    transaction(() => {
      for (const key in routes) {
        this.addRoute(key, routes[key]);
      }
    });
  }

  addRoute (name: string, route: Route) {
    this.routes.set(name, route);
  }

  deleteRoute (name: string) {
    this.routes.delete(name);
  }

  goto (possiblePath: PathTypes) {
    let nextPath = ensurePath(possiblePath);
    if (nextPath.equals(this.path)) {
      return Promise.resolve();
    }

    const destinationPath = nextPath;

    // Go through potential rerouting
    let fromPath = this.path;
    let newPath = nextPath;
    while (newPath) {
      nextPath = newPath;
      const rerouter = this.getRouteForPath(nextPath).rerouter;
      newPath = rerouter ? rerouter(fromPath, nextPath) : null;
      fromPath = nextPath;
    }

    transaction(() => {
      // Overwrite future if there is any
      const lastIndex = this.history.length - 1;
      if (this.currentIndex < lastIndex) {
        this.history.splice(this.currentIndex + 1);
      }

      // Add new path and move to it
      this.history.push(nextPath as Path);
      this.currentIndex += 1;
    });

    // Return a promise that resolves when we
    // reach the destination (in case of reroutes)
    return new Promise((resolve) => {
      when(() => this.path.value === destinationPath.value, resolve);
    });
  }

  goBack (offset: number = 1) {
    this.offset(-offset);
  }

  goForward (offset: number = 1) {
    this.offset(offset);
  }

  offset (amount: number) {
    const nextIndex = this.currentIndex + amount;
    const lastIndex = this.history.length - 1;
    if (nextIndex >= 0 && lastIndex <= lastIndex) {
      this.currentIndex = nextIndex;
    }
  }
}

const route404 = new Route({
  component: ({path}: any) => `No route exists for path '${path}'`,
  isMemorable: false
});
