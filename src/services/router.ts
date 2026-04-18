import { useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type ReactComponentProps = Record<string, any> & any;
export type UrlParamProps = Record<string, string>;

export interface ReactComponent {
  (props: ReactComponentProps): ReactNode;
}

interface ImportModule extends Object {
  [Symbol.toStringTag]?: "Module";
  default?: ReactComponent;
}

export interface Route {
  path: string;
  /** skeletons slightly differ from loading spinners because each are tailored to match the screen they're loading into */
  skeleton?: ReactComponent | ReactNode;
  /** if a boolean function is provided, and returns falsy, route change will be prevented and .else called if provided. Some data is provided for convenience */
  if?: (props: ReactComponentProps, gotoPath: string) => boolean;
  /** only called if .if was provided and returned falsy. If something displayable was returned it will be displayed. or, goto() call is recommended */
  else?: (props: ReactComponentProps, gotoPath: string) => ReactNode | undefined | void;
  loadComponent?: () => Promise<ReactComponent | ImportModule>;
  component?: ReactComponent;
  loadData?: (props: ReactComponentProps) => ReactComponentProps | Promise<ReactComponentProps>;
}

interface CleanRoute extends Route {
  segments: string[];
}

const err = "[route config] ";

interface RouterEventPayload {
  to: string;
  data?: any;
}

// goto URL /////

export class RouterEvent extends Event implements RouterEventPayload {
  static Type = "router-event";
  /** for microfrontends, change this to the micro's root node */
  static Target = document.body;
  to: string;
  data?: any;
  constructor(to: string, data?: any) {
    super(RouterEvent.Type);
    this.to = (to ?? "/").toString();
    this.data = data;
  }
}

export const goto = (path: string, data?: any) => RouterEvent.Target.dispatchEvent(new RouterEvent(path, data));

// clean utils /////////

const pathToUrl = (path: string) => new URL(path.replace(/\/\//g, "/"), location.origin);

const onlyTheCleanPath = (path: string) =>
  pathToUrl(path)
    .pathname.split("/")
    .filter(x => !!x);

const mergeProps = (asyncProps: any, props: ReactComponentProps, path: string) => {
  if (!asyncProps) return;
  else if (typeof asyncProps === "object") Object.assign(props, asyncProps);
  else if (!!asyncProps) console.error(`${err}loadData of route /${path} did not return an object`);
};

// find matching component //////

function findComponent(routes: CleanRoute[], config: RouterConfig, setJsx: Dispatch<SetStateAction<ReactNode>>, ev: RouterEventPayload) {
  const path = ev?.to;
  const dest = onlyTheCleanPath(path);

  const matchedRoutes = routes.filter(r => dest.length == r.segments.length && dest.every((c, i) => c == r.segments[i] || r.segments[i].startsWith(":")));
  if (matchedRoutes.length < 1) return setJsx(`${err}No route definitions for /${dest.join("/")}`);
  if (matchedRoutes.length > 1)
    return setJsx(`${err}Multiple route definitions for /${dest.join("/")}:\n${matchedRoutes.map(o => `#${routes.indexOf(o)}  /${o.segments.join("/")}\n`)}`);

  const route = matchedRoutes[0];
  if (!route || (!route.component && !route.loadComponent)) return setJsx(`${err}No component for route /${dest}`);

  const props: Record<string, string | number> = { data: ev?.data };
  for (let i = 0; i < dest.length; i++) {
    const routeSegment = route.segments[i];
    if (routeSegment.startsWith(":")) props[routeSegment.slice(1)] = dest[i];
  }

  if (typeof route.if === "function" && !route.if(props, path)) {
    const elseFn = typeof route.else === "function" ? route.else : typeof config.else === "function" ? config.else : undefined;
    if (elseFn) {
      const retval = elseFn(props, path);
      if (retval && ["string", "object"].includes(typeof retval)) return setJsx(retval);
    }
    return;
  }

  // Setup is done. Go. //

  window.history.pushState(void 0, "", pathToUrl(path)); // setBrowserUrl

  const gathering = route.loadData?.(props);
  if (!!gathering) {
    if (gathering instanceof Promise) gathering.then(asyncProps => mergeProps(asyncProps, props, route.path));
    else mergeProps(gathering, props, route.path);
  }

  if (route.component && !(gathering instanceof Promise)) return setJsx(route.component(props));

  const importing = route.component
    ? undefined
    : route.loadComponent!().then((componentOrModule: any) => {
        route.component =
          componentOrModule[Symbol.toStringTag] === "Module"
            ? componentOrModule.default || (() => `${err}Route /${route.path} does not choose which export is the component nor is there a default export`)
            : componentOrModule;
      });

  Promise.allSettled([gathering, importing]).then(() => {
    // prevent stale if nav'ed again beore promise finished
    if (location.pathname === pathToUrl(path).pathname) setJsx(route.component!(props));
  });

  const skeleton = route.skeleton ?? config.loading;
  if (typeof skeleton !== "undefined") return setJsx(typeof skeleton === "function" ? skeleton(props) : skeleton);
  return void 0; // don't change existing display with setJsx
}

// Router ////////

export interface RouterConfig {
  routes: Route[];
  loading?: ReactComponent | ReactNode;
  else?: ReactComponent | ReactNode;
}

export function Router(config: RouterConfig): ReactNode {
  const cleanRoutes = useMemo(() => config.routes.map<CleanRoute>(r => ({ ...r, segments: onlyTheCleanPath(r.path) })), [config.routes]);
  const [jsx, setJsx] = useState<ReactNode>("");

  const previous = useRef<EventListener>(_ => _);
  useMemo(() => {
    RouterEvent.Target.removeEventListener(RouterEvent.Type, previous.current);
    previous.current = ev => findComponent(cleanRoutes, config, setJsx, ev as RouterEvent);
    RouterEvent.Target.addEventListener(RouterEvent.Type, previous.current);
  }, [cleanRoutes]);

  useMemo(() => findComponent(cleanRoutes, config, setJsx, { to: location.pathname }), []); // initialize

  return jsx;
}
