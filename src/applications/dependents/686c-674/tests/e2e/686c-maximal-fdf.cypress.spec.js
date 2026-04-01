import path from 'path';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';

import formConfig from '../../config/form';
import manifest from '../../manifest.json';
import { setupCypress } from './cypress.helpers';

// Performance: skip CSS animation waits between page transitions
Cypress.config('waitForAnimations', false);

/**
 * FDF-specific page hooks — identical form-fill logic to the shared hooks
 * but WITHOUT cy.injectAxeThenAxeCheck() on every page. Axe accessibility
 * coverage is handled by the dedicated accessibility test suite; this spec
 * validates that every conditional FDF field is reachable and submittable.
 *
 * Marriage history hooks are omitted because the FDF fixture uses empty
 * arrays for spouseMarriageHistory / veteranMarriageHistory to keep total
 * page count under 90. Marriage history array pages are already covered by
 * the non-FDF 686C-674-maximal.cypress.spec.js.
 */
const fdfPageHooks = {
  introduction: ({ afterHook }) => {
    afterHook(() => {
      cy.wait('@mockVaFileNumber');
      cy.clickStartForm();
    });
  },

  'current-marriage-information/date-of-marriage': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        if (data.currentMarriageInformation?.date) {
          cy.fillVaMemorableDate(
            'root_currentMarriageInformation_date',
            data.currentMarriageInformation.date,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  'current-marriage-information/location-of-marriage': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        if (data.currentMarriageInformation?.outsideUsa) {
          cy.get(
            'va-checkbox[name="root_currentMarriageInformation_outsideUsa"]',
          )
            .shadow()
            .find('input[type="checkbox"]')
            .check({ force: true });
        }

        const location = data.currentMarriageInformation?.location;

        if (location?.city) {
          cy.fillVaTextInput(
            'root_currentMarriageInformation_location_city',
            location.city,
          );
        }

        if (location?.state) {
          cy.get(
            'select[name="root_currentMarriageInformation_location_state"]',
          ).select(location.state);
        }

        if (location?.country) {
          cy.get(
            'va-select[name="root_currentMarriageInformation_location_country"]',
          ).should('be.visible');
          cy.selectVaSelect(
            'root_currentMarriageInformation_location_country',
            location.country,
          );
        }

        cy.clickFormContinue();
      });
    });
  },

  'current-marriage-information/spouse-address': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const address = data.doesLiveWithSpouse?.address;
        cy.fillAddressWebComponentPattern(
          'doesLiveWithSpouse_address',
          address,
        );
        cy.clickFormContinue();
      });
    });
  },

  '686-report-add-child/:index/marriage-end-details': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const child = data.childrenToAdd?.[0];

        if (child?.marriageEndDate) {
          cy.fillVaMemorableDate('root_marriageEndDate', child.marriageEndDate);
        }

        if (child?.marriageEndReason) {
          cy.selectVaRadioOption(
            'root_marriageEndReason',
            child.marriageEndReason,
          );
        }

        if (
          child?.marriageEndReason === 'Other' &&
          child?.marriageEndDescription
        ) {
          cy.fillVaTextInput(
            'root_marriageEndDescription',
            child.marriageEndDescription,
          );
        }

        cy.clickFormContinue();
      });
    });
  },

  'check-veteran-pension': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        if (data?.veteranInformation?.isInReceiptOfPension === -1) {
          cy.selectYesNoVaRadioOption('view:checkVeteranPension', true);
        }
        cy.clickFormContinue();
      });
    });
  },

  'report-674/add-students/:index/student-marriage-date': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const student = data.studentInformation?.[0];
        if (student?.marriageDate) {
          cy.fillVaMemorableDate('root_marriageDate', student.marriageDate);
        }
        cy.clickFormContinue();
      });
    });
  },

  'report-674/add-students/:index/student-relationship': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const student = data.studentInformation?.[0];
        if (student?.relationshipToStudent) {
          cy.selectVaRadioOption(
            'root_relationshipToStudent',
            student.relationshipToStudent,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  'report-674/add-students/:index/student-education-benefits/start-date': ({
    afterHook,
  }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const student = data.studentInformation?.[0];
        if (student?.benefitPaymentDate) {
          cy.fillVaMemorableDate(
            'root_benefitPaymentDate',
            student.benefitPaymentDate,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  'report-674/add-students/:index/term-dates': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const termDates =
          data.studentInformation?.[0]?.schoolInformation?.currentTermDates;
        if (termDates?.officialSchoolStartDate) {
          cy.fillVaMemorableDate(
            'root_schoolInformation_currentTermDates_officialSchoolStartDate',
            termDates.officialSchoolStartDate,
          );
        }
        if (termDates?.expectedStudentStartDate) {
          cy.fillVaMemorableDate(
            'root_schoolInformation_currentTermDates_expectedStudentStartDate',
            termDates.expectedStudentStartDate,
          );
        }
        if (termDates?.expectedGraduationDate) {
          cy.fillVaMemorableDate(
            'root_schoolInformation_currentTermDates_expectedGraduationDate',
            termDates.expectedGraduationDate,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  'report-674/add-students/:index/previous-term-dates': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const lastTerm =
          data.studentInformation?.[0]?.schoolInformation
            ?.lastTermSchoolInformation;

        if (lastTerm?.termBegin) {
          cy.fillVaMemorableDate(
            'root_schoolInformation_lastTermSchoolInformation_termBegin',
            lastTerm.termBegin,
          );
        }

        if (lastTerm?.dateTermEnded) {
          cy.fillVaMemorableDate(
            'root_schoolInformation_lastTermSchoolInformation_dateTermEnded',
            lastTerm.dateTermEnded,
          );
        }

        cy.clickFormContinue();
      });
    });
  },

  'report-674/add-students/:index/date-student-stopped-attending': ({
    afterHook,
  }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const date =
          data.studentInformation?.[0]?.schoolInformation?.dateFullTimeEnded;

        if (date) {
          cy.fillVaMemorableDate(
            'root_schoolInformation_dateFullTimeEnded',
            date,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  'report-674/add-students/:index/additional-remarks': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const student = data.studentInformation?.[0];
        if (student?.remarks) {
          cy.fillVaTextarea('root_remarks', student.remarks);
        }
        cy.clickFormContinue();
      });
    });
  },

  '686-report-marriage-of-child/:index/date-child-married': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const child = data.childMarriage?.[0];
        if (child?.dateMarried) {
          cy.fillVaMemorableDate('root_dateMarried', child.dateMarried);
        }
        cy.clickFormContinue();
      });
    });
  },

  'report-child-stopped-attending-school/:index/date-child-left-school': ({
    afterHook,
  }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const child = data.childStoppedAttendingSchool?.[0];
        if (child?.dateChildLeftSchool) {
          cy.fillVaMemorableDate(
            'root_dateChildLeftSchool',
            child.dateChildLeftSchool,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  '686-stepchild-no-longer-part-of-household/:index/child-address': ({
    afterHook,
  }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const stepchild = data.stepChildren?.[0];
        const address = stepchild?.address;
        cy.fillAddressWebComponentPattern('address', address);
        cy.clickFormContinue();
      });
    });
  },

  '686-report-dependent-death/:index/date-of-death': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const death = data.deaths?.[0];
        if (death?.dependentDeathDate) {
          cy.fillVaMemorableDate(
            'root_dependentDeathDate',
            death.dependentDeathDate,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  '686-stepchild-no-longer-part-of-household/:index/date-child-left-household': ({
    afterHook,
  }) => {
    afterHook(() => {
      cy.get('@testData').then(data => {
        const stepchild = data.stepChildren?.[0];
        if (stepchild?.dateStepchildLeftHousehold) {
          cy.fillVaMemorableDate(
            'root_dateStepchildLeftHousehold',
            stepchild.dateStepchildLeftHousehold,
          );
        }
        cy.clickFormContinue();
      });
    });
  },

  'review-and-submit': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(() => {
        cy.fillVaStatementOfTruth({
          fullName: 'John Doe',
          checked: true,
        });
        cy.clickFormContinue();
      });
    });
  },
};

const testConfig = createTestConfig(
  {
    useWebComponentFields: true,
    dataPrefix: 'data',
    dataSets: ['686c-maximal-fdf'],
    fixtures: { data: path.join(__dirname, 'fixtures') },
    setupPerTest: () => setupCypress({ useFdfMocks: true }),
    pageHooks: fdfPageHooks,

    // Performance: skip form-tester's built-in axe checks (2 per page).
    // Accessibility is validated by the dedicated a11y test suite.
    _13647Exception: true,
  },

  manifest,
  formConfig,
);

testForm(testConfig);
