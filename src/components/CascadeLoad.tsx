import { useEffect, useState } from "react";
import { wait } from "../util";
import { Loading } from "./Loading";

export default function CascadeLoad({ id }: { id: number }) {
  const [data, setData] = useState("");

  useEffect(() => {
    wait(1000).then(_ => setData(new Date().toISOString()));
  }, [id]);

  return <div data-testid="CascadeLoad">{data ? <InnerCascadeLoad id={data} /> : <Loading />}</div>;
}

function InnerCascadeLoad({ id }: { id: string }) {
  const [data, setData] = useState("");

  useEffect(() => {
    wait(1000).then(_ => setData(new Date().toISOString()));
  }, [id]);

  return <div data-testid="InnerCascadeLoad">{data ? data : <Loading />}</div>;
}
