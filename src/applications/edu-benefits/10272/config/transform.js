import { cloneDeep } from 'lodash';
import { transformForSubmit } from 'platform/forms-system/src/js/helpers';
import {
  todaysDate,
  transformMailingAddress,
  transformPhoneNumberObject,
} from '../helpers';

export default function transform(formConfig, form) {
  // Formats the user's contact information from the *profileContactInfoPages*
  const applicantTransform = formData => {
    let clonedData = cloneDeep(formData);

    const {
      mailingAddress,
      homePhone,
      mobilePhone,
      email,
    } = clonedData.veteran;

    clonedData = {
      ...clonedData,
      mailingAddress: transformMailingAddress(mailingAddress),
      homePhone: transformPhoneNumberObject(homePhone),
      mobilePhone: transformPhoneNumberObject(mobilePhone),
      emailAddress: email?.emailAddress || null,
    };
    delete clonedData.veteran;

    return clonedData;
  };

  // The ssn is used as *vaFileNumber* if no vaFileNumber is available from prefill
  const identifierTransform = formData => {
    const clonedData = cloneDeep(formData);

    if (!clonedData.vaFileNumber) {
      clonedData.vaFileNumber = clonedData.ssn;
    }

    delete clonedData.ssn;
    delete clonedData.ssnLast4;
    delete clonedData.vaFileNumberLast4;

    return clonedData;
  };

  // Prep course cost must be sent as a number (or decimal in this case)
  const prepCourseTransform = formData => {
    const clonedData = cloneDeep(formData);

    clonedData.prepCourseCost = parseFloat(clonedData.prepCourseCost);

    return clonedData;
  };

  // Removes the signature from the privacy agreement and sets the *dateSigned* as the current date
  const privacyAgreementTransform = formData => {
    const clonedData = cloneDeep(formData);

    delete clonedData.statementOfTruthCertified;

    return {
      ...clonedData,
      dateSigned: todaysDate(),
    };
  };

  // Stringifies the form data and removes empty fields
  const usFormTransform = formData =>
    transformForSubmit(
      formConfig,
      { ...form, data: formData },
      { allowPartialAddress: true },
    );

  const transformedData = [
    applicantTransform,
    identifierTransform,
    prepCourseTransform,
    privacyAgreementTransform,
    usFormTransform, // this must appear last
  ].reduce((formData, transformer) => transformer(formData), form.data);

  return JSON.stringify({
    educationBenefitsClaim: {
      form: transformedData,
    },
  });
}
