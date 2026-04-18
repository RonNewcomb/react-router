export function D(props: { id?: string }) {
  return <div data-testid="D">D {props?.id || ""}</div>;
}

export default D;
