import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom-v5-compat';
import { useSelector } from 'react-redux';
import { selectCernerFacilityIds } from 'platform/site-wide/drupal-static-data/source-files/vamc-ehr/selectors';
import ExtraDetails from '../shared/ExtraDetails';
import LastFilledInfo from '../shared/LastFilledInfo';
import SendRxRenewalMessage from '../shared/SendRxRenewalMessage';
import StatusAlertBanner from '../shared/StatusAlertBanner';
import { OracleHealthInCardAlert } from '../shared/OracleHealthTransitionAlerts';
import {
  dateFormat,
  getPrescriptionDetailUrl,
  getRxStatus,
  rxSourceIsNonVA,
  getTrackingUrl,
  isExpirationDatePassed,
  isOracleHealthPrescription,
} from '../../util/helpers';
import { dataDogActionNames, pageType } from '../../util/dataDogConstants';
import {
  shouldBlockRefills,
  shouldBlockRenewals,
} from '../../util/oracleHealthTransition';
import {
  selectMhvMedicationsOracleHealthCutoverFlag,
  selectCernerPilotFlag,
  selectV2StatusMappingFlag,
  selectMedicationsManagementImprovementsFlag,
  selectSecureMessagingMedicationsRenewalRequestFlag,
} from '../../util/selectors';
import { selectOracleHealthMigrations } from '../../selectors/selectUser';
import {
  DATETIME_FORMATS,
  RX_SOURCE,
  DISPENSE_STATUS,
  dispStatusObj,
  dispStatusObjV2,
  medicationsUrls,
  NON_VA_MEDICATION_MESSAGE,
} from '../../util/constants';

