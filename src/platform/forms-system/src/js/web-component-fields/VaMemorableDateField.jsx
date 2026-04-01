import React from 'react';
import PropTypes from 'prop-types';
import { VaMemorableDate } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useVaDateCommon } from './useVaDateCommon';

/**
 * @param {WebComponentFieldProps} props
 */
export default function VaMemorableDateField(props) {
  const {
    mappedProps,
    formattedValue,
    onDateChange,
    onDateBlur,
  } = useVaDateCommon(props);

  const {
    customDayErrorMessage,
    customMonthErrorMessage,
    customYearErrorMessage,
  } = props.uiOptions;
  const removeDateHint = props.uiOptions?.removeDateHint;

  return (
    <VaMemorableDate
      {...mappedProps}
      externalValidation
      monthSelect={props.uiOptions?.monthSelect ?? true}
      onDateChange={onDateChange}
      onDateBlur={onDateBlur}
      value={formattedValue}
      {...customMonthErrorMessage && {
        customMonthErrorMessage,
      }}
      {...customDayErrorMessage && {
        customDayErrorMessage,
      }}
      {...customYearErrorMessage && {
        customYearErrorMessage,
      }}
      {...removeDateHint && {
        removeDateHint,
      }}
    />
  );
}

VaMemorableDateField.propTypes = {
  uiOptions: PropTypes.shape({
    customDayErrorMessage: PropTypes.string,
    customMonthErrorMessage: PropTypes.string,
    customYearErrorMessage: PropTypes.string,
    monthSelect: PropTypes.bool,
    removeDateHint: PropTypes.bool,
  }),
};

VaMemorableDateField.identifier = 'VaMemorableDateField';
