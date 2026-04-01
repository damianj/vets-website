import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { capitalizeFirstLetter } from '../helpers';

const AdditionalOfficialBenefitStatusTitle = ({ formContext }) => {
  const formState = useSelector(state => state?.form?.data || {});
  const index = formContext.pagePerItemIndex;
  const official = Array.isArray(formState.additionalCertifyingOfficials)
    ? formState.additionalCertifyingOfficials[index]?.additionalOfficialDetails
    : {};
  const firstName = official?.fullName?.first;
  const lastName = official?.fullName?.last;
  return (
    <h3 className="vads-u-color--gray-dark vads-u-margin-top--0">
      {firstName && lastName
        ? `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(
            lastName,
          )}'s VA benefit status`
        : 'VA benefit status'}
    </h3>
  );
};

AdditionalOfficialBenefitStatusTitle.propTypes = {
  formContext: PropTypes.shape({
    pagePerItemIndex: PropTypes.string,
  }),
};

export default AdditionalOfficialBenefitStatusTitle;
