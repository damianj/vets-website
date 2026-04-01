import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Toggler } from '~/platform/utilities/feature-toggles';
import { getFailedSubmissionsWithinLast30Days } from '../../utils/helpers';
import * as TrackedItem from '../../utils/trackedItemContent';
import FilesNeeded from '../claim-files-tab/FilesNeeded';
import UploadType2ErrorAlert from '../UploadType2ErrorAlert';

function WhatYouNeedToDo({ claim }) {
  const {
    documentsNeeded,
    evidenceWaiverSubmitted5103,
    trackedItems,
    evidenceSubmissions,
  } = claim.attributes;
  const filesNeeded = trackedItems
    ? // When user indicates they will not be submitting more evidence by adding a standard or automated 5103 waiver,
      // we will remove the automated 5103 request from the filesNeeded array, preventing the alert from showing.
      TrackedItem.getFilesNeeded(trackedItems)
    : [];

  // Memoize failed submissions to prevent UploadType2ErrorAlert from receiving
  // a new array reference on every render, which would break its useEffect tracking
  const failedSubmissionsWithinLast30Days = useMemo(
    () => getFailedSubmissionsWithinLast30Days(evidenceSubmissions),
    [evidenceSubmissions],
  );
  const hasOpenRequests = filesNeeded.length > 0;
  const nothingNeededMessage = (
    <div className="no-documents">
      <p>
        There’s nothing we need from you right now. We’ll let you know when
        there’s an update.
      </p>
    </div>
  );

  return (
    <>
      <h3 className="vads-u-margin-top--0 vads-u-margin-bottom--3">
        What you need to do
      </h3>

      <UploadType2ErrorAlert
        failedSubmissions={failedSubmissionsWithinLast30Days}
        isStatusPage
      />
      <Toggler
        toggleName={Toggler.TOGGLE_NAMES.cstAlertImprovementsEvidenceRequests}
      >
        <Toggler.Enabled>
          {!hasOpenRequests && (
            <>
              {failedSubmissionsWithinLast30Days.length === 0 &&
                nothingNeededMessage}
              {documentsNeeded && (
                <va-additional-info trigger="Why we still say &quot;Action may be needed&quot; after you’ve responded">
                  <div>
                    <p>
                      This message may stay for one of these reasons, or both:
                    </p>
                    <p>
                      <strong>
                        We’re still reviewing your response to an information
                        request.
                      </strong>{' '}
                      The message will go away when we’re done.
                    </p>
                    <p>
                      <strong>
                        You resubmitted files by mail or in person.
                      </strong>{' '}
                      Because we can’t track offline submissions, this message
                      stays for 30 days after the last failed submission.
                    </p>
                  </div>
                </va-additional-info>
              )}
            </>
          )}

          {hasOpenRequests && (
            <>
              <p>
                We identified this information as needed to support your claim.
                We accept responses after the request date, but it may delay
                your claim.
              </p>
              {/* add explicit role=list to expose the <ul> as a list for Safari/VoiceOver */}
              {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
              <ul className="usa-unstyled-list" role="list">
                {filesNeeded.map(item => (
                  <li key={item.id}>
                    <FilesNeeded
                      claimId={claim.id}
                      item={item}
                      evidenceWaiverSubmitted5103={evidenceWaiverSubmitted5103}
                      previousPage="status"
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Toggler.Enabled>
        <Toggler.Disabled>
          {filesNeeded.length === 0 &&
            failedSubmissionsWithinLast30Days.length === 0 &&
            nothingNeededMessage}
          {filesNeeded.map(item => (
            <FilesNeeded
              key={item.id}
              claimId={claim.id}
              item={item}
              evidenceWaiverSubmitted5103={evidenceWaiverSubmitted5103}
              previousPage="status"
            />
          ))}
        </Toggler.Disabled>
      </Toggler>
    </>
  );
}

WhatYouNeedToDo.propTypes = {
  claim: PropTypes.object,
};

export default WhatYouNeedToDo;
