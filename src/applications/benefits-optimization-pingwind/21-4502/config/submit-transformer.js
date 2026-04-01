/* eslint-disable camelcase */
import sharedTransformForSubmit from '../../shared/config/submit-transformer';
import {
  applicationInfoFields,
  veteranFields,
  BRANCH_OF_SERVICE,
  CONVEYANCE_TYPES,
} from '../definitions/constants';

const stringOrUndefined = value => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
};

const pruneEmpty = value => {
  if (Array.isArray(value)) {
    const pruned = value
      .map(item => pruneEmpty(item))
      .filter(item => item != null && item !== '');
    return pruned.length ? pruned : undefined;
  }
  if (value && typeof value === 'object') {
    const pruned = Object.entries(value).reduce((acc, [k, v]) => {
      const p = pruneEmpty(v);
      if (p !== undefined) acc[k] = p;
      return acc;
    }, {});
    return Object.keys(pruned).length ? pruned : undefined;
  }
  if (value === undefined || value === null || value === '') return undefined;
  return value;
};

const buildAddress = address => {
  if (!address || typeof address !== 'object') return undefined;
  const rawCountry = stringOrUndefined(address.country) || 'USA';
  const country = rawCountry === 'US' ? 'USA' : rawCountry;
  const result = {
    street: stringOrUndefined(address.street),
    street2: stringOrUndefined(address.street2),
    city: stringOrUndefined(address.city),
    state: stringOrUndefined(address.state),
    postal_code: stringOrUndefined(address.postalCode),
    country,
  };
  return pruneEmpty(result);
};

// Schema fullName: first, middleinitial, last (no suffix)
const buildFullName = fullName => {
  if (!fullName || typeof fullName !== 'object') return undefined;
  const { middle } = fullName;
  const normalizedMiddle =
    typeof middle === 'string' && middle.trim().length > 0
      ? middle.trim().charAt(0)
      : undefined;
  return pruneEmpty({
    first: stringOrUndefined(fullName.first),
    middle: normalizedMiddle,
    last: stringOrUndefined(fullName.last),
  });
};

const splitPhone = phone => {
  if (phone == null) return undefined;

  let raw = '';
  let countryCode;

  if (typeof phone === 'string') {
    raw = phone;
  } else if (typeof phone === 'object' && phone.contact) {
    raw = String(phone.contact);
    countryCode = phone.callingCode;
  }

  const digits = (raw || '').replace(/\D/g, '');

  let normalizedDigits = digits;
  if (digits.length === 11 && digits[0] === '1') {
    normalizedDigits = digits.slice(1);
    if (countryCode == null) {
      countryCode = 1;
    }
  }

  if (normalizedDigits.length !== 10) {
    return undefined;
  }

  const result = {
    area_code: normalizedDigits.slice(0, 3),
    number: normalizedDigits.slice(3),
  };

  if (countryCode != null) {
    result.country_code = String(countryCode);
  }

  return result;
};

const mapBranchOfService = value => {
  if (!value) return undefined;
  return BRANCH_OF_SERVICE[value] || value;
};

const mapVehicleType = applicationInfo => {
  const type = applicationInfo?.[applicationInfoFields.conveyanceType];
  if (!type) return undefined;

  if (type === 'other') {
    return stringOrUndefined(
      applicationInfo?.[applicationInfoFields.conveyanceTypeOther],
    );
  }

  return CONVEYANCE_TYPES[type] || type;
};

const buildInternationalPhone = phone => {
  const parsed = splitPhone(phone);
  if (!parsed) {
    return undefined;
  }

  if (!parsed.country_code && phone?.callingCode != null) {
    parsed.country_code = String(phone.callingCode);
  }

  return parsed;
};

const buildDomesticPhone = phone => {
  const parsed = splitPhone(phone);
  if (!parsed) {
    return undefined;
  }

  delete parsed.country_code;
  return parsed;
};

const booleanOrUndefined = value => {
  if (typeof value === 'boolean') {
    return value;
  }
  return undefined;
};

const buildSubmissionPayload = data => {
  const veteran = data?.veteran || {};
  const applicationInfo = data?.applicationInfo || {};
  const statementOfTruthSignature = stringOrUndefined(
    data.statementOfTruthSignature,
  );

  const payload = {
    form_number: data.formNumber,
    full_name: buildFullName(veteran.fullName),
    dob: stringOrUndefined(veteran.dateOfBirth),
    ssn: stringOrUndefined(veteran.ssn),
    va_file_number: stringOrUndefined(veteran.vaFileNumber),
    va_service_number: stringOrUndefined(veteran.veteranServiceNumber),
    phone_number: buildDomesticPhone(veteran.homePhone),
    international_phone_number: buildInternationalPhone(veteran.alternatePhone),
    email: stringOrUndefined(veteran.email),
    electronic_correspondence: booleanOrUndefined(
      veteran[veteranFields.agreeToElectronicCorrespondence],
    ),
    current_mailing_address: buildAddress(veteran.address),
    planned_mailing_address: buildAddress(veteran.plannedAddress),
    branch_of_service: mapBranchOfService(
      applicationInfo[applicationInfoFields.branchOfService],
    ),
    active_duty: booleanOrUndefined(
      applicationInfo[applicationInfoFields.currentlyOnActiveDuty],
    ),
    place_of_entry: stringOrUndefined(
      applicationInfo[applicationInfoFields.placeOfEntry],
    ),
    date_of_entry: stringOrUndefined(
      applicationInfo[applicationInfoFields.dateOfEntry],
    ),
    place_of_release: stringOrUndefined(
      applicationInfo[applicationInfoFields.placeOfRelease],
    ),
    date_of_release: stringOrUndefined(
      applicationInfo[applicationInfoFields.dateOfRelease],
    ),
    applied_for_compensation: booleanOrUndefined(
      applicationInfo[applicationInfoFields.appliedDisabilityCompensation],
    ),
    date_applied_for_compensation: stringOrUndefined(
      applicationInfo[applicationInfoFields.dateApplied],
    ),
    location_of_office: stringOrUndefined(
      applicationInfo[applicationInfoFields.vaOfficeLocation],
    ),
    vehicle_type: mapVehicleType(applicationInfo),
    previously_applied: booleanOrUndefined(
      applicationInfo[applicationInfoFields.previouslyAppliedConveyance],
    ),
    date_of_previous_application: stringOrUndefined(
      applicationInfo[applicationInfoFields.previouslyAppliedDate],
    ),
    previous_application_location: stringOrUndefined(
      applicationInfo[applicationInfoFields.previouslyAppliedPlace],
    ),
    veteran_will_operate_vehicle:
      applicationInfo[applicationInfoFields.driverOrPassenger] === 'driver',
    statement_of_truth_signature: statementOfTruthSignature,
    signature_date: (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(now.getDate()).padStart(2, '0')}`;
    })(),
  };

  return pruneEmpty(payload) || {};
};

export default function transformForSubmit(formConfig, form) {
  const transformed = JSON.parse(
    sharedTransformForSubmit(formConfig, form, {
      allowPartialAddress: true,
    }),
  );

  const payload = buildSubmissionPayload(transformed);

  return JSON.stringify(payload);
}
