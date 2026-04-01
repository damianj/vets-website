import Handlebars from 'handlebars';
import { format, parseISO } from 'date-fns';

Handlebars.registerHelper('lastFour', ssn => ssn.slice(-4));
Handlebars.registerHelper('formatDate', iso8601 =>
  format(parseISO(iso8601), 'MMMM d, yyyy'),
);
Handlebars.registerHelper('formatBool', (bool, yes, no) => (bool ? yes : no));
Handlebars.registerHelper('multilineList', (list, options) => {
  let processedList = list;
  if (options.hash.pluck) {
    processedList = list?.map(item => item[options.hash.pluck]);
  }
  return processedList?.join('\n');
});

const MILITARY_PO_MAP = {
  APO: 'APO (Air or Army post office)',
  FPO: 'FPO (Fleet post office)',
  DPO: 'DPO (Diplomatic post office)',
};

const STATE_NAME_MAP = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
  AS: 'American Samoa',
  GU: 'Guam',
  MP: 'Northern Mariana Islands',
  PR: 'Puerto Rico',
  VI: 'U.S. Virgin Islands',
  UM: 'U.S. Minor Outlying Islands',
  AA: 'AA (Armed Forces America) - North and South America, excluding Canada',
  AE: 'AE (Armed Forces Europe) - Africa, Canada, Europe, and the Middle East',
  AP: 'AP (Armed Forces Pacific) - Pacific',
};

export function formatDateValue(value) {
  try {
    return format(parseISO(value), 'MMMM d, yyyy');
  } catch {
    return value;
  }
}

export function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, part) => {
    return current && current[part]; // Safely access property, handle undefined
  }, obj);
}

export function renderStr(str, data) {
  if (!str) {
    return 'UNDEFINED HANDLEBARS TEMPLATE';
  }
  return Handlebars.compile(str)(data);
}

export function formatPhoneNumber(phoneNumberString) {
  const cleaned = `${phoneNumberString}`.replace(/\D/g, '');
  if (cleaned.length === 10) {
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumberString;
  }
  return phoneNumberString;
}

export function formatSSN(ssn) {
  if (!ssn || typeof ssn !== 'string') {
    return '';
  }

  const digitsOnly = ssn.replace(/\D/g, '');

  if (digitsOnly.length !== 9) {
    return ssn;
  }

  return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
    3,
    5,
  )}-${digitsOnly.slice(5, 9)}`;
}

export function formatInternationalPhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '';
  }

  const digitsOnly = phoneNumber.replace(/\D/g, '');

  if (digitsOnly.length < 8) {
    return phoneNumber;
  }

  const countryCode = digitsOnly.slice(0, 1);
  const mainNumber = digitsOnly.slice(1);

  const formatted = `${mainNumber.slice(0, 3)}-${mainNumber.slice(
    3,
    6,
  )}-${mainNumber.slice(6)}`;

  return `+${countryCode}-${formatted}`;
}

export function formatMilitaryPostOffice(militaryPo) {
  if (!militaryPo || typeof militaryPo !== 'string') {
    return '';
  }
  const normalized = militaryPo.trim().toUpperCase();
  return MILITARY_PO_MAP[normalized] ?? militaryPo;
}

export function formatStateName(state) {
  if (!state || typeof state !== 'string') {
    return '';
  }

  const normalized = state.trim().toUpperCase();
  return STATE_NAME_MAP[normalized] ?? state;
}
