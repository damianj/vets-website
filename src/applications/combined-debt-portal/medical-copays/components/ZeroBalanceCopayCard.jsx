import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import recordEvent from '~/platform/monitoring/record-event';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles/useFeatureToggle';
import {
  VaLoadingIndicator,
  VaLink,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useTranslation, Trans } from 'react-i18next';
import {
  currency,
  formatDate,
  showVHAPaymentHistory,
} from '../../combined/utils/helpers';
import { getCopayDetailStatement } from '../../combined/actions/copays';

const ZeroBalanceContent = ({ updatedDate }) => (
  <p className="vads-u-margin--0">
    <Trans
      i18nKey="mcp.copay-balances.zero-balance-card.no-payment-needed"
      values={{ amount: currency(0.0), date: formatDate(updatedDate) }}
    />
  </p>
);

ZeroBalanceContent.propTypes = {
  id: PropTypes.string,
  updatedDate: PropTypes.string,
};

const ZeroBalanceCopayCard = ({ id, facility, city, updatedDate }) => {
  const { t } = useTranslation();

  const shouldShowVHAPaymentHistory = showVHAPaymentHistory(
    useSelector(state => state),
  );

  const history = useHistory();
  const dispatch = useDispatch();

  const { useToggleLoadingValue } = useFeatureToggle();
  const togglesLoading = useToggleLoadingValue();

  // give features a chance to fully load before we conditionally render
  if (togglesLoading) {
    return <VaLoadingIndicator message="Loading features..." />;
  }

  return (
    <va-card
      show-shadow
      class="vads-u-padding--3 vads-u-margin-bottom--3"
      data-testid={`balance-card-${id}`}
    >
      <h3
        data-testid={`facility-city-${id}`}
        className="vads-u-margin-top--0 vads-u-margin-bottom--1p5"
      >
        {t('mcp.copay-balances.zero-balance-card.facility-city', {
          facility,
          city,
        })}
      </h3>
      <p
        className="vads-u-margin-top--0 vads-u-margin-bottom--1p5 vads-u-font-size--h4 vads-u-font-family--serif"
        data-testid={`amount-${id}`}
      >
        <span className="vads-u-font-weight--normal">
          <Trans
            i18nKey="mcp.copay-balances.zero-balance-card.current-balance"
            values={{ amount: currency(0.0) }}
            components={{ bold: <strong /> }}
          />
        </span>
      </p>
      <div className="vads-u-display--flex vads-u-margin-top--0  vads-u-margin-bottom--1p5">
        <va-icon
          icon="info"
          size={3}
          srtext="Information"
          class="icon-color--info vads-u-padding-right--1"
        />
        <ZeroBalanceContent id={id} updatedDate={updatedDate} />
      </div>
      <div className="vads-u-display--flex vads-u-flex-direction--column">
        <p className="vads-u-margin--0">
          <VaLink
            active
            data-testid={`detail-link-${id}`}
            onClick={event => {
              event.preventDefault();
              if (shouldShowVHAPaymentHistory) {
                dispatch(getCopayDetailStatement(`${id}`));
              }
              recordEvent({ event: 'cta-link-click-copay-balance-card' });
              history.push(`/copay-balances/${id}`);
            }}
            href={`/copay-balances/${id}`}
            text="Review details"
            label={`Review details for ${facility}`}
          />
        </p>
      </div>
    </va-card>
  );
};

ZeroBalanceCopayCard.propTypes = {
  city: PropTypes.string,
  facility: PropTypes.string,
  id: PropTypes.string,
  updatedDate: PropTypes.string,
};

export default ZeroBalanceCopayCard;
