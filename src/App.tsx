import "./App.css";
import { A } from "./components/A";
import { B } from "./components/B";
import { C } from "./components/C";
import { E } from "./components/E";
import { F } from "./components/F";
import { Loading } from "./components/Loading";
import { Params } from "./components/Params";
import "./services/router";
import { goto, type Route, Router } from "./services/router";
import { wait } from "./util";

const routes: Route[] = [
  { path: "/", component: () => <div>Hello!</div> },
  { path: "home", component: () => <A /> },
  { path: "props/:id", component: props => <E id={props.id} /> },
  { path: "home/dash", component: B },
  {
    path: "home/dashboard",
    loadComponent: async () => {
      await wait(2000);
      return C;
    },
  },
  {
    path: "/lazywait",
    loadComponent: () =>
      wait()
        .then(() => import("./components/D"))
        .then(({ D }) => D),
  },
  {
    path: "/lazy",
    loadComponent: () => import("./components/D").then(Module => Module.default),
  },
  {
    path: "/lazy1",
    loadComponent: () => import("./components/D").then(({ D }) => D),
  },
  {
    path: "/lazy2",
    loadComponent: () => import("./components/D").then(Module => Module.D),
  },
  {
    path: "/duplicate",
    component: () => "Dup screen",
  },
  {
    path: "/duplicate",
    component: _props => "Dup screen",
  },
  {
    path: "default/:id",
    loadComponent: () => import("./components/D").then(Module => Module.default),
  },
  {
    path: "default2/:cid",
    loadComponent: () => import("./components/D").then(Module => Module.default),
  },
  {
    path: "default3/:id",
    loadComponent: () => import("./components/D").then(({ default: D }) => D),
  },

  {
    path: "skeleton/:id",
    loading: () => "Alternate loading animation",
    loadComponent: () => import("./components/D").then(({ default: D }) => D),
  },

  { path: "parameters/:id", component: ({ id }) => <div>Params {id}</div> },
  // { path: "parameters/:id/:otherId", component: Params },
  { path: "parameters/:id/:otherId", component: props => <Params id={0} otherId={""} {...props} /> },

  {
    path: "module-d",
    loadComponent: () => import("./components/D"),
  },
  {
    path: "module-c",
    loadComponent: () => import("./components/C"),
  },

  {
    path: "maybe/:id",
    if: () => false,
    else: (props, path) => (
      <div>
        {path} with {props ? JSON.stringify(props) : ""} is under construction
      </div>
    ),
    component: B,
  },
  {
    path: "if",
    if: () => false,
    component: B,
  },
  {
    path: "badrole",
    if: () => false,
    else: () => goto("/"),
    component: B,
  },

  {
    path: "loaddata/:orderId",
    component: F,
    loadData: props =>
      fetch(`/invoices/${props.orderId}`)
        .then(r => r.text())
        .catch(() => [{ invoiceId: 3856 }, { invoiceId: 7387 }])
        .then(res => ({ invoices: res })),
  },

  { path: "cascade", loadComponent: () => import("./components/CascadeLoad") },

  {
    path: "customer",
    component: () => (
      <Router
        routes={[
          { path: "/", component: () => <A /> },
          { path: ":id", component: ({ id }) => <div>Customer #{id}</div> },
          {
            path: "list",
            loadComponent: async () => {
              await wait(2000);
              return C;
            },
          },
        ]}
      ></Router>
    ),
  },
];

///////////////

export function App() {
  return (
    <main className="centeredcolumn">
      <p className="read-the-docs">Read the docs</p>
      <div>
        <button onClick={() => goto("/home?arg=72")}>A</button>
        <button onClick={() => goto("/home/dash")}>B</button>
        <button onClick={() => goto("/home/dashboard")}>C</button>
        <button onClick={() => goto("/props/87")}>E id</button>
        <button onClick={() => goto("/lazy")}>lazy D</button>
        <button onClick={() => goto("/default/47")}>D 47</button>
        <button onClick={() => goto("/skeleton/" + +new Date())}>Alternate Spinner</button>
        <button onClick={() => goto("/invalid")}>invalid</button>
        <button onClick={() => goto("/duplicate")}>duplicate</button>
        <button onClick={() => goto("parameters/42?arg=2")}>With Param 42</button>
        <button onClick={() => goto("parameters/5/foo")}>With Param 5 "foo"</button>
        <button onClick={() => goto("/module-d")}>module autoexport D</button>
        <button onClick={() => goto("/module-c")}>module autoexport C</button>
        <button onClick={() => goto("maybe/69")}>if else</button>
        <button onClick={() => goto("if")}>if</button>
        <button onClick={() => goto("badrole")}>bad role: redirect in else</button>
        <button onClick={() => goto("loaddata/5686")}>loaddata</button>
        <button onClick={() => goto("cascade")}>cascade load</button>
      </div>
      <Router routes={routes} loading={Loading} else={() => "Route not allowed"} />
    </main>
  );
}
