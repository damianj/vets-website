import { merge } from 'lodash';
import {
  fullNameSchema,
  fullNameUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../locales/en/content.json';
import AddressSelectionField from '../components/FormFields/AddressSelectionField';
import AddressSelectionReviewField from '../components/FormReview/AddressSelectionReviewField';

const MIDDLE_NAME_SCHEMA = { type: 'string', maxLength: 1 };

export const addressSelectionUI = ({ title, ...uiOptions }) => ({
  'ui:title': title,
  'ui:webComponentField': AddressSelectionField,
  'ui:reviewField': AddressSelectionReviewField,
  'ui:options': {
    ...uiOptions,
  },
});

export const fullNameMiddleInitialUI = merge({}, fullNameUI(), {
  middle: { 'ui:title': content['form-label--middle-initial'] },
});

export const fullNameMiddleInitialSchema = merge({}, fullNameSchema, {
  properties: { middle: MIDDLE_NAME_SCHEMA },
});
