export const PARTNER_SECTORS = [
  { value: 'banking', label: 'Banca' },
  { value: 'insurance', label: 'Seguros' },
  { value: 'telecom', label: 'Telecomunicações' },
  { value: 'education', label: 'Educação' },
  { value: 'health', label: 'Saúde' },
  { value: 'energy', label: 'Energia' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'ngo', label: 'ONG / Fundação' },
  { value: 'government', label: 'Governo' },
  { value: 'retail', label: 'Retalho' },
  { value: 'other', label: 'Outro' },
] as const;

export type PartnerSector = typeof PARTNER_SECTORS[number]['value'];
