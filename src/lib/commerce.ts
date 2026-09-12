export const stages = ["confirmed", "shipped", "customs", "ready"] as const;
export type CargoStage = (typeof stages)[number];
export const stageLabels: Record<CargoStage, string> = {
  confirmed: "Order confirmed",
  shipped: "Shipped from China",
  customs: "At Modjo customs",
  ready: "Ready for pickup",
};
export function priceInBirr(amount: number, rate: number, markup: number) {
  return Math.round(amount * rate * (1 + markup / 100) * 100) / 100;
}
export function shippingFee(subtotal: number) {
  return subtotal >= 15000 ? 0 : 450;
}
export function money(value: number) {
  return (
    new Intl.NumberFormat("en-ET", { maximumFractionDigits: 2 }).format(value) +
    " Br"
  );
}
export function validQuantity(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 50;
}
