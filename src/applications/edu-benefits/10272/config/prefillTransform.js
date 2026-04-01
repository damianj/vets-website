export default function prefillTransformer(pages, formData, metadata) {
  // Remove suffix to match the *fullNameNoSuffix* schema definition
  const { first, middle, last } = formData.applicantName;

  return {
    metadata,
    formData: {
      applicantName: { first, middle, last },
      // ssn/vaLast4 fields used to display on profilePersonalInfoPage and its review page component
      ssn: formData.ssn,
      ssnLast4: formData.ssn ? formData.ssn.slice(-4) : null,
      vaFileNumber: formData.vaFileNumber,
      vaFileNumberLast4: formData.vaFileNumber
        ? formData.vaFileNumber.slice(-4)
        : null,
    },
    pages,
  };
}
