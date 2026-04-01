// components/ClaimantDetailRow.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ClaimantDetailRow = ({ label, value, className = '' }) => (
  <li className={`claimant-detail-row ${className}`}>
    <p className="claimant-detail-row__label">{label}</p>
    <div className="claimant-detail-row__value">{value ?? '—'}</div>
  </li>
);

ClaimantDetailRow.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
  className: PropTypes.string,
};

export default ClaimantDetailRow;
