export function F({ orderId, invoices }: { orderId: number; invoices: Record<string, any>[] }) {
  return (
    <div data-testid="F">
      F {orderId} {invoices && JSON.stringify(invoices)}
    </div>
  );
}
