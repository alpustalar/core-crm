import { ICommand } from '@nestjs/cqrs';

/**
 * Termini geçmiş iş emirlerini tarayan iç komut — HTTP'den değil, BullMQ repeatable
 * job'ından tetiklenir. Aktör bağlamı yoktur (sistem işi), parametre almaz.
 */
export class ScanOverdueWorkOrdersCommand implements ICommand {}
