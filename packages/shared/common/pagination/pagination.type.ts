import { PaginationSchema } from '@shared/common/pagination/pagination.schema';
import { z } from 'zod';

/** Sunucu tarafı: `take`/`skip` türetilmiş hâliyle dahil. */
export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * İstemci tarafı: şemanın **girdisi**. Aradaki fark önemli — çıktı, sunucunun
 * hesapladığı `take`/`skip`i de taşır ve istemci onları göndermez; gönderirse
 * türetilmiş alanı uydurmuş olur. Ayrıca tüm alanların varsayılanı olduğu için
 * girdide hepsi opsiyoneldir.
 */
export type PaginationInput = z.input<typeof PaginationSchema>;
