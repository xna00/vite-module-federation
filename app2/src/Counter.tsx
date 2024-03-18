import { useState } from "react";

export default () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button
        style={{
          background: "darkgreen",
        }}
        onClick={() => setCount(count + 1)}
      >
      a  {count}
      </button>
    </div>
  );
};
