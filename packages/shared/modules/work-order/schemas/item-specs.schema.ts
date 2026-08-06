import { z } from 'zod';

/**
 * Dış iş emri satırının sektöre özgü teknik detayı. Platform çok-dikeyli olduğu için
 * (diş, saç protezi, estetik) tek bir sabit kolon seti yerine `kind` ile ayrışan
 * discriminated union kullanılır; DB'de `specs Json` kolonunda saklanır.
 * Yeni bir dikey eklemek = buraya yeni şema eklemek (migration gerekmez).
 */

/** Diş laboratuvarı — diş numaraları FDI notasyonu (11–48). */
export const DentalWorkOrderSpecsSchema = z.object({
  kind: z.literal('DENTAL'),
  toothNumbers: z.array(z.number().int().min(11).max(48)).min(1),
  shade: z.string().optional(), // renk: A2, BL3 …
  material: z.string().optional(), // zirkonyum, metal-porselen …
});
export type DentalWorkOrderSpecs = z.infer<typeof DentalWorkOrderSpecsSchema>;

/** Saç protezi üreticisi. */
export const HairWorkOrderSpecsSchema = z.object({
  kind: z.literal('HAIR'),
  baseType: z.string().optional(), // taban tipi: dantel, ince deri …
  density: z.number().positive().optional(), // yoğunluk (%)
  curl: z.string().optional(), // kıvırcıklık derecesi
  colorCode: z.string().optional(),
  templateRef: z.string().optional(), // kalıp referansı
});
export type HairWorkOrderSpecs = z.infer<typeof HairWorkOrderSpecsSchema>;

/** Estetik / medikal protez tedarikçisi. */
export const AestheticWorkOrderSpecsSchema = z.object({
  kind: z.literal('AESTHETIC'),
  region: z.string().optional(), // uygulama bölgesi
  size: z.string().optional(),
  material: z.string().optional(),
});
export type AestheticWorkOrderSpecs = z.infer<
  typeof AestheticWorkOrderSpecsSchema
>;

/** Henüz modellenmemiş dikeyler için serbest anahtar/değer. */
export const GenericWorkOrderSpecsSchema = z.object({
  kind: z.literal('GENERIC'),
  attributes: z.record(z.string(), z.string()),
});
export type GenericWorkOrderSpecs = z.infer<typeof GenericWorkOrderSpecsSchema>;

export const WorkOrderItemSpecsSchema = z.discriminatedUnion('kind', [
  DentalWorkOrderSpecsSchema,
  HairWorkOrderSpecsSchema,
  AestheticWorkOrderSpecsSchema,
  GenericWorkOrderSpecsSchema,
]);
export type WorkOrderItemSpecs = z.infer<typeof WorkOrderItemSpecsSchema>;
