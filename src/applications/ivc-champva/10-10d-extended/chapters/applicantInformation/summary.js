import {
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import ApplicantSummaryCard from '../../components/FormDescriptions/ApplicantSummaryCard';
import { APPLICANTS_MAX } from '../../utils/constants';
import { formatFullName } from '../../utils/helpers';
import { validateApplicant } from '../../utils/validations';

export const applicantOptions = {
  arrayPath: 'applicants',
  nounSingular: 'applicant',
  nounPlural: 'applicants',
  required: true,
  isItemIncomplete: validateApplicant,
  maxItems: APPLICANTS_MAX,
  text: {
    getItemName: item => formatFullName(item.applicantName),
    cardDescription: ApplicantSummaryCard,
  },
};

export default {
  uiSchema: {
    'view:hasApplicants': arrayBuilderYesNoUI(applicantOptions),
  },
  schema: {
    type: 'object',
    required: ['view:hasApplicants'],
    properties: {
      'view:hasApplicants': arrayBuilderYesNoSchema,
    },
  },
};
