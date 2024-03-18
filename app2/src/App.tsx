import { lazy } from "react";
import Counter from "./Counter";
const Card = lazy(() => import("app1").then((res) => res.Card()));

function App() {
  return (
    <div>
      App2
      <Card size="small">
        <Counter></Counter>
      </Card>
    </div>
  );
}

export default App;
