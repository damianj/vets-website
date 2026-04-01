import PropTypes from 'prop-types';
import React from 'react';
import {
  formatAddress,
  NOT_SHARED,
  OPTION_YES_LABEL,
  safeParse,
} from '../FormFields/AddressSelectionField';
import content from '../../locales/en/content.json';

export const REVIEW_OPTION_NO = content['review--no-option'];

export const formatDataValue = value => {
  if (!value || value === NOT_SHARED) return REVIEW_OPTION_NO;

  const parsed = safeParse(value);
  const addr = parsed ? formatAddress(parsed) : String(value);
  return `${OPTION_YES_LABEL} ${addr}`;
};

const AddressSelectionReviewField = ({ children }) => {
  const { formData, uiSchema } = children.props;
  const dataValue = formatDataValue(formData);
  return (
    <div className="review-row">
      <dt>{uiSchema['ui:title']}</dt>
      <dd
        className="dd-privacy-hidden"
        data-dd-action-name="data value"
        style={{ minWidth: '5%' }}
      >
        {dataValue}
      </dd>
    </div>
  );
};

AddressSelectionReviewField.propTypes = {
  children: PropTypes.shape({
    props: PropTypes.shape({
      formData: PropTypes.string,
      uiSchema: PropTypes.shape({
        'ui:title': PropTypes.string,
      }),
    }),
  }),
};

export default AddressSelectionReviewField;
