import React from 'react';
import PropTypes from 'prop-types';
import { VaLink } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useNavigate } from 'react-router-dom-v5-compat';
import HubCardList from './HubCardList';
import SelectPreferenceView from './SelectPreferenceView';

const CaseProgressDescription = ({
  step,
  showHubCards = false,
  attributes = {},
}) => {
  const navigate = useNavigate();
  const hubCards = showHubCards ? (
    <div className="vads-u-clear--both">
      <HubCardList step={step} />
    </div>
  ) : null;

  const handleCareerPlanningClick = event => {
    event.preventDefault();
    navigate('/career-planning');
  };

  switch (step) {
    case 1: {
      return (
        <>
          <p>We received your application for VR&E benefits.</p>
          <p>
            While we review your application, you can prepare for next steps by
            using the additional resources on this page to learn more about the
            VR&E program.
          </p>
          {hubCards}
        </>
      );
    }
    case 2: {
      return (
        <>
          <p>
            We’re currently reviewing your application to confirm your VR&E
            Chapter 31 eligibility.
          </p>
          {hubCards}
        </>
      );
    }
    case 3: {
      return (
        <>
          <p>
            We’re processing your VR&E application. We’re also assigning a
            counselor to you.
          </p>
          <p>
            Before we schedule your initial evaluation counselor meeting, we
            need to know how you’d like to complete the orientation video. You
            can review this video during your counselor meeting or online on
            your own time.
          </p>
          <p>
            Next, we’ll send you a link to schedule your counselor meeting to
            your email or by text message.
          </p>
          <SelectPreferenceView />
          {hubCards}
        </>
      );
    }

    case 4: {
      const appointmentDetails = attributes?.orientationAppointmentDetails;

      const prepareForYourMeeting = (
        <>
          <h3>Prepare for your meeting</h3>
          <p>
            Check out our career resources and tools to help you achieve your
            employment goals. You can assess your career interests and learn
            about career paths. These career resources will help you prepare for
            your initial evaluation counselor meeting.
          </p>
          <VaLink
            href="/career-planning"
            text="Explore career planning tools and resources"
            onClick={handleCareerPlanningClick}
          />
        </>
      );

      if (!appointmentDetails?.appointmentDateTime) {
        return (
          <>
            <p>
              We processed your application for VR&E benefits. Keep reading to
              learn what you need to do next.
            </p>
            <h3>Schedule your meeting</h3>
            <p>
              Follow the instructions in the email we sent you to schedule your
              initial evaluation counselor meeting.
            </p>
            <p>
              After you schedule this meeting, we’ll send you a confirmation
              email and a notification letter in the mail.
            </p>
            {prepareForYourMeeting}
          </>
        );
      }

      return (
        <>
          <p>
            If you need to reschedule, use the rescheduling link we sent you in
            the confirmation email and text. If you need more help, contact your
            counselor.
          </p>
          {prepareForYourMeeting}
        </>
      );
    }

    case 5: {
      return (
        <>
          <p>
            Your counselor is completing your entitlement determination review.
            While you wait, you can continue reviewing our career planning tools
            and resources.
          </p>
          <div className="vads-u-margin-top--1">
            <VaLink
              href="/career-planning"
              text="Explore career planning tools and resources"
              onClick={handleCareerPlanningClick}
            />
          </div>
        </>
      );
    }

    case 6: {
      return (
        <>
          <p>
            Your counselor is working with you to establish your Chapter 31
            rehabilitation plan or career track.
          </p>
          {hubCards}
        </>
      );
    }

    case 7: {
      return (
        <>
          <p>We initiated your VR&E (Chapter 31) benefits.</p>
          {hubCards}
        </>
      );
    }

    default:
      return null;
  }
};

CaseProgressDescription.propTypes = {
  step: PropTypes.number.isRequired,
  showHubCards: PropTypes.bool,
  attributes: PropTypes.object,
};

export default CaseProgressDescription;
