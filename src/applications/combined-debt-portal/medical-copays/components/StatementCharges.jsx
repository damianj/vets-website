import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { subDays } from 'date-fns';
import { formatDate } from '../../combined/utils/helpers';
import Pagination from '../../combined/components/Pagination';
import usePagination from '../../combined/hooks/usePagination';

const StatementCharges = ({ copay, showCurrentStatementHeader = false }) => {
  const tableRef = useRef(null);
  const initialDate = new Date(copay.pSStatementDateOutput);
  const statementDate = formatDate(initialDate);
  const previousCopayStartDate = formatDate(subDays(initialDate, 30));

  // Filter out empty charges
  const filteredDetails = copay.details.filter(
    item =>
      typeof item.pDTransDescOutput === 'string' &&
      item.pDTransDescOutput.replace(/&nbsp;/g, '').trim() !== '',
  );

  const ITEM_TYPE = 'charges';

  // Customize this hook with itemsPerPage/MAX_ROWS as second param if needed
  const pagination = usePagination(filteredDetails);
  const paginationText = pagination.getPaginationText(ITEM_TYPE);

  const getStatementDateRange = () => {
    if (!previousCopayStartDate || !statementDate) {
      return 'This statement shows your current charges.';
    }

    return `This statement shows charges you received between ${previousCopayStartDate} and ${statementDate}.`;
  };

  return (
    <>
      <h2
        data-testid="statement-charges-head"
        id="statement-charges"
        className="vads-u-margin-bottom--0"
      >
        {showCurrentStatementHeader
          ? 'Most recent statement charges'
          : 'Statement Charges'}
      </h2>
      <div key={`table-wrapper-${pagination.currentPage}`}>
        <va-table
          ref={tableRef}
          id="statement-charges-table"
          data-testid="statement-charges-table"
          tabindex={pagination.hasPagination ? '-1' : undefined}
          table-title={getStatementDateRange()}
          table-title-summary={paginationText}
          uswds
          table-type="bordered"
          full-width
          class="vads-u-display--block"
        >
          <va-table-row slot="headers">
            <span>Description</span>
            <span className="vads-u-width--fit">Billing reference</span>
            <span className="vads-u-width--fit">Amount</span>
          </va-table-row>
          {pagination.currentItems.map((charge, index) => (
            <va-table-row key={index}>
              <span data-testid="statement-charges-description">
                {charge.pDTransDescOutput.replace(/&nbsp;/g, ' ')}
              </span>
              <span
                data-testid="statement-charges-reference"
                className="vads-u-width--fit"
              >
                {charge.pDRefNo}
              </span>
              <span
                data-testid="statement-charges-transaction-amount"
                className="vads-u-width--fit"
              >
                $
                {charge.pDTransAmtOutput
                  .replace('&nbsp', ' ')
                  .replace('-', '')
                  .replace(/[^\d.-]/g, '')}
              </span>
            </va-table-row>
          ))}
        </va-table>
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={page => pagination.onPageChangeWFocus(page, tableRef)}
        ariaLabel="Statement charges pagination navigation"
      />
    </>
  );
};

StatementCharges.propTypes = {
  copay: PropTypes.object,
  showCurrentStatementHeader: PropTypes.bool,
};

export default StatementCharges;
