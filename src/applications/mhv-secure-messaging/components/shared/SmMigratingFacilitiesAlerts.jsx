import React from 'react';
import PropTypes from 'prop-types';
import useOhMigrationAlertMetric from 'platform/mhv/hooks/useOhMigrationAlertMetric';
import { Alerts } from '../../util/constants';

/**
 * Wrapper that calls the metric hook for each rendered alert.
 * Each instance gets its own ref guard so every alert logs independently.
 */
const SmMigratingFacilityAlert = ({ alertName, currentPhase, children }) => {
  useOhMigrationAlertMetric({ alertName, isVisible: true, currentPhase });
  return children;
};

SmMigratingFacilityAlert.propTypes = {
  alertName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  currentPhase: PropTypes.string,
};

/**
 * Component to render alerts for facilities migrating to Oracle Health
 * Shows warning or error alerts based on the current migration phase
 */
const SmMigratingFacilitiesAlerts = ({ className, migratingFacilities }) => {
  // Map over migrating facilities to create alerts
  const alerts = migratingFacilities.map((migration, index) => {
    const currentPhase = migration.phases.current;
    const isInWarningPhase = Alerts.Message.MIGRATION_WARNING_PHASES?.includes(
      currentPhase,
    );
    const isInErrorPhase = Alerts.Message.MIGRATION_ERROR_PHASES?.includes(
      currentPhase,
    );

    // If current phase is in neither warning nor error array, do not render an alert
    if (!isInWarningPhase && !isInErrorPhase) {
      return null;
    }

    const facilityText =
      migration.facilities.length > 1 ? 'these facilities' : 'this facility';
    const startDate =
      migration.phases[Alerts.Message.MIGRATION_ERROR_START_DATE];
    const endDate = migration.phases[Alerts.Message.MIGRATION_ERROR_END_DATE];

    const migrationDate = new Date(migration.migrationDate);
    const migrationDatePlusTwo = new Date(
      migrationDate.setDate(migrationDate.getDate() + 2),
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Render error alert if in error phase
    if (isInErrorPhase) {
      return (
        <SmMigratingFacilityAlert
          key={index}
          alertName="SmMigratingFacilitiesAlerts-error"
          currentPhase={currentPhase}
        >
          <va-alert
            class={`vads-u-margin-bottom--2p5 ${className} ${
              migratingFacilities.length > 0 ? 'vads-u-margin-top--2' : ''
            }`}
            status="error"
            data-testid="cerner-facilities-transition-alert-error-phase"
            background-only
          >
            <h2 className="vads-u-font-size--md" slot="headline">
              {Alerts.Message.MIGRATING_FACILITIES_ERROR_HEADLINE}
            </h2>
            <div>
              <p>{Alerts.Message.MIGRATING_FACILITIES_ERROR_MESSAGE}</p>
              <ul>
                {migration.facilities.map((facility, i) => (
                  <li key={i}>{facility.facilityName}</li>
                ))}
              </ul>

              <p>
                {Alerts.Message.MIGRATING_FACILITIES_ERROR_SUBNOTE(
                  migrationDatePlusTwo,
                )}
              </p>

              <>
                <p>{Alerts.Message.MIGRATING_FACILITIES_ERROR_NOTE}</p>
                <va-link
                  data-testid="find-facility-link"
                  href="https://www.va.gov/find-locations/"
                  text="Find your facility's contact information"
                />
              </>
            </div>
          </va-alert>
        </SmMigratingFacilityAlert>
      );
    }

    // Render warning alert
    return (
      <SmMigratingFacilityAlert
        key={index}
        alertName="SmMigratingFacilitiesAlerts-warning"
        currentPhase={currentPhase}
      >
        <va-alert-expandable
          class={`vads-u-margin-bottom--2p5 ${className} ${
            migratingFacilities.length > 0 ? 'vads-u-margin-top--2' : ''
          }`}
          data-testid="cerner-facilities-transition-alert"
          status="warning"
          trigger={`Updates will begin on ${startDate}`}
        >
          <div>
            <p>
              From <strong>{startDate}</strong>, to <strong>{endDate}</strong>,{' '}
              {Alerts.Message.MIGRATING_FACILITIES_WARNING_MESSAGE}{' '}
              {facilityText}:
            </p>
            <ul>
              {migration.facilities.map((facility, i) => (
                <li key={i}>{facility.facilityName}</li>
              ))}
            </ul>

            <p>
              <strong>Note:</strong>{' '}
              {Alerts.Message.MIGRATING_FACILITIES_WARNING_NOTE(facilityText)}
            </p>
          </div>
        </va-alert-expandable>
      </SmMigratingFacilityAlert>
    );
  });

  // Filter out null values and return alerts if any exist
  const validAlerts = alerts.filter(alert => alert !== null);
  return validAlerts.length > 0 ? <>{validAlerts}</> : null;
};

SmMigratingFacilitiesAlerts.propTypes = {
  migratingFacilities: PropTypes.arrayOf(
    PropTypes.shape({
      migrationDate: PropTypes.string,
      facilities: PropTypes.arrayOf(
        PropTypes.shape({
          facilityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          facilityName: PropTypes.string,
        }),
      ),
      phases: PropTypes.shape({
        current: PropTypes.string,
        p0: PropTypes.string,
        p1: PropTypes.string,
        p2: PropTypes.string,
        p3: PropTypes.string,
        p4: PropTypes.string,
        p5: PropTypes.string,
        p6: PropTypes.string,
        p7: PropTypes.string,
      }),
    }),
  ).isRequired,
  className: PropTypes.string,
};

export default SmMigratingFacilitiesAlerts;
