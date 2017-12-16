import {Request, Response, NextFunction} from 'express-serve-static-core';

/**
 * Serve a fluxible/fetchr app on a server different than where the client is served from.
 */
export function fluxibleFetchrSplit (fluxibleApp: any, fetchrPlugin: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const xhrPath = fetchrPlugin.getXhrPath();

    // Allow clients to create app context at will
    if (req.originalUrl.startsWith('/init')) {
      const context = fluxibleApp.createContext({req});
      const dehydratedApp = fluxibleApp.dehydrate(context);

      // Inject host to xhrPath
      dehydratedApp.context.plugins.FetchrPlugin.xhrPath =
        req.protocol + '://' + req.get('host') + xhrPath;

      res.send(JSON.stringify(dehydratedApp));
    }

    // Expose fetchr services
    if (req.originalUrl.startsWith(xhrPath)) {
      // Remove xhrPath from url to make fetchr middleware get the resource name
      req.url = req.originalUrl.substr(xhrPath.length);
      return fetchrPlugin.getMiddleware()(req, res, next);
    }

    next();
  };
}

