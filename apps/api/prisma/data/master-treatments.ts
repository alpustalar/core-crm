import { Prisma, TreatmentCategory } from '@prisma/client';

export const masterTreatmentsCreateManyInputs: Prisma.MasterTreatmentCreateManyInput[] =
  [
    // --- DIAGNOSIS (Teşhis ve Planlama) ---
    {
      name: 'Diş Hekimi Muayenesi',
      category: TreatmentCategory.DIAGNOSIS,
      defaultDuration: 20,
    },
    {
      name: 'Uzman Diş Hekimi Muayenesi',
      category: TreatmentCategory.DIAGNOSIS,
      defaultDuration: 20,
    },
    {
      name: 'Panoramik Röntgen Filmi',
      category: TreatmentCategory.DIAGNOSIS,
      defaultDuration: 15,
    },

    // --- RESTORATIVE (Tedavi ve Endodonti) ---
    {
      name: 'Kompozit Dolgu (Tek Yüzlü)',
      category: TreatmentCategory.RESTORATIVE,
      defaultDuration: 40,
    },
    {
      name: 'Kompozit Dolgu (İki Yüzlü)',
      category: TreatmentCategory.RESTORATIVE,
      defaultDuration: 50,
    },
    {
      name: 'Kanal Tedavisi (Tek Kanal - Dolgu Hariç)',
      category: TreatmentCategory.RESTORATIVE,
      defaultDuration: 60,
    },
    {
      name: 'Kanal Tedavisi (İki Kanal - Dolgu Hariç)',
      category: TreatmentCategory.RESTORATIVE,
      defaultDuration: 90,
    },

    // --- SURGERY (Cerrahi) ---
    {
      name: 'Diş Çekimi',
      category: TreatmentCategory.SURGERY,
      defaultDuration: 30,
    },
    {
      name: 'Komplikasyonlu Diş Çekimi',
      category: TreatmentCategory.SURGERY,
      defaultDuration: 45,
    },
    {
      name: 'Gömülü Diş Operasyonu',
      category: TreatmentCategory.SURGERY,
      defaultDuration: 60,
    },
    {
      name: 'İmplant Uygulaması (Tek Ünite)',
      category: TreatmentCategory.SURGERY,
      defaultDuration: 45,
    },

    // --- PERIODONTOLOGY (Diş Eti) ---
    {
      name: 'Detertraj (Diş Taşı Temizliği - Tek Çene)',
      category: TreatmentCategory.PERIODONTOLOGY,
      defaultDuration: 30,
    },
    {
      name: 'Subgingival Küretaj (Diş Eti Tedavisi)',
      category: TreatmentCategory.PERIODONTOLOGY,
      defaultDuration: 45,
    },

    // --- PROSTHODONTICS (Protez ve Kaplamalar) ---
    {
      name: 'Zirkonyum Kaplama (Tek Ünite)',
      category: TreatmentCategory.PROSTHODONTICS,
      defaultDuration: 45,
    },
    {
      name: 'Porselen Kaplama (Metal Destekli)',
      category: TreatmentCategory.PROSTHODONTICS,
      defaultDuration: 45,
    },
    {
      name: 'Tam Protez (Tek Çene)',
      category: TreatmentCategory.PROSTHODONTICS,
      defaultDuration: 60,
    },

    // --- COSMETIC (Estetik) ---
    {
      name: 'Diş Beyazlatma (Ofis Tipi)',
      category: TreatmentCategory.COSMETIC,
      defaultDuration: 60,
    },
    {
      name: 'Lamina Veneer (Porselen)',
      category: TreatmentCategory.COSMETIC,
      defaultDuration: 60,
    },

    // --- PEDODONTICS (Çocuk) ---
    {
      name: 'Fissür Örtücü (Tek Diş)',
      category: TreatmentCategory.PEDODONTICS,
      defaultDuration: 20,
    },
    {
      name: 'Yer Tutucu (Sabit)',
      category: TreatmentCategory.PEDODONTICS,
      defaultDuration: 40,
    },
  ];
