export function E({ id }: { id: number }) {
  return (
    <div data-testid="E">
      E {id} {typeof id}
    </div>
  );
}
