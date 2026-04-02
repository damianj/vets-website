export default function prefillTransformer(pages, formData, metadata, state) {
  const profile = state?.user?.profile || {};
  const isUserVeteran = profile?.veteranStatus?.isVeteran === true;
  const userFullName = profile.userFullName || {};
  const dateOfBirth = profile.dob || '';
  const vet360 = profile.vet360ContactInformation || {};

  return {
    pages,
    formData: {
      ...formData,
      'view:userIsVeteran': isUserVeteran,
      'view:profileFullName': {
        first: userFullName.first || '',
        middle: userFullName.middle || '',
        last: userFullName.last || '',
      },
      fullName: isUserVeteran
        ? {
            first: userFullName.first || formData?.fullName?.first,
            middle: userFullName.middle || formData?.fullName?.middle,
            last: userFullName.last || formData?.fullName?.last,
          }
        : formData?.fullName,
      dateOfBirth: dateOfBirth || formData?.dateOfBirth,
      ...((formData?.veteran?.ssn || formData?.idNumber?.ssn) && {
        idNumber: { ssn: formData?.veteran?.ssn || formData?.idNumber?.ssn },
      }),
      veteran: {
        mailingAddress: vet360.mailingAddress || {},
        mobilePhone: vet360.mobilePhone || {},
        homePhone: vet360.homePhone || {},
        email: vet360.email || {},
        ...(formData?.veteran?.ssn && { ssn: formData.veteran.ssn }),
      },
    },
    metadata,
  };
}
