export const INVENTORY_EVENTS = {
  STOCK_PURCHASED: 'inventory.stock.purchased',
  ADJUST_STOCK: 'inventory.stock.adjust',
  STOCK_LEVELS: 'inventory.stock.levels',
  LOW_STOCK_ALERTS: 'inventory.stock.low-alerts',
  STOCK_MOVEMENTS: 'inventory.stock.movements',
} as const;

export type InventoryEvent =
  (typeof INVENTORY_EVENTS)[keyof typeof INVENTORY_EVENTS];
