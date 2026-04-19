export function Loading() {
  return (
    <>
      <style>{css}</style>
      <div data-testid="Loading" className="spin">
        Loading...
      </div>
    </>
  );
}

const css = `
.spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;
