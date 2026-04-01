import sharedTransformForSubmit from '../../shared/config/submit-transformer';

const transformForSubmit = (formConfig, form) => {
  const idNumber = form.data?.idNumber;
  const dateOfBirth = form.data?.dateOfBirth;
  const transformedData = JSON.parse(
    sharedTransformForSubmit(formConfig, form),
  );
  const { first, middle, last } = transformedData.fullName || {};

  if (first || last) {
    transformedData.fullName = {
      first: first?.slice(0, 12),
      last: last?.slice(0, 18),
      ...(middle && { middle: middle.charAt(0) }),
    };
  } else {
    transformedData.fullName = {};
  }
  if (!transformedData.dateOfBirth && dateOfBirth) {
    transformedData.dateOfBirth = dateOfBirth;
  }

  if (!transformedData.idNumber?.ssn && idNumber?.ssn) {
    transformedData.idNumber = idNumber;
  }

  return JSON.stringify(transformedData);
};

export default transformForSubmit;
