import React from 'react';
import PropTypes from 'prop-types';
import { VaPagination } from '@department-of-veterans-affairs/component-library/dist/react-bindings';

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
  ariaLabel = 'Pagination navigation',
  ...props
}) => {
  // Don't render pagination if there's only one page or no items
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const handlePageSelect = event => {
    onPageChange(event.detail.page);
  };

  return (
    <div className={`pagination-container ${className}`} {...props}>
      <VaPagination
        onPageSelect={handlePageSelect}
        page={currentPage}
        pages={totalPages}
        aria-label={ariaLabel}
      />
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
};

export default Pagination;
