import environment from 'platform/utilities/environment';

import footerContent from 'platform/forms/components/FormFooter';
import { externalServices } from 'platform/monitoring/DowntimeNotification';
import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';
import {
  checkValidPagePath,
  getNextPagePath,
} from 'platform/forms-system/src/js/routing';
import manifest from '../manifest.json';
import { FORM_21_4502 } from '../definitions/constants';

import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import getHelp from '../../shared/components/GetFormHelp';
import transformForSubmit from './submit-transformer';

import EligibilityFormPage from '../pages/eligibility';
import personalInfoBasic from '../pages/personalInfoBasic';
import contactInfo from '../pages/contactInfo';
import address from '../pages/address';
import serviceStatus from '../pages/serviceStatus';
import plannedAddress from '../pages/plannedAddress';
import applicationInformation from '../pages/applicationInformation';
import { qualifyingDisabilitiesPage as qualifyingDisabilitiesPageConfig } from '../pages/qualifyingDisabilities';
import currentServiceStatus from '../pages/currentServiceStatus';
import veteranStatusInformation from '../pages/veteranStatusInformation';
import veteranDisabilityCompensation from '../pages/veteranDisabilityCompensation';
import vehicleDetails from '../pages/vehicleDetails';
import vehicleUse from '../pages/vehicleUse';
import previousVehicleApplication from '../pages/previousVehicleApplication';
import certification from '../pages/certification';

const handleFormLoaded = props => {
  const {
    returnUrl,
    router,
    routes,
    formData,
    formConfig: loadedFormConfig,
  } = props;
  const pageList = routes?.[routes.length - 1]?.pageList || [];
  const introPath = `${loadedFormConfig?.urlPrefix || '/'}introduction`;
  const fallbackPath =
    getNextPagePath(pageList, formData, introPath) || introPath;
  const safeReturnUrl =
    returnUrl && checkValidPagePath(pageList, formData, returnUrl)
      ? returnUrl
      : fallbackPath;

  router.push(safeReturnUrl);
};

