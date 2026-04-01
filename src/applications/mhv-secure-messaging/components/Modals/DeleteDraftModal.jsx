import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { datadogRum } from '@datadog/browser-rum';
import { VaModal } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { Prompts } from '../../util/constants';

const DeleteDraftModal = props => {
  const { draftSequence } = props;

  const handleDelete = () => {
    datadogRum.addAction(
      `Confirm Delete Draft Button${draftSequence ? ` ${draftSequence}` : ''}`,
    );
    props.onDelete();
  };

  const handleCancel = () => {
    datadogRum.addAction(
      `Cancel Delete Draft Button${draftSequence ? ` ${draftSequence}` : ''}`,
    );
    props.onClose();
  };

  return ReactDOM.createPortal(
    <VaModal
      id={`delete-draft-modal${draftSequence ? `-${draftSequence}` : ''}`}
      data-testid={`delete-draft-modal${
        draftSequence ? `-${draftSequence}` : ''
      }`}
      data-dd-action-name={`${Prompts.Draft.DELETE_DRAFT_CONFIRM_HEADER} Modal${
        draftSequence ? ` ${draftSequence}` : ''
      }`}
      modalTitle={Prompts.Draft.DELETE_DRAFT_CONFIRM_HEADER}
      onCloseEvent={() => {
        props.onClose();
        datadogRum.addAction(
          `${Prompts.Draft.DELETE_DRAFT_CONFIRM_HEADER} Modal${
            draftSequence ? ` ${draftSequence} Closed` : ' Closed'
          }`,
        );
      }}
      onPrimaryButtonClick={handleDelete}
      onSecondaryButtonClick={handleCancel}
      primaryButtonText="Delete draft"
      secondaryButtonText="Cancel"
      visible={props.visible}
      status="warning"
    >
      <p style={{ whiteSpace: 'pre-line' }}>
        {Prompts.Draft.DELETE_DRAFT_CONFIRM_CONTENT}
      </p>
    </VaModal>,
    document.body,
  );
};

DeleteDraftModal.propTypes = {
  draftSequence: PropTypes.number,
  id: PropTypes.number,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
};

export default DeleteDraftModal;
