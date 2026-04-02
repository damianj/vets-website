// @ts-check
import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';
import footerContent from 'platform/forms/components/FormFooter';
import { VA_FORM_IDS } from 'platform/forms/constants';
import {
  profilePersonalInfoPage,
  profileContactInfoPages,
} from 'platform/forms-system/src/js/patterns/prefill';
import { transformForSubmit } from 'platform/forms-system/src/js/helpers';
import { prefillTransformer } from './prefill-transformer';
import { TITLE, SUBTITLE } from '../constants';
import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';

/**
 * Creates a formConfig for the mock-form-prefill app.
 * Accepts an options object to allow the minimal-header variant
 * to share the same config with a different rootUrl.
 *
 * minimalHeaderFormConfigOptions() auto-detects whether the
 * minimal header DOM is present — it returns {} when it's not,
 * so it's safe to always spread.
 *
 * @param {Object} [options]
 * @param {string} [options.rootUrl] - Override rootUrl (defaults to manifest.rootUrl)
 * @returns {FormConfig}
 */
export const createFormConfig = ({ rootUrl } = {}) => ({
  rootUrl: rootUrl || manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: '/v0/api',
  submit: () =>
    Promise.resolve({ attributes: { confirmationNumber: '123123123' } }),
  trackingPrefix: 'mock-prefill-',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  transformForSubmit,
  preSubmitInfo: {
    statementOfTruth: {
      body:
        'I confirm that the identifying information in this form is accurate has been represented correctly.',
      messageAriaDescribedby:
        'I confirm that the identifying information in this form is accurate has been represented correctly.',
      fullNamePath: 'fullName',
    },
  },
  dev: {
    showNavLinks: true,
    collapsibleNavLinks: true,
    disableWindowUnloadInCI: true,
  },
  ...minimalHeaderFormConfigOptions({
    breadcrumbList: [
      { href: '/', label: 'VA.gov home' },
      {
        href: rootUrl || manifest.rootUrl,
        label: 'Mock form prefill',
      },
    ],
  }),
  formId: VA_FORM_IDS.FORM_MOCK_PREFILL,
  saveInProgress: {
    messages: {
      inProgress:
        'Your mock prefill testing application (FORM_MOCK_PREFILL) is in progress.',
      expired:
        'Your saved mock prefill testing application (FORM_MOCK_PREFILL) has expired. If you want to apply for mock prefill testing, please start a new application.',
      saved: 'Your mock prefill testing application has been saved.',
    },
  },
  version: 0,
  prefillTransformer,
  prefillEnabled: true,
  savedFormMessages: {
    notFound: 'Please start over to apply for mock prefill testing.',
    noAuth:
      'Please sign in again to continue your application for mock prefill testing.',
  },
  title: TITLE,
  subTitle: SUBTITLE,
  defaultDefinitions: {},
  chapters: {
    contactInfo: {
      title: 'Veteran information',
      pages: {
        ...profilePersonalInfoPage(),
        ...profileContactInfoPages(),
      },
    },
  },
  footerContent,
});

/** @type {FormConfig} */
const formConfig = createFormConfig();

export default formConfig;
