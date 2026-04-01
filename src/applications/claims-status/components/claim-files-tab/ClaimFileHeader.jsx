import PropTypes from 'prop-types';
import React from 'react';
import { Toggler } from '~/platform/utilities/feature-toggles';

function ClaimFileHeader({ isOpen }) {
  const headerDescription = isClaimOpen => {
    return isClaimOpen
      ? 'If you need to add evidence, you can do that here. You can also review the files associated with this claim.'
      : 'You can see the files associated with this claim.';
  };
  return (
    <div className="claim-file-header-container">
      <h2 className="tab-header vads-u-margin-y--0">Claim files</h2>
      <Toggler
        toggleName={Toggler.TOGGLE_NAMES.cstAlertImprovementsEvidenceRequests}
      >
        <Toggler.Enabled>
          <p className="vads-u-margin-top--1 vads-u-margin-bottom--4 va-introtext">
            {isOpen
              ? "Add evidence or review files you've already uploaded for this claim."
              : 'You can see the files associated with this claim.'}
          </p>
        </Toggler.Enabled>
        <Toggler.Disabled>
          <p className="vads-u-margin-top--1 vads-u-margin-bottom--4 va-introtext">
            {headerDescription(isOpen)}
          </p>
        </Toggler.Disabled>
      </Toggler>
    </div>
  );
}

ClaimFileHeader.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default ClaimFileHeader;
