import { useEffect, useState } from "react";
import { wait } from "../util";

export default function CascadeLoad({ id }: { id: number }) {
  const [_, setX] = useState("");

  useEffect(() => {
    wait(id).then(_ => setX(new Date().toISOString()));
  }, [id]);

  return <div data-testid="CascadeLoad">{id ? id : "fetching..."}</div>;
}
