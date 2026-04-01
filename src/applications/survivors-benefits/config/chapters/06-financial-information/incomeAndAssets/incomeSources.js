import {
  titleUI,
  radioUI,
  radioSchema,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { isYes } from '../../../../utils/helpers';
import {
  incomeSourceLabels,
  DEFAULT_INCOME_SOURCES,
  VERSION_2025_INCOME_SOURCES,
} from '../../../../utils/labels';
import { IncomeAssetStatementFormAlert } from '../../../../components/FormAlerts';

const uiSchema = {
  ...titleUI('Income sources'),
  moreThanFourIncomeSources: yesNoUI({
    title: DEFAULT_INCOME_SOURCES,
    'ui:required': true,
  }),
  incomeAssetStatementFormAlert: {
    'ui:description': IncomeAssetStatementFormAlert,
    'ui:options': {
      hideIf: formData => {
        if (formData?.survivorsBenefitsForm2025VersionEnabled) {
          return !['MORE_THAN_FIVE_SOURCES'].includes(
            formData?.moreThanFourIncomeSources,
          );
        }
        return !isYes(formData?.moreThanFourIncomeSources);
      },
      displayEmptyObjectOnReview: true,
    },
  },
  otherIncome: yesNoUI({
    title:
      'Other than Social Security, did you or your dependents receive any income last year that you no longer receive?',
    'ui:required': true,
  }),
  incomeAssetStatementFormAlertOtherIncome: {
    'ui:description': IncomeAssetStatementFormAlert,
    'ui:options': {
      hideIf: formData => !isYes(formData?.otherIncome),
      displayEmptyObjectOnReview: true,
    },
  },
};

const uiSchema2025 = {
  ...titleUI('Income sources'),
  moreThanFourIncomeSources: radioUI({
    title: VERSION_2025_INCOME_SOURCES,
    labels: incomeSourceLabels,
    'ui:required': true,
  }),
  incomeAssetStatementFormAlert: {
    'ui:description': IncomeAssetStatementFormAlert,
    'ui:options': {
      hideIf: formData => {
        if (formData?.survivorsBenefitsForm2025VersionEnabled) {
          return !['MORE_THAN_FIVE_SOURCES'].includes(
            formData?.moreThanFourIncomeSources,
          );
        }
        return !isYes(formData?.moreThanFourIncomeSources);
      },
      displayEmptyObjectOnReview: true,
    },
  },
  otherIncome: yesNoUI({
    title:
      'Other than Social Security, did you or your dependents receive any income last year that you no longer receive?',
    'ui:required': true,
  }),
  incomeAssetStatementFormAlertOtherIncome: {
    'ui:description': IncomeAssetStatementFormAlert,
    'ui:options': {
      hideIf: formData => !isYes(formData?.otherIncome),
      displayEmptyObjectOnReview: true,
    },
  },
};

const schema = {
  type: 'object',
  required: ['moreThanFourIncomeSources', 'otherIncome'],
  properties: {
    moreThanFourIncomeSources: yesNoSchema,
    incomeAssetStatementFormAlert: {
      type: 'object',
      properties: {},
    },
    otherIncome: yesNoSchema,
    incomeAssetStatementFormAlertOtherIncome: {
      type: 'object',
      properties: {},
    },
  },
};

const schema2025 = {
  type: 'object',
  required: ['moreThanFourIncomeSources', 'otherIncome'],
  properties: {
    moreThanFourIncomeSources: radioSchema(Object.keys(incomeSourceLabels)),
    incomeAssetStatementFormAlert: {
      type: 'object',
      properties: {},
    },
    otherIncome: yesNoSchema,
    incomeAssetStatementFormAlertOtherIncome: {
      type: 'object',
      properties: {},
    },
  },
};

export default {
  uiSchema,
  uiSchema2025,
  schema,
  schema2025,
};
