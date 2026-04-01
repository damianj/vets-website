import { apiRequest } from 'platform/utilities/api';
import { buildOutputUrl, buildDownloadUrl } from './endpoints';
import { createCaveError } from './errors';

export const fetchArtifactSummary = async documentId => {
  try {
    return await apiRequest(buildOutputUrl(documentId, 'artifact'));
  } catch (error) {
    throw createCaveError(error, {
      prefix: 'CAVE artifact summary request failed',
      fallbackDetail: 'Unable to retrieve extracted document artifacts.',
    });
  }
};

export const downloadArtifactData = async (documentId, kvpId) => {
  try {
    return await apiRequest(buildDownloadUrl(documentId, kvpId), {
      headers: {
        'X-Key-Inflection': 'snake',
      },
    });
  } catch (error) {
    throw createCaveError(error, {
      prefix: 'CAVE artifact download failed',
      fallbackDetail: 'Unable to retrieve extracted document artifact data.',
    });
  }
};
