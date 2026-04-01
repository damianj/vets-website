import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Navigate } from 'react-router-dom-v5-compat';
import { useFeatureToggle } from 'platform/utilities/feature-toggles';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import { apiRequest } from '@department-of-veterans-affairs/platform-utilities/api';

import useSetPageTitle from '../../../hooks/useSetPageTitle';
import useSetFocus from '../../../hooks/useSetFocus';
import DocumentUpload from './DocumentUpload';
import TravelPayButtonPair from '../../shared/TravelPayButtonPair';
import {
  uploadProofOfAttendance,
  getComplexClaimDetails,
  deleteDocument,
} from '../../../redux/actions';
import {
  selectAppointment,
  selectHasProofOfAttendance,
  selectPOADocument,
} from '../../../redux/selectors';
import { toBase64 } from './ExpensePage';
import { PROOF_OF_ATTENDANCE_FILENAME } from '../../../constants';
import { getAcceptedFileTypes } from '../../../util/complex-claims-helper';

const ProofOfAttendancePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apptId, claimId } = useParams();

  const { useToggleValue, TOGGLE_NAMES } = useFeatureToggle();
  const isCommunityCareEnabled = useToggleValue(
    TOGGLE_NAMES.travelPayEnableCommunityCare,
  );
  const heicConversionEnabled = useToggleValue(
    TOGGLE_NAMES.travelPayEnableHeicConversion,
  );

  const { data: appointment } = useSelector(selectAppointment);
  const hasProofOfAttendance = useSelector(selectHasProofOfAttendance);
  const poaDocument = useSelector(selectPOADocument);
  const [isEditMode] = useState(hasProofOfAttendance);

  // loadedFile: existing POA document fetched from the API; pre-populates VaFileInput on mount
  const [loadedFile, setLoadedFile] = useState(null);
  // selectedFile: a new file chosen by the user (null until the user picks something)
  const [selectedFile, setSelectedFile] = useState(null);
  // hasRemovedFile: true when the user explicitly cleared the VaFileInput in edit mode;
  // distinguishes "no change" (keep existing) from "intentionally deleted" (require replacement)
  const [hasRemovedFile, setHasRemovedFile] = useState(false);
  const [isFetchingDocument, setIsFetchingDocument] = useState(false);
  // isSaving covers the full delete→upload→refresh window so the spinner never drops out
  const [isSaving, setIsSaving] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [uploadError, setUploadError] = useState(false);

  const title = 'Proof of attendance';
  useSetPageTitle(title);
  useSetFocus();

  // In edit mode, fetch the existing POA document so VaFileInput shows it pre-populated.
  useEffect(
    () => {
      if (!isEditMode || !poaDocument?.documentId || loadedFile)
        return undefined;

      let isMounted = true;

      const fetchDocument = async () => {
        setIsFetchingDocument(true);
        try {
          const documentUrl = `${
            environment.API_URL
          }/travel_pay/v0/claims/${claimId}/documents/${
            poaDocument.documentId
          }`;
          const response = await apiRequest(documentUrl);
          const contentType = response.headers.get('Content-Type');
          const arrayBuffer = await response.arrayBuffer();
          const blob = new Blob([arrayBuffer], { type: contentType });

          if (isMounted) {
            setLoadedFile(
              new File([blob], poaDocument.filename, { type: contentType }),
            );
          }
        } catch {
          // If the fetch fails, VaFileInput will be empty and the user can upload a replacement
        } finally {
          if (isMounted) setIsFetchingDocument(false);
        }
      };

      fetchDocument();
      return () => {
        isMounted = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEditMode, poaDocument?.documentId, poaDocument?.filename, claimId],
  );

  // Only show this page for community care appointments with the flag enabled
  const isCCAppt = appointment?.isCC;
  if (!isCommunityCareEnabled || !isCCAppt) {
    return (
      <Navigate
        to={`/file-new-claim/${apptId}/${claimId}/choose-expense`}
        replace
      />
    );
  }

  const handleDocumentChange = event => {
    const newFile = event?.detail?.files?.[0];
    if (!newFile) {
      setSelectedFile(null);
      // Track explicit removal in edit mode so handleContinue knows
      // the user cleared the file rather than just not changing it
      if (isEditMode) setHasRemovedFile(true);
      return;
    }
    const extension = newFile.name.split('.').pop();
    const renamedFile = new File(
      [newFile],
      `${PROOF_OF_ATTENDANCE_FILENAME}.${extension}`,
      { type: newFile.type },
    );
    setSelectedFile(renamedFile);
    setHasRemovedFile(false);
    setFileError(null);
  };

  const handleFileInputError = event => {
    const errorMessage = event?.detail?.error;
    if (errorMessage) {
      setFileError(errorMessage);
      setSelectedFile(null);
    }
  };

  const handleContinue = async () => {
    // A file is required when in add mode, or when the user cleared the existing
    // file in edit mode (hasRemovedFile) without selecting a replacement
    if (!selectedFile && (!isEditMode || hasRemovedFile)) {
      setFileError('Please upload your proof of attendance to continue.');
      return;
    }

    setUploadError(false);
    setIsSaving(true);
    try {
      if (selectedFile) {
        // Replacing an existing document: delete old before uploading new
        if (isEditMode && poaDocument?.documentId) {
          await dispatch(deleteDocument(claimId, poaDocument.documentId));
        }
        const fileData = await toBase64(selectedFile);
        await dispatch(
          uploadProofOfAttendance(claimId, {
            contentType: selectedFile.type,
            fileName: selectedFile.name,
            length: selectedFile.size,
            fileData,
          }),
        );
        // Refresh claim details so the updated document lands in state
        await dispatch(getComplexClaimDetails(claimId));
      }

      if (isEditMode) {
        navigate(`/file-new-claim/${apptId}/${claimId}/review`);
      } else {
        navigate(`/file-new-claim/${apptId}/${claimId}/choose-expense`);
      }
    } catch {
      setIsSaving(false);
      setUploadError(true);
    }
  };

  const handleBack = () => {
    if (isEditMode) {
      navigate(`/file-new-claim/${apptId}/${claimId}/review`);
    } else {
      navigate(`/file-new-claim/${apptId}`, { state: { skipRedirect: true } });
    }
  };

  const isLoading = isSaving;

  // selectedFile takes precedence; if the user explicitly removed the file keep
  // VaFileInput empty (don't re-populate with loadedFile)
  const currentDocument = hasRemovedFile ? null : selectedFile || loadedFile;

  return (
    <div data-testid="proof-of-attendance-page">
      <h1>{title}</h1>
      {uploadError && (
        <va-alert
          close-btn-aria-label="Close notification"
          status="error"
          visible
        >
          <h2 slot="headline">Something went wrong on our end</h2>
          <p className="vads-u-margin-y--0">
            We’re sorry. We couldn’t add this file. Refresh this page or try
            again later.
          </p>
        </va-alert>
      )}
      <p>
        To request travel pay for a community care appointment, you’ll need to
        submit proof that you attended the appointment.
      </p>
      <p className="vads-u-margin-bottom--0">
        Proof of attendance can include these documents:
      </p>
      <ul className="vads-u-margin-top--0">
        <li>A work or school release note from the community provider</li>
        <li>
          A document on the community provider letterhead showing the date your
          appointment was completed
        </li>
      </ul>
      <p className="vads-u-margin-bottom--0">
        Guidelines for uploading your proof of attendance:
      </p>
      <ul className="vads-u-margin-top--0">
        <li>Make sure your file is no larger than 5MB</li>
        <li>
          Make sure your file is a{' '}
          {getAcceptedFileTypes(heicConversionEnabled)
            .join(', ')
            .replace(/, ([^,]*)$/, ', or $1')}{' '}
          file
        </li>
        <li>Note that we’ll rename your file "proof-of-attendance"</li>
      </ul>
      {isFetchingDocument ? (
        <va-loading-indicator message="Loading your proof of attendance..." />
      ) : (
        <DocumentUpload
          currentDocument={currentDocument}
          error={fileError}
          handleDocumentChange={handleDocumentChange}
          onVaFileInputError={handleFileInputError}
          label="Upload your proof of attendance"
        />
      )}
      <TravelPayButtonPair
        continueText={isEditMode ? 'Save and continue' : 'Continue'}
        backText={isEditMode ? 'Cancel' : 'Back'}
        onContinue={handleContinue}
        onBack={handleBack}
        loading={isLoading}
        className="vads-u-margin-top--7"
      />
    </div>
  );
};

export default ProofOfAttendancePage;
