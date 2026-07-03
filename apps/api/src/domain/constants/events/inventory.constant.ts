export const INVENTORY_EVENTS = {
  STOCK_PURCHASED: 'inventory.stock.purchased',
  ADJUST_STOCK: 'inventory.stock.adjust',
} as const;

export type InventoryEvent =
  (typeof INVENTORY_EVENTS)[keyof typeof INVENTORY_EVENTS];