const MedicationsListCard = ({ rx }) => {
  const isCernerPilot = useSelector(selectCernerPilotFlag);
  const isV2StatusMapping = useSelector(selectV2StatusMappingFlag);
  const useV2StatusMapping = isCernerPilot && isV2StatusMapping;
  const isPendingDispense =
    rx.prescriptionSource === RX_SOURCE.PENDING_DISPENSE;
  const isMedsImprovements = useSelector(
    selectMedicationsManagementImprovementsFlag,
  );
  const showSecureMessagingRenewalRequest = useSelector(
    selectSecureMessagingMedicationsRenewalRequestFlag,
  );
  const isFillInProgress =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_REFILL_IN_PROCESS ||
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_SUBMITTED;
  const isFirstFill =
    Array.isArray(rx.rxRfRecords) && rx.rxRfRecords.length === 0;
  const isInitialFill = isFillInProgress && isFirstFill;
  const isOracleHealthCutoverEnabled = useSelector(
    selectMhvMedicationsOracleHealthCutoverFlag,
  );
  const migratingFacilities = useSelector(selectOracleHealthMigrations);
  const isRefillBlocked = shouldBlockRefills({
    prescription: rx,
    isFeatureFlagEnabled: isOracleHealthCutoverEnabled,
    migrations: migratingFacilities,
  });
  const isRenewalBlocked = shouldBlockRenewals({
    prescription: rx,
    isFeatureFlagEnabled: isOracleHealthCutoverEnabled,
    migrations: migratingFacilities,
  });
  const pendingMed =
    isPendingDispense &&
    (useV2StatusMapping
      ? rx?.dispStatus === dispStatusObjV2.inprogress &&
        rx?.refillStatus?.toLowerCase() === 'neworder'
      : rx?.dispStatus === DISPENSE_STATUS.NEW_ORDER);
  const pendingRenewal =
    isPendingDispense &&
    (useV2StatusMapping
      ? rx?.dispStatus === dispStatusObjV2.inprogress &&
        rx?.refillStatus?.toLowerCase() === 'renew'
      : rx?.dispStatus === DISPENSE_STATUS.RENEW);
  const latestTrackingStatus = rx?.trackingList?.[0];
  const isRecentlyShipped =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_SHIPPED &&
    rx.isTrackable &&
    Boolean(latestTrackingStatus);
  const trackingUrl =
    getTrackingUrl(
      latestTrackingStatus?.carrier,
      latestTrackingStatus?.trackingNumber,
    ) || latestTrackingStatus?.trackingNumber;
  const isNonVaPrescription = rxSourceIsNonVA(rx);
  const cernerFacilityIds = useSelector(selectCernerFacilityIds);
  const isOracleHealth = isOracleHealthPrescription(rx, cernerFacilityIds);
  const rxStatus = getRxStatus(rx);
  const isOnHold = rx.dispStatus === dispStatusObj.onHold;
  const isDiscontinued = rx.dispStatus === dispStatusObj.discontinued;
  const isTransferred = rx.dispStatus === dispStatusObj.transferred;
  const isActiveNoRefills =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE &&
    rx.refillRemaining === 0 &&
    !isNonVaPrescription;
  const expirationDate = rx.expirationDate ? new Date(rx.expirationDate) : null;
  const isExpiredOver120Days =
    expirationDate &&
    expirationDate <= new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
  const isNonRenewableExpired =
    showSecureMessagingRenewalRequest &&
    (rx.dispStatus === dispStatusObj.expired ||
      rx.dispStatus === dispStatusObj.discontinued) &&
    !rx.isRefillable &&
    !rx.isRenewable &&
    isExpiredOver120Days;
  const isExpiredRenewable =
    rx.dispStatus === DISPENSE_STATUS.EXPIRED &&
    rx.isRenewable &&
    rx.refillRemaining === 0 &&
    !isNonVaPrescription &&
    showSecureMessagingRenewalRequest;
  const isExpiredNoRenewalFlow =
    rx.dispStatus === DISPENSE_STATUS.EXPIRED &&
    !isExpiredRenewable &&
    isExpirationDatePassed(rx.expirationDate) &&
    !isNonVaPrescription;
  const showMedImprovementCard =
    isMedsImprovements &&
    (isFillInProgress ||
      isRecentlyShipped ||
      isActiveNoRefills ||
      isExpiredRenewable ||
      isExpiredNoRenewalFlow ||
      isNonRenewableExpired);

  const renderNonVaCard = () => (
    <>
      <p
        className="vads-u-margin-top--1p5 vads-u-margin-bottom--0 vads-u-font-weight--bold"
        data-testid="non-va-medication-label"
      >
        Non-VA medication
      </p>
      <p className="vads-u-margin-y--0" data-testid="non-VA-prescription">
        {NON_VA_MEDICATION_MESSAGE}
      </p>
    </>
  );

  const renderPendingCard = () => (
    <div className="vads-u-display--flex vads-u-margin-top--2">
      <span className="vads-u-flex--auto vads-u-padding-top--1">
        <va-icon icon="info" size={3} aria-hidden="true" />
      </span>
      <p
        className="vads-u-margin-left--2 vads-u-flex--1"
        data-testid="pending-renewal-rx"
        id={`pending-med-content-${rx.prescriptionId}`}
      >
        {pendingRenewal ? (
          <>
            This is a renewal you requested. Your VA pharmacy is reviewing it
            now. Details may change.
          </>
        ) : (
          <>
            This is a new prescription from your provider. Your VA pharmacy is
            reviewing it now. Details may change.
          </>
        )}
      </p>
    </div>
  );

  const renderTransferredCard = () => (
    <p
      className="vads-u-margin-top--1p5 vads-u-margin-bottom--0"
      data-testid="transferred-content"
    >
      This is a previous record of your medication. If you need a refill, find
      the current medication in your medications list. If you don’t have a
      current one, contact your provider.
    </p>
  );

  const renderExpiredCard = () => (
    <>
      <LastFilledInfo {...rx} />
      <p
        className="vads-u-margin-top--1p5 vads-u-margin-bottom--0 vads-u-font-weight--bold"
        data-testid="expired-status"
      >
        {rxStatus}
      </p>
      <p
        className="vads-u-margin-y--0"
        data-testid="expired-no-renewal-content"
      >
        This prescription is too old to refill. If you need more, request a
        renewal.
      </p>
    </>
  );

  const cardBodyContent = () => {
    if (isMedsImprovements && isNonVaPrescription) return renderNonVaCard();
    if (isMedsImprovements && isTransferred) return renderTransferredCard();
    if (isMedsImprovements && isNonRenewableExpired)
      return (
        <>
          <LastFilledInfo {...rx} />
          <p
            className="vads-u-margin-top--1p5 vads-u-margin-bottom--0 vads-u-font-weight--bold"
            data-testid="rxStatus"
            data-dd-privacy="mask"
          >
            Expired
          </p>
          <p
            className="vads-u-margin-top--0p5 vads-u-margin-bottom--0"
            data-testid="expired-non-renewable"
            data-dd-privacy="mask"
          >
            This prescription is too old to refill. If you need more,{' '}
            <SendRxRenewalMessage
              rx={rx}
              isOracleHealth={isOracleHealth}
              fallbackContent={
                <a
                  href={medicationsUrls.RENEW_PRESCRIPTIONS_URL}
                  data-testid="learn-to-renew-prescriptions-link"
                >
                  request a renewal
                </a>
              }
            />
          </p>
        </>
      );
    if (isMedsImprovements && isExpiredNoRenewalFlow)
      return renderExpiredCard();
    if (pendingRenewal || pendingMed) return renderPendingCard();

    return (
      <>
        {isMedsImprovements &&
          isFillInProgress && (
            <StatusAlertBanner testId="fill-in-progress-alert" icon="schedule">
              {isInitialFill ? 'Fill' : 'Refill'} in progress.{' '}
              <Link to={medicationsUrls.MEDICATIONS_IN_PROGRESS}>
                Go to in-progress medications
              </Link>
            </StatusAlertBanner>
          )}
        {isMedsImprovements &&
          isRecentlyShipped && (
            <StatusAlertBanner testId="shipped-alert" icon="local_shipping">
              {isFirstFill ? 'Fill' : 'Refill'} has shipped.{' '}
              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  rel="noreferrer"
                  data-testid="get-tracking-info-link"
                >
                  Get tracking info
                </a>
              ) : (
                <Link to={getPrescriptionDetailUrl(rx)}>Get tracking info</Link>
              )}
            </StatusAlertBanner>
          )}
        {rx &&
          (rx.isRefillable || showMedImprovementCard) &&
          rx.refillRemaining >= 0 && (
            <p
              className="vads-u-margin-bottom--0"
              data-testid="rx-refill-remaining"
              data-dd-privacy="mask"
              id={`refill-remaining-${rx.prescriptionId}`}
            >
              {isMedsImprovements
                ? `Refills left: ${rx.refillRemaining}`
                : `Refills remaining: ${rx.refillRemaining}`}
            </p>
          )}
        {rx && !(isMedsImprovements && isOnHold) && <LastFilledInfo {...rx} />}
        {showMedImprovementCard &&
          (isActiveNoRefills || isExpiredRenewable) && (
            <div
              className="vads-u-margin-top--1"
              data-testid="no-refills-left-alert"
            >
              <p className="vads-u-margin-y--0">
                You have no refills left. If you need more, request a renewal.
              </p>
              <SendRxRenewalMessage
                rx={rx}
                isOracleHealth={isOracleHealth}
                hideExpiredMessage
                fallbackContent={
                  <a
                    href={medicationsUrls.RENEW_PRESCRIPTIONS_URL}
                    data-testid="learn-to-renew-prescriptions-link"
                  >
                    Learn how to renew prescriptions
                  </a>
                }
              />
            </div>
          )}
        {latestTrackingStatus &&
          !showMedImprovementCard && (
            <p
              className="vads-u-margin-top--1p5 vads-u-padding-bottom--1p5 vads-u-border-bottom--1px vads-u-border-color--gray"
              data-testid="rx-card-details--shipped-on"
              data-dd-privacy="mask"
            >
              <va-icon icon="local_shipping" size={3} aria-hidden="true" />
              <span
                className="vads-u-margin-left--2"
                data-testid="shipping-date"
                data-dd-privacy="mask"
              >
                Shipped on{' '}
                {dateFormat(
                  latestTrackingStatus.completeDateTime,
                  DATETIME_FORMATS.longMonthDate,
                )}
              </span>
            </p>
          )}
        {(!isMedsImprovements || isDiscontinued) &&
          rxStatus !== 'Unknown' && (
            <p
              id={`status-${rx.prescriptionId}`}
              className={`${
                isMedsImprovements && isDiscontinued
                  ? 'vads-u-margin-top--1 vads-u-margin-bottom--0p5'
                  : 'vads-u-margin-top--1p5'
              } vads-u-font-weight--bold`}
              data-testid="rxStatus"
              data-dd-privacy="mask"
            >
              {rxStatus}
            </p>
          )}
        {isRefillBlocked &&
          rx.isRefillable && (
            <OracleHealthInCardAlert
              stationNumber={rx.stationNumber}
              prescriptionId={rx.prescriptionId}
            />
          )}
        {rx &&
          !showMedImprovementCard &&
          (isMedsImprovements && isOnHold ? (
            <div className="vads-u-margin-top--1p5">
              <ExtraDetails
                {...rx}
                page={pageType.LIST}
                isRefillBlocked={isRefillBlocked}
                isRenewalBlocked={isRenewalBlocked}
              />
            </div>
          ) : (
            <ExtraDetails
              {...rx}
              page={pageType.LIST}
              isRefillBlocked={isRefillBlocked}
              isRenewalBlocked={isRenewalBlocked}
            />
          ))}
      </>
    );
  };

  const displayGrayBackground =
    isMedsImprovements &&
    (isDiscontinued ||
      isTransferred ||
      isNonRenewableExpired ||
      isExpiredNoRenewalFlow);

  return (
    <va-card
      background={displayGrayBackground || undefined}
      style={
        displayGrayBackground
          ? { border: '1px solid var(--vads-color-gray-medium)' }
          : undefined
      }
      class={`no-print rx-card-container ${
        pendingMed || pendingRenewal ? 'pending-med-or-renewal' : ''
      }${
        displayGrayBackground
          ? ' vads-u-border--1px vads-u-border-color--gray-medium'
          : ''
      } vads-u-margin-y--2 no-break`}
    >
      <div className="rx-card-details" data-testid="rx-card-info">
        <Link
          id={`card-header-${rx.prescriptionId}`}
          data-dd-privacy="mask"
          data-dd-action-name={
            dataDogActionNames.medicationsListPage.MEDICATION_NAME_LINK_IN_CARD
          }
          data-testid="medications-history-details-link"
          className="vads-u-font-weight--bold"
          to={getPrescriptionDetailUrl(rx)}
        >
          <span data-dd-privacy="mask">
            {rx?.prescriptionName || rx?.orderableItem}
          </span>
        </Link>
        {!isMedsImprovements &&
          !pendingMed &&
          !pendingRenewal &&
          rxStatus !== 'Unknown' &&
          !isNonVaPrescription && (
            <p
              data-testid="rx-number"
              data-dd-privacy="mask"
              id={`prescription-number-${rx.prescriptionId}`}
            >
              Prescription number:{' '}
              <span data-dd-privacy="mask">
                {rx.prescriptionNumber || 'Not available'}
              </span>
            </p>
          )}
        {cardBodyContent()}
      </div>
    </va-card>
  );
};

export default MedicationsListCard;

MedicationsListCard.propTypes = {
  rx: PropTypes.object,
};
