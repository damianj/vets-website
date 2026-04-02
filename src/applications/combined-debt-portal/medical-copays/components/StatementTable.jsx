import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  formatDate,
  formatISODateToMMDDYYYY,
  showVHAPaymentHistory,
} from '../../combined/utils/helpers';
import Pagination from '../../combined/components/Pagination';
import usePagination from '../../combined/hooks/usePagination';

const StatementTable = ({ charges, formatCurrency, selectedCopay }) => {
  const shouldShowVHAPaymentHistory = showVHAPaymentHistory(
    useSelector(state => state),
  );
  const columns = ['Date', 'Description', 'Billing Reference', 'Amount'];

  const normalizedCharges = shouldShowVHAPaymentHistory
    ? charges.map(item => ({
        date: item.datePosted,
        description: item.description,
        reference: selectedCopay.attributes.billNumber,
        amount: item.priceComponents?.[0]?.amount ?? 0,
        provider: item.providerName,
        details: [],
      }))
    : charges.map(charge => ({
        date: charge.pDDatePostedOutput,
        description: charge.pDTransDescOutput,
        reference: charge.pDRefNo,
        amount: charge.pDTransAmt,
        provider: charge.provider,
        details: charge.details ?? [],
      }));

  const filteredCharges = normalizedCharges.filter(
    charge =>
      typeof charge.description === 'string' &&
      !charge.description.startsWith('&nbsp;'),
  );

  const tableRef = useRef(null);

  const ITEM_TYPE = 'charges';

  // Customize this hook with itemsPerPage/MAX_ROWS as second param if needed
  const pagination = usePagination(filteredCharges);
  const paginationText = pagination.getPaginationText(ITEM_TYPE);

  const getStatementDateRange = () => {
    const startDate = formatDate(selectedCopay.statementStartDate);
    const endDate = formatDate(selectedCopay.statementEndDate);

    if (!startDate || !endDate) {
      return 'This statement shows your current charges.';
    }

    return `This statement shows charges you received between ${startDate} and ${endDate}.`;
  };

  const renderDescription = charge => (
    <div>
      <div>
        <strong>{charge.description?.replace(/&nbsp;/g, ' ')}</strong>
      </div>
      {charge.provider && (
        <div
          className="vads-u-color--gray-medium vads-u-font-size--sm"
          data-testid="provider-info"
        >
          Provider: {charge.provider}
        </div>
      )}
      {charge.rxNumber && (
        <div className="vads-u-color--gray-medium vads-u-font-size--sm">
          RX#: {charge.rxNumber}
        </div>
      )}
      {charge.supplyInfo && (
        <div className="vads-u-color--gray-medium vads-u-font-size--sm">
          {charge.supplyInfo}
        </div>
      )}
      {charge.prescribedBy && (
        <div className="vads-u-color--gray-medium vads-u-font-size--sm">
          Prescribed by {charge.prescribedBy}
        </div>
      )}
      {charge.details?.map((detail, index) => (
        <div
          key={index}
          className="vads-u-color--gray-medium vads-u-font-size--sm"
        >
          {detail}
        </div>
      ))}
    </div>
  );

  const getDate = charge => {
    if (shouldShowVHAPaymentHistory) {
      return formatISODateToMMDDYYYY(charge.date);
    }

    if (charge.date) {
      return formatDate(charge.date);
    }

    if (charge.description?.toLowerCase().includes('interest/adm')) {
      return selectedCopay?.pSStatementDateOutput;
    }

    return '—';
  };

  const getReference = charge => {
    if (charge.reference) return charge.reference;

    if (charge.description?.toLowerCase().includes('interest/adm')) {
      return selectedCopay?.pSStatementVal;
    }

    return '—';
  };

  return (
    <>
      <h2
        data-testid="statement-charges-head"
        id="statement-charges"
        className="vads-u-margin-bottom--0"
      >
        Most recent statement charges
      </h2>

      <div key={`table-wrapper-${pagination.currentPage}`}>
        <va-table
          ref={tableRef}
          id="statement-charges-table"
          tabindex={pagination.hasPagination ? '-1' : undefined}
          table-title={getStatementDateRange()}
          table-title-summary={paginationText}
          scrollable={false}
          table-type="bordered"
          full-width
          unbounded
          class="vads-u-display--block"
        >
          <va-table-row>
            {columns.map((col, index) => (
              <span key={`table-header-${index}`}>{col}</span>
            ))}
          </va-table-row>
          {pagination.currentItems.map((charge, index) => (
            <va-table-row key={index}>
              <span data-testId="statement-date">{getDate(charge)}</span>
              <span data-testId="statement-description">
                {renderDescription(charge)}
              </span>
              <span data-testId="statement-reference">
                {getReference(charge)}
              </span>
              <span data-testId="statement-transaction-amount">
                {formatCurrency(charge.amount)}
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
        ariaLabel="Most recent statement charges pagination navigation"
      />
    </>
  );
};

/** Medical copays v1 `attributes` (Invoice / list item response). */
const v1NullableString = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.oneOf([null]),
]);

const medicalCopayV1Attributes = PropTypes.shape({
  url: v1NullableString,
  facility: PropTypes.string,
  facilityId: PropTypes.string,
  city: PropTypes.string,
  currentBalance: PropTypes.number,
  externalId: PropTypes.string,
  invoiceDate: PropTypes.string,
  lastUpdatedAt: v1NullableString,
  latestBillingRef: PropTypes.string,
  previousBalance: PropTypes.number,
  previousUnpaidBalance: PropTypes.number,
  /** Used for billing reference column when present on the resource. */
  billNumber: PropTypes.string,
});

StatementTable.propTypes = {
  formatCurrency: PropTypes.func.isRequired,
  charges: PropTypes.arrayOf(
    PropTypes.shape({
      details: PropTypes.arrayOf(PropTypes.string),
      pDDatePosted: PropTypes.string,
      pDDatePostedOutput: PropTypes.string,
      pDRefNo: PropTypes.string,
      pDTransAmt: PropTypes.number,
      pDTransAmtOutput: PropTypes.string,
      pDTransDesc: PropTypes.string,
      pDTransDescOutput: PropTypes.string,
      prescribedBy: PropTypes.string,
      provider: PropTypes.string,
      rxNumber: PropTypes.string,
      supplyInfo: PropTypes.string,
    }),
  ),
  selectedCopay: PropTypes.shape({
    attributes: medicalCopayV1Attributes,
    pHNewBalance: PropTypes.number,
    pHPrevBal: PropTypes.number,
    pHTotCredits: PropTypes.number,
    pSStatementDateOutput: PropTypes.string,
    pSStatementVal: PropTypes.string,
    statementEndDate: PropTypes.string,
    statementStartDate: PropTypes.string,
  }),
};

export default StatementTable;
