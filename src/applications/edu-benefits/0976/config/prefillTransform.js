export default function prefillTransformer(pages, formData, metadata) {
  const { first, last } = formData.applicantName;

  return {
    metadata,
    formData: {
      authorizingOfficial: {
        fullName: {
          first,
          last,
        },
      },
      prefilledFirstName: first,
      prefilledLastName: last,
    },
    pages,
  };
}
