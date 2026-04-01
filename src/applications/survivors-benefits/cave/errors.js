const parseStatus = value => {
  const status = Number.parseInt(value, 10);
  return Number.isNaN(status) ? undefined : status;
};

const primaryApiError = error => {
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors[0];
  }

  return null;
};

export const normalizeCaveApiError = (
  error,
  fallbackDetail = 'Document processing request failed.',
) => {
  const primaryError = primaryApiError(error);
  const status = parseStatus(primaryError?.status ?? error?.status);
  const detail =
    primaryError?.detail ||
    primaryError?.title ||
    error?.error ||
    error?.message ||
    fallbackDetail;

  return {
    status,
    code: primaryError?.code,
    detail,
  };
};

export const createCaveError = (
  error,
  { prefix, fallbackDetail = 'Document processing request failed.' } = {},
) => {
  const normalized = normalizeCaveApiError(error, fallbackDetail);
  const statusSuffix = normalized.status ? ` (${normalized.status})` : '';
  const message = prefix
    ? `${prefix}${statusSuffix}: ${normalized.detail}`
    : normalized.detail;
  const wrappedError = new Error(message);

  wrappedError.status = normalized.status;
  wrappedError.code = normalized.code;
  wrappedError.detail = normalized.detail;
  wrappedError.originalError = error;

  return wrappedError;
};

export const isTerminalCaveApiError = error => {
  const { status } = normalizeCaveApiError(error);

  return status >= 400 && status < 500 && status !== 408 && status !== 429;
};

export const extractProcessingFailureDetail = statusPayload => {
  const detail =
    statusPayload?.error?.errorMessage ||
    statusPayload?.error?.error_message ||
    statusPayload?.error?.detail ||
    statusPayload?.error?.error ||
    statusPayload?.errors?.[0]?.detail;

  return detail?.toString().trim() || null;
};
