import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import {
  applicantDependentStatusIn,
  applicantHasNoSharedAddressSelection,
  applicantHasRemarried,
  applicantIsChild,
  applicantIsCollegeAge,
  applicantIsSpouse,
  applicantOriginIs,
  canSelectApplicantAddress,
  requireBirthCertificate,
  sponsorIsDeceased,
  whenAll,
} from '../../utils/helpers';
import addressSelection from './addressSelection';
import adoptionProof from './adoptionProof';
import birthCertificate from './birthCertificate';
import birthSex from './birthSex';
import contactInformation from './contactInformation';
import dependentStatus from './dependentStatus';
import identificationInformation from './identificationInformation';
import mailingAddress from './mailingAddress';
import marriageDate from './marriageDate';
import personalInformation from './personalInformation';
import relationshipOrigin from './relationshipOrigin';
import relationshipToVeteran from './relationshipToVeteran';
import remarriage from './remarriage';
import remarriageProof from './remarriageProof';
import schoolEnrollmentProof from './schoolEnrollmentProof';
import sectionOverview from './sectionOverview';
import stepchildMarriageProof from './stepchildMarriageProof';
import summary, { applicantOptions } from './summary';

export const applicantPages = arrayBuilderPages(
  applicantOptions,
  pageBuilder => ({
    applicantOverview: pageBuilder.introPage({
      path: 'applicant-information-overview',
      title: '[noun plural]',
      ...sectionOverview,
    }),
    applicantSummary: pageBuilder.summaryPage({
      path: 'review-applicants',
      title: 'Review applicants',
      ...summary,
    }),
    applicantPersonalInformation: pageBuilder.itemPage({
      path: 'applicant-name-and-date-of-birth/:index',
      title: 'Applicant name and date of birth',
      ...personalInformation,
    }),
    applicantIdentityInformation: pageBuilder.itemPage({
      path: 'applicant-social-security-number/:index',
      title: 'Applicant identification information',
      ...identificationInformation,
    }),
    applicationAddress: pageBuilder.itemPage({
      path: 'applicant-address/:index',
      title: 'Address selection',
      depends: canSelectApplicantAddress,
      ...addressSelection,
    }),
    applicantMailingAddress: pageBuilder.itemPage({
      path: 'applicant-mailing-address/:index',
      title: 'Mailing address',
      depends: applicantHasNoSharedAddressSelection,
      ...mailingAddress,
    }),
    applicantContactInformation: pageBuilder.itemPage({
      path: 'applicant-contact-information/:index',
      title: 'Contact information',
      ...contactInformation,
    }),
    applicantBirthSex: pageBuilder.itemPage({
      path: 'applicant-birth-sex/:index',
      title: 'Birth sex',
      ...birthSex,
    }),
    applicantRelationshipToVeteran: pageBuilder.itemPage({
      path: 'applicant-relationship-to-veteran/:index',
      title: 'Relationship to the Veteran',
      ...relationshipToVeteran,
    }),
    applicantDependentStatus: pageBuilder.itemPage({
      path: 'applicant-dependent-status/:index',
      title: 'Dependent status',
      depends: applicantIsChild,
      ...relationshipOrigin,
    }),
    applicantBirthCertificate: pageBuilder.itemPage({
      path: 'applicant-birth-certificate/:index',
      title: 'Applicant birth certificate',
      depends: requireBirthCertificate,
      ...birthCertificate,
    }),
    applicantAdoptionProof: pageBuilder.itemPage({
      path: 'applicant-adoption-documents/:index',
      title: 'Applicant adoption documents',
      depends: whenAll(applicantIsChild, applicantOriginIs('adoption')),
      ...adoptionProof,
    }),
    applicantMarriageProof: pageBuilder.itemPage({
      path: 'applicant-proof-of-marriage-or-legal-union/:index',
      title: 'Upload proof of parent’s marriage or legal union',
      depends: whenAll(applicantIsChild, applicantOriginIs('step')),
      ...stepchildMarriageProof,
    }),
    applicantDependentStatusDetails: pageBuilder.itemPage({
      path: 'applicant-dependent-status-details/:index',
      title: 'Applicant dependent status',
      depends: whenAll(applicantIsChild, applicantIsCollegeAge),
      ...dependentStatus,
    }),
    applicantSchoolEnrollmentProof: pageBuilder.itemPage({
      path: 'applicant-proof-of-school-enrollment/:index',
      title: 'Applicant school documents',
      depends: whenAll(
        applicantIsChild,
        applicantIsCollegeAge,
        applicantDependentStatusIn(['enrolled', 'intendsToEnroll']),
      ),
      ...schoolEnrollmentProof,
    }),
    applicantMarriageDates: pageBuilder.itemPage({
      path: 'applicant-marriage-dates/:index',
      title: 'Applicant marriage dates',
      depends: applicantIsSpouse,
      ...marriageDate,
    }),
    applicantMarriageStatus: pageBuilder.itemPage({
      path: 'applicant-marriage-status/:index',
      title: 'Marriage status',
      depends: whenAll(applicantIsSpouse, sponsorIsDeceased),
      ...remarriage,
    }),
    applicantRemarriageProof: pageBuilder.itemPage({
      path: 'applicant-proof-of-remarriage/:index',
      title: 'Upload proof of remarriage',
      depends: whenAll(
        applicantIsSpouse,
        sponsorIsDeceased,
        applicantHasRemarried,
      ),
      ...remarriageProof,
    }),
  }),
);
