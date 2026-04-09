import { z } from 'zod';
export declare const TransactionIsolationLevelSchema: z.ZodEnum<{
    ReadUncommitted: "ReadUncommitted";
    ReadCommitted: "ReadCommitted";
    RepeatableRead: "RepeatableRead";
    Serializable: "Serializable";
}>;
export default TransactionIsolationLevelSchema;
