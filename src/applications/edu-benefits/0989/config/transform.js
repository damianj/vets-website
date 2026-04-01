import { transformForSubmit } from 'platform/forms-system/src/js/helpers';
import {
  transformPhoneNumberObject,
  transformContactInfoMailingAddress,
  todaysDate,
} from '../helpers';

function collectPersonalInfo(formData) {
  const data = {
    applicantName: formData.applicantName,
    ssn: formData.ssn,
    vaFileNumber: formData.vaFileNumber,
    mailingAddress: transformContactInfoMailingAddress(
      formData.veteran.mailingAddress,
    ),
    emailAddress: formData.veteran.email?.emailAddress,
    homePhone: transformPhoneNumberObject(formData.veteran.homePhone),
    mobilePhone: transformPhoneNumberObject(formData.veteran.mobilePhone),
  };

  if (data.homePhone === '') {
    delete data.homePhone;
  }
  if (data.mobilePhone === '') {
    delete data.mobilePhone;
  }

  return data;
}

function collectOldSchoolInfo(formData) {
  return {
    schoolWasClosed: formData.schoolWasClosed,
    closedSchoolName: formData.closedSchoolName,
    closedSchoolAddress: formData.closedSchoolAddress,
    didCompleteProgramOfStudy: formData.didCompleteProgramOfStudy,
    didReceiveCredit: formData.didReceiveCredit,
    wasEnrolledWhenSchoolClosed: formData.wasEnrolledWhenSchoolClosed,
    wasOnApprovedLeave: formData.wasOnApprovedLeave,
    withdrewPriorToClosing: formData.withdrewPriorToClosing,
    dateOfWithdraw: formData.dateOfWithdraw,
    schoolDidTransferCredits: formData.schoolDidTransferCredits,
    lastDateOfAttendance: formData.lastDateOfAttendance,
  };
}

function collectNewSchoolInfo(formData) {
  return {
    enrolledAtNewSchool: formData.enrolledAtNewSchool,
    newSchoolName: formData.newSchoolName,
    newProgramName: formData.newProgramName,
    isUsingTeachoutAgreement: formData.isUsingTeachoutAgreement,
    newSchoolGrants12OrMoreCredits: formData.newSchoolGrants12OrMoreCredits,
  };
}

function collectRemarks(formData) {
  return {
    remarks: formData.remarks,
  };
}

function collectAttestation(formData) {
  return {
    attestationName: formData.attestationName,
    attestationDate: formData.attestationDate,
  };
}

export default function transform(formConfig, form) {
  const data = [
    collectPersonalInfo,
    collectOldSchoolInfo,
    collectNewSchoolInfo,
    collectRemarks,
    collectAttestation,
  ].reduce((acc, collector) => ({ ...acc, ...collector(form.data) }), {});

  data.dateSigned = todaysDate();
  data.statementOfTruthSignature = form.data.statementOfTruthSignature;

  const submitData = transformForSubmit(
    formConfig,
    { ...form, data },
    { allowPartialAddress: true },
  );

  return JSON.stringify({
    educationBenefitsClaim: {
      form: submitData,
    },
  });
}
