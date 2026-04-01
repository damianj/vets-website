import { datadogRum } from '@datadog/browser-rum';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import { recordVaosError } from './events';

const APP_NAME = 'VAOS';

const KIND_EXCEPTION = 'vaos_exception';
const KIND_SERVER = 'vaos_server_error';
const KIND_CLIENT = 'vaos_client_error';

function buildDatadogContext({ title, data, kind }) {
  const context = {
    app: APP_NAME,
    kind,
  };
  if (title) {
    context.title = title;
  }
  if (data) {
    context.data = data;
  }
  return context;
}

export function captureError(err, skipRecordEvent = false, title, data) {
  let eventErrorKey;

  if (err instanceof Error) {
    datadogRum.addError(
      err,
      buildDatadogContext({
        title,
        data,
        kind: KIND_EXCEPTION,
      }),
    );
    eventErrorKey = err.message;
  } else if (err?.issue || err?.errors) {
    let errorTitle;

    if (err?.errors?.[0]?.code === '401' || err?.issue?.[0]?.code === '401') {
      errorTitle =
        err?.errors?.[0]?.title ||
        err?.issue?.[0]?.diagnostics ||
        'Not authorized';
    } else {
      errorTitle =
        title ||
        err?.errors?.[0]?.title ||
        err?.issue?.[0]?.diagnostics ||
        err?.errors?.[0]?.code ||
        err?.issue?.[0]?.code ||
        err;
    }

    eventErrorKey = `vaos_server_error${errorTitle ? `: ${errorTitle}` : ''}`;
    datadogRum.addError(
      err,
      buildDatadogContext({
        title: eventErrorKey,
        data,
        kind: KIND_SERVER,
      }),
    );
  } else {
    eventErrorKey = `vaos_client_error${title ? `: ${title}` : ''}`;
    datadogRum.addError(
      err,
      buildDatadogContext({
        title: eventErrorKey,
        data,
        kind: KIND_CLIENT,
      }),
    );
  }

  if (!skipRecordEvent) {
    recordVaosError(eventErrorKey);
  }

  if (!environment.isProduction()) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export function captureMissingModalityLogs(appointment) {
  let context = {};
  try {
    context = {
      // Raw API fields
      start: appointment.vaos.apiData.start,
      created: appointment.vaos.apiData.created,
      status: appointment.vaos.apiData.status,
      past: appointment.vaos.apiData.past,
      pending: appointment.vaos.apiData.pending,
      future: appointment.vaos.apiData.future,
      serviceType: appointment.vaos.apiData.serviceType,
      serviceCategory: appointment.vaos.apiData.serviceCategory,
      kind: appointment.vaos.apiData.kind,
      vvsKind: appointment.vaos.apiData.telehealth?.vvsKind,
      hasAtlas: !!appointment.vaos.apiData.telehealth?.atlas,
      vvsVideoAppt: appointment.vaos.apiData.extension?.vvsVistaVideoAppt,
      apiModality: appointment.vaos.apiData.modality,
      hasProviderName: !!appointment.vaos.apiData.providerName,
      providerServiceId: appointment.vaos.apiData.providerServiceId,
      hasReferral: !!appointment.vaos.apiData.referral,
      referralId: appointment.vaos.apiData.referralId,
      // Derived fields
      type: appointment.type,
      modality: appointment.modality,
      isCerner: appointment.vaos.isCerner,
    };
  } catch (error) {
    context.metadataError = error;
  }

  const errorMessage = `VAOS appointment with missing modality: ${
    appointment.modality
  }.`;
  captureError(new Error(errorMessage), true, errorMessage, context);
}

export function getErrorCodes(error) {
  return error?.errors?.map(e => e.code) || [];
}

export function has400LevelError(error) {
  return getErrorCodes(error).some(code => code.startsWith('VAOS_4'));
}

export function has409LevelError(error) {
  return getErrorCodes(error).some(code => code.startsWith('VAOS_409'));
}

export function has404AppointmentIdError(error) {
  let isBadAppointmentId = false;
  const message = 'Appointment not found for appointmentId';
  if (Object.values(error).includes('OperationOutcome')) {
    // error response transformed into mapToFHIRErrors pattern
    isBadAppointmentId =
      error?.issue[0]?.code === 'VAOS_404' &&
      error?.issue[0]?.source?.vamfBody?.includes(message);
  }
  return isBadAppointmentId;
}
