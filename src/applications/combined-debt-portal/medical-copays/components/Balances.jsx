import React from 'react';
import { getMedicalCenterNameByID } from 'platform/utilities/medical-centers/medical-centers';
import PropTypes from 'prop-types';
import BalanceCard from './BalanceCard';
import { formatISODateToMMDDYYYY } from '../../combined/utils/helpers';
import ZeroBalanceCopayCard from './ZeroBalanceCopayCard';

export const Balances = ({ statements, showVHAPaymentHistory = false }) => {
  const getNormalizedCopayBalance = copay => {
    return showVHAPaymentHistory
      ? {
          facilityName:
            copay.attributes.facility ||
            getMedicalCenterNameByID(copay.attributes.facility),
          remainingBalance: copay.attributes.currentBalance,
          lastUpdatedAt: formatISODateToMMDDYYYY(
            copay.attributes.lastUpdatedAt,
          ),
          city: copay.attributes.city,
        }
      : {
          facilityName:
            copay.station.facilityName ||
            getMedicalCenterNameByID(copay.station.facilityNum),
          remainingBalance: copay.pHAmtDue,
          lastUpdatedAt: copay.pSStatementDateOutput,
          city: copay.station.city,
        };
  };

  return (
    <>
      <ul className="no-bullets vads-u-padding-x--0">
        {statements?.map((balance, idx) => {
          const {
            facilityName,
            remainingBalance,
            lastUpdatedAt,
            city,
          } = getNormalizedCopayBalance(balance);

          return (
            <li key={idx} className="vads-u-max-width--none">
              {remainingBalance > 0 ? (
                <BalanceCard
                  id={balance.id}
                  amount={remainingBalance}
                  date={lastUpdatedAt}
                  city={city}
                  facility={facilityName}
                  key={balance.id ? balance.id : `${idx}-${facilityName}`}
                />
              ) : (
                <ZeroBalanceCopayCard
                  id={balance.id}
                  facility={facilityName}
                  city={city}
                  updatedDate={lastUpdatedAt}
                />
              )}
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
