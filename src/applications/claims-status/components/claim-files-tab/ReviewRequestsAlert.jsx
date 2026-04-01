import React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

function ReviewRequestsAlert() {
  const navigate = useNavigate();

  return (
    <va-alert status="warning" class="vads-u-margin-bottom--4">
      <h3 slot="headline">Review your requests</h3>
      <p>
        You may have evidence requests you haven't responded to yet. Review them
        before uploading additional evidence here.
      </p>
      <va-link-action
        href="../status"
        type="secondary"
        text="Review requests"
        onClick={e => {
          e.preventDefault();
          navigate('../status');
        }}
      />
    </va-alert>
  );
}

export default ReviewRequestsAlert;
