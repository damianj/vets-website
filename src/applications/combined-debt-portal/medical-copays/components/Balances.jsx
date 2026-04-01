import React from 'react';
import { getMedicalCenterNameByID } from 'platform/utilities/medical-centers/medical-centers';
import PropTypes from 'prop-types';
import BalanceCard from './BalanceCard';
import { formatISODateToMMDDYYYY } from '../../combined/utils/helpers';

export const Balances = ({ statements, showVHAPaymentHistory = false }) => {
  return (
    <>
      <ul className="no-bullets vads-u-padding-x--0">
        {statements?.map((balance, idx) => {
          const facilityName = showVHAPaymentHistory
            ? balance.attributes.facility ||
              getMedicalCenterNameByID(balance.attributes.facility)
            : balance.station.facilityName ||
              getMedicalCenterNameByID(balance.station.facilityNum);

          return (
            <li key={idx} className="vads-u-max-width--none">
              <BalanceCard
                id={balance.id}
                amount={
                  showVHAPaymentHistory
                    ? balance.attributes.currentBalance
                    : balance.pHAmtDue
                }
                date={
                  showVHAPaymentHistory
                    ? formatISODateToMMDDYYYY(balance.attributes.lastUpdatedAt)
                    : balance.pSStatementDateOutput
                }
                city={
                  showVHAPaymentHistory
                    ? balance.attributes?.city
                    : balance.station.city
                }
                facility={facilityName}
                key={balance.id ? balance.id : `${idx}-${facilityName}`}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
};

Balances.propTypes = {
  showVHAPaymentHistory: PropTypes.bool,
  statements: PropTypes.array,
};

export default Balances;