/** @type {FormConfig} */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/simple_forms_api/v1/simple_forms`,
  trackingPrefix: 'ss-4502-',
  defaultDefinitions: {},
  dev: {
    collapsibleNavLinks: true,
    showNavLinks: true,
  },
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  preSubmitInfo: {
    statementOfTruth: {
      body:
        'I confirm that the identifying information in this form is accurate and has been represented correctly.',
      messageAriaDescribedby:
        'I confirm that the identifying information in this form is accurate and has been represented correctly.',
      fullNamePath: 'veteran.fullName',
    },
  },
  formId: '21-4502',
  saveInProgress: {
    messages: {
      inProgress:
        'Your application for automobile or adaptive equipment is in progress.',
      expired:
        'Your saved application for automobile or adaptive equipment has expired.',
      saved:
        'Your application for automobile or adaptive equipment has been saved.',
    },
  },
  onFormLoaded: handleFormLoaded,
  version: 0,
  prefillEnabled: true,
  transformForSubmit,
  savedFormMessages: {
    notFound:
      'Please start over to complete your application for automobile or adaptive equipment.',
    noAuth:
      'Please sign in again to continue your application for automobile or adaptive equipment.',
  },
  hideUnauthedStartLink: true,
  title: FORM_21_4502.FORM_CONFIG.TITLE,
  subTitle: FORM_21_4502.FORM_CONFIG.SUB_TITLE,
  customText: {
    appType: 'veteran application',
    finishAppLaterMessage: 'Finish this application later',
    submitButtonText: 'Submit Application',
    reviewPageTitle: 'Review and sign',
    reviewPageFormTitle: '',
  },
  showSaveLinkAfterButtons: false,
  ...minimalHeaderFormConfigOptions({
    breadcrumbList: [
      { href: '/', label: 'VA.gov home' },
      { href: '/disability', label: 'Disability' },
      { href: '/disability/eligibility', label: 'Eligibility' },
      {
        href: '/disability/eligibility/automobile-adaptive-equipment',
        label: 'Automobile or adaptive equipment',
      },
    ],
  }),

  chapters: {
    eligibilityChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_ELIGIBILITY,
      hideOnReviewPage: true,
      pages: {
        eligibilityPage: {
          path: 'eligibility',
          title: FORM_21_4502.FORM_CONFIG.CHAPTER_ELIGIBILITY,
          CustomPage: EligibilityFormPage,
          CustomPageReview: null,
          uiSchema: {},
          schema: { type: 'object', properties: {} },
        },
      },
    },
    veteranIdChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_VETERAN_ID,
      pages: {
        personalInfoBasicPage: {
          path: 'personal-information',
          title: FORM_21_4502.FORM_CONFIG.PAGE_PERSONAL_INFO,
          uiSchema: personalInfoBasic.uiSchema,
          schema: personalInfoBasic.schema,
        },
      },
    },
    contactChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_CONTACT,
      pages: {
        contactInfoPage: {
          path: 'contact-information',
          title: FORM_21_4502.FORM_CONFIG.PAGE_CONTACT,
          uiSchema: contactInfo.uiSchema,
          schema: contactInfo.schema,
          updateFormData: (oldData, newData) => {
            const alt = newData?.veteran?.alternatePhone;
            if (
              alt &&
              (!alt.contact || String(alt.contact).trim() === '') &&
              (alt.callingCode === null || alt.callingCode === undefined)
            ) {
              return {
                ...newData,
                veteran: {
                  ...newData.veteran,
                  alternatePhone: {
                    ...alt,
                    callingCode: 1,
                    countryCode: alt.countryCode || 'US',
                  },
                },
              };
            }
            return newData;
          },
        },
      },
    },
    addressChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_ADDRESS,
      pages: {
        addressPage: {
          path: 'address',
          title: FORM_21_4502.FORM_CONFIG.PAGE_ADDRESS,
          uiSchema: address.uiSchema,
          schema: address.schema,
        },
      },
    },
    serviceStatusChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_SERVICE_STATUS,
      pages: {
        serviceStatusPage: {
          path: 'service-status',
          title: FORM_21_4502.FORM_CONFIG.PAGE_SERVICE_STATUS,
          uiSchema: serviceStatus.uiSchema,
          schema: serviceStatus.schema,
        },
        plannedAddressPage: {
          path: 'planned-address',
          title: FORM_21_4502.FORM_CONFIG.PAGE_PLANNED_ADDRESS,
          uiSchema: plannedAddress.uiSchema,
          schema: plannedAddress.schema,
          depends: formData =>
            formData?.applicationInfo?.activeDutyStatus === true,
        },
      },
    },
    applicationAndServiceInformationChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_APPLICATION,
      pages: {
        applicationInformationPage: {
          path: 'application-information',
          title: FORM_21_4502.FORM_CONFIG.PAGE_APPLICATION_INFO,
          uiSchema: applicationInformation.uiSchema,
          schema: applicationInformation.schema,
        },
      },
    },
    qualifyingDisabilitiesChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_QUALIFYING,
      pages: {
        qualifyingDisabilitiesPage: {
          path: 'qualifying-disabilities',
          title: FORM_21_4502.FORM_CONFIG.PAGE_QUALIFYING,
          uiSchema: qualifyingDisabilitiesPageConfig.uiSchema,
          schema: qualifyingDisabilitiesPageConfig.schema,
        },
      },
    },
    serviceRecordChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_SERVICE_RECORD,
      pages: {
        currentServiceStatusPage: {
          path: 'current-service-status',
          title: FORM_21_4502.FORM_CONFIG.PAGE_CURRENT_SERVICE,
          uiSchema: currentServiceStatus.uiSchema,
          schema: currentServiceStatus.schema,
        },
        veteranStatusInformationPage: {
          path: 'veteran-status-information',
          title: FORM_21_4502.FORM_CONFIG.PAGE_VETERAN_STATUS,
          uiSchema: veteranStatusInformation.uiSchema,
          schema: veteranStatusInformation.schema,
          depends: formData =>
            formData?.applicationInfo?.currentlyOnActiveDuty === false,
        },
        veteranDisabilityCompensationPage: {
          path: 'veteran-disability-compensation',
          title: FORM_21_4502.FORM_CONFIG.PAGE_DISABILITY,
          uiSchema: veteranDisabilityCompensation.uiSchema,
          schema: veteranDisabilityCompensation.schema,
          depends: formData =>
            formData?.applicationInfo?.currentlyOnActiveDuty === false,
        },
      },
    },
    conveyanceTypeChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_CONVEYANCE,
      pages: {
        vehicleDetailsPage: {
          path: 'vehicle-details',
          title: FORM_21_4502.FORM_CONFIG.PAGE_VEHICLE_DETAILS,
          uiSchema: vehicleDetails.uiSchema,
          schema: vehicleDetails.schema,
        },
      },
    },
    vehicleUseChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_VEHICLE_USE,
      pages: {
        vehicleUsePage: {
          path: 'vehicle-use',
          title: FORM_21_4502.FORM_CONFIG.PAGE_VEHICLE_USE,
          uiSchema: vehicleUse.uiSchema,
          schema: vehicleUse.schema,
        },
      },
    },
    previousVehicleApplicationChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_PREVIOUS_VEHICLE,
      pages: {
        previousVehicleApplicationPage: {
          path: 'previous-vehicle-application',
          title: FORM_21_4502.FORM_CONFIG.PAGE_PREVIOUS_VEHICLE,
          uiSchema: previousVehicleApplication.uiSchema,
          schema: previousVehicleApplication.schema,
        },
      },
    },
    certificationChapter: {
      title: FORM_21_4502.FORM_CONFIG.CHAPTER_CERTIFICATION,
      pages: {
        certificationPage: {
          path: 'certification',
          title: FORM_21_4502.FORM_CONFIG.PAGE_CERTIFICATION,
          uiSchema: certification.uiSchema,
          schema: certification.schema,
        },
      },
    },
  },
  downtime: {
    dependencies: [externalServices.lighthouseBenefitsIntake],
  },
  footerContent,
  getHelp,
};

export default formConfig;
