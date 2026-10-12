type CartLine = { productId: string; quantity: number };

// Stock is tracked per product, so every colour/size line of a product counts against it.
export function remainingStock(cart: CartLine[], productId: string, stock: number): number {
  const inCart = cart
    .filter((line) => line.productId === productId)
    .reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  return Math.max(0, Math.floor(Number(stock) || 0) - inCart);
}
