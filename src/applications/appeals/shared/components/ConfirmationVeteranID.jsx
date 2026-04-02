import React from 'react';
import PropTypes from 'prop-types';
import { renderFullName, maskVafn } from '../utils/data';
import { getReadableDate } from '../utils/dates';
import { LABEL_CLASSES, VALUE_CLASSES } from '../constants';

export const ConfirmationVeteranID = ({
  dob,
  userFullName = {},
  vaFileLastFour,
}) => (
  <>
    <dt className={LABEL_CLASSES}>Name</dt>
    {renderFullName(userFullName)}
    {vaFileLastFour && (
      <>
        <dt className={LABEL_CLASSES}>VA file number</dt>
        <dd className={VALUE_CLASSES} data-dd-action-name="VA file number">
          {maskVafn(vaFileLastFour || '')}
        </dd>
      </>
    )}
    <dt className={LABEL_CLASSES}>Date of birth</dt>
    <dd className={VALUE_CLASSES} data-dd-action-name="date of birth">
      {getReadableDate(dob)}
    </dd>
  </>
);

ConfirmationVeteranID.propTypes = {
  dob: PropTypes.string,
  userFullName: PropTypes.shape({}),
  vaFileLastFour: PropTypes.string,
};
