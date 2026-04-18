import { useState } from "react";

export function B() {
  const [x, setX] = useState("");
  return <div data-testid="B">B</div>;
}
