import { lazy } from "react";

const App2Counter = lazy(() => import("app2").then((m) => m.Counter()));

function App() {
  return (
    <div>
      App1
      <App2Counter />
    </div>
  );
}

export default App;
