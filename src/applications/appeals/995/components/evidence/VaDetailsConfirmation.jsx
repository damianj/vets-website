import React from 'react';
import PropTypes from 'prop-types';
import {
  BEFORE_2005,
  LATER_THAN_2005,
  confirmationText,
} from '../../content/evidence/va';
import { formatMonthYearToReadableString } from '../../../shared/utils/dates';
import {
  SECTION_HEADER_CLASSES,
  VALUE_CLASSES_NO_BOLD,
} from '../../../shared/constants';

export const VaDetailsConfirmation = ({ list = [] }) => {
  if (!list?.length) {
    return null;
  }

  const getTreatmentDate = (treatmentBefore2005, treatmentMonthYear) => {
    if (treatmentBefore2005 === 'Y') {
      return `${BEFORE_2005}, ${formatMonthYearToReadableString(
        treatmentMonthYear,
      )}`;
    }

    return LATER_THAN_2005;
  };

  return (
    <>
      <h4 className={SECTION_HEADER_CLASSES}>{confirmationText.title}</h4>
      {list.map((location, index) => {
        const {
          treatmentBefore2005,
          treatmentMonthYear = '',
          vaTreatmentLocation,
        } = location || {};

        return (
          <div
            key={vaTreatmentLocation + index}
            className={`vads-u-margin-bottom--2${
              index === list.length - 1 ? ' vads-u-margin-bottom--3' : ''
            }`}
          >
            <h5 className="vads-u-margin-top--2 vads-u-margin-bottom--1 vads-u-font-family--sans vads-u-font-size--md">
              {vaTreatmentLocation}
            </h5>
            <p className={VALUE_CLASSES_NO_BOLD}>
              {getTreatmentDate(treatmentBefore2005, treatmentMonthYear)}
            </p>
          </div>
        );
      })}
    </>
  );
};

VaDetailsConfirmation.propTypes = {
  list: PropTypes.array,
};
