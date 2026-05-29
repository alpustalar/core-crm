export const INVENTORY_EVENTS = {
  STOCK_PURCHASED: 'inventory.stock.purchased',
} as const;

export type InventoryEvent = (typeof INVENTORY_EVENTS)[keyof typeof INVENTORY_EVENTS];
