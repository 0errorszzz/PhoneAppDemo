type FormatFn = (number: string) => string;

export interface CountryRule {
  name: string;
  minDigits: number;
  maxDigits: number;
  format: FormatFn;
}

export interface SupportedCountry {
  code: string;
  name: string;
  minDigits: number;
  maxDigits: number;
}

const COUNTRY_PHONE_RULES: Record<string, CountryRule> = {
  '+1': {
    name: 'US/Canada',
    minDigits: 10,
    maxDigits: 10,
    format: (number: string): string => {
      const digits = number.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  },
  '+44': {
    name: 'United Kingdom',
    minDigits: 10,
    maxDigits: 11,
    format: (number: string): string => {
      const digits = number.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }
  },
  '+86': {
    name: 'China',
    minDigits: 11,
    maxDigits: 11,
    format: (number: string): string => {
      const digits = number.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
    }
  },
  '+81': {
    name: 'Japan',
    minDigits: 10,
    maxDigits: 11,
    format: (number: string): string => {
      const digits = number.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
  }
};

const onlyDigits = (input: string): string => input.replace(/\D/g, '');

/** Validate by country rule; fallback is 7–15 digits. */
export function validateByCountry(phoneNumber: string, countryCode: string = '+1'): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  const digits = onlyDigits(phoneNumber);
  const rule = COUNTRY_PHONE_RULES[countryCode];
  if (!rule) return digits.length >= 7 && digits.length <= 15;
  return digits.length >= rule.minDigits && digits.length <= rule.maxDigits;
}

/** Format by country rule; unknown country returns digits only. */
export function formatByCountry(phoneNumber: string, countryCode: string = '+1'): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') return '';
  const digits = onlyDigits(phoneNumber);
  const rule = COUNTRY_PHONE_RULES[countryCode];
  if (!rule) return digits;
  const limitedDigits = digits.slice(0, rule.maxDigits);
  return rule.format(limitedDigits);
}

/** List supported countries. */
export function getSupportedCountries(): SupportedCountry[] {
  return Object.entries(COUNTRY_PHONE_RULES).map(([code, rule]) => ({
    code,
    name: rule.name,
    minDigits: rule.minDigits,
    maxDigits: rule.maxDigits
  }));
}

/** Get rule for a specific country. */
export function getCountryRule(countryCode: string): CountryRule | null {
  return COUNTRY_PHONE_RULES[countryCode] || null;
}

/** Strip non-digits and require ≥10 digits (NANP-style). */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
};

/** Progressive formatter to (xxx) xxx-xxxx. */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return phone;
  const [, area, exchange, number] = match;
  if (number) return `(${area}) ${exchange}-${number}`;
  if (exchange) return `(${area}) ${exchange}`;
  if (area) return `(${area}`;
  return cleaned;
};
