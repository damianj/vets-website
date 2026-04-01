import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppointmentScheduledAlert from './AppointmentScheduledAlert';
import CaseProgressDescription from './CaseProgressDescription';

const CaseProgressBar = ({ current, stepLabels, attributes = {} }) => {
  const total = stepLabels.length;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const appointmentDetails = attributes?.orientationAppointmentDetails;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fullSizeProgressBarProps =
    windowWidth > 820
      ? { labels: stepLabels.join(';'), counters: 'small' }
      : {};

  return (
    <>
      <div className="usa-width-one-whole vads-u-margin-top--2">
        <va-segmented-progress-bar
          current={String(current)}
          header-level={2}
          heading-text={stepLabels[current - 1] || 'VA Benefits'}
          {...fullSizeProgressBarProps}
          total={String(total)}
        />
      </div>
      <div className="usa-width-one-whole">
        {current === 4 &&
          appointmentDetails?.appointmentDateTime && (
            <AppointmentScheduledAlert
              appointmentDateTime={appointmentDetails.appointmentDateTime}
              appointmentPlace={appointmentDetails.appointmentPlace}
            />
          )}
      </div>

      <CaseProgressDescription step={current} attributes={attributes} />
    </>
  );
};

CaseProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  stepLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  attributes: PropTypes.object,
};

export default CaseProgressBar;
