export interface CountryCurrency {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
}

export const COUNTRY_CURRENCIES: CountryCurrency[] = [
  { code: 'AO', name: 'Angola', currency: 'AOA', currencySymbol: 'Kz' },
  { code: 'MZ', name: 'Moçambique', currency: 'MZN', currencySymbol: 'MT' },
  { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', currencySymbol: '€' },
  { code: 'CV', name: 'Cabo Verde', currency: 'CVE', currencySymbol: '$' },
  { code: 'ST', name: 'São Tomé e Príncipe', currency: 'STN', currencySymbol: 'Db' },
  { code: 'GW', name: 'Guiné-Bissau', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'TL', name: 'Timor-Leste', currency: 'USD', currencySymbol: '$' },
  { code: 'NG', name: 'Nigéria', currency: 'NGN', currencySymbol: '₦' },
  { code: 'KE', name: 'Quénia', currency: 'KES', currencySymbol: 'KSh' },
  { code: 'ZA', name: 'África do Sul', currency: 'ZAR', currencySymbol: 'R' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', currencySymbol: '$' },
  { code: 'GB', name: 'Reino Unido', currency: 'GBP', currencySymbol: '£' },
];

export function getCurrencyByCountry(countryCode: string): string {
  return COUNTRY_CURRENCIES.find(c => c.code === countryCode)?.currency ?? 'AOA';
}
