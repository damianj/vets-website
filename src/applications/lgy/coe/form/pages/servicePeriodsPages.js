import React from 'react';
import {
  arrayBuilderItemFirstPageTitleUI,
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
  currentOrPastDateRangeSchema,
  currentOrPastDateRangeUI,
  titleUI,
  serviceBranchUI,
  serviceBranchSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import { formatReviewDate } from 'platform/forms-system/src/js/helpers';
import serviceBranchLabels from 'platform/forms-system/src/js/web-component-patterns/content/serviceBranch.json';

const TOGGLE_KEY = 'view:coeFormRebuildCveteam';

const options = {
  arrayPath: 'periodsOfService',
  nounSingular: 'service period',
  nounPlural: 'service periods',
  required: true,
  isItemIncomplete: item => !item?.serviceBranch || !item?.dateRange?.from,
  text: {
    getItemName: item =>
      item?.serviceBranch?.label ||
      serviceBranchLabels[(item?.serviceBranch)]?.label ||
      item?.serviceBranch,
    cardDescription: item =>
      `${formatReviewDate(item?.dateRange?.from)} - ${formatReviewDate(
        item?.dateRange?.to,
      ) || 'unknown'}`, // Unknown is not included in designs, at least yet, but was decided in coordination with Megan 3/25/2026
    alertItemUpdated: ({ getItemName, itemData, index, formData }) => {
      const itemName = getItemName(itemData, index, formData);
      return itemName
        ? `${itemName} service period has been updated`
        : 'Service period has been updated';
    },
    deleteTitle: () => 'Delete this service period?',
    deleteNeedAtLeastOneDescription: ({
      getItemName,
      itemData,
      index,
      formData,
    }) => {
      const itemName = getItemName(itemData, index, formData);
      return (
        <>
          <p>
            If you delete this service period, you’ll lose the information you
            entered
            {itemName ? ` for "${itemName}"` : ''}.
          </p>
          <p>
            We’ll take you back to where you can add another service period.
          </p>
        </>
      );
    },
    deleteDescription: ({ getItemName, itemData, index, formData }) => {
      const itemName = getItemName(itemData, index, formData);
      return (
        <>
          <p>
            If you delete this service period, you’ll lose the information you
            entered
            {itemName ? ` for "${itemName}"` : ''}.
          </p>
          <p>
            We’ll take you back to where you can add another service period.
          </p>
        </>
      );
    },
    deleteYes: () => 'Yes, delete',
    deleteNo: () => 'No, keep',
    cancelEditTitle: () => 'Cancel editing this service period?',
    cancelAddTitle: () => 'Cancel adding this service period?',
    cancelEditDescription: () =>
      "If you cancel, you'll lose any changes you made to this service period. We'll take you back to where you can review your service periods.",
    cancelEditYes: () => 'Yes, cancel editing',
    cancelEditNo: () => 'No, continue editing',
  },
};

const introPage = {
  uiSchema: {
    ...titleUI(
      'Add service period',
      <>
        <p className="vads-u-margin-top--4">
          In the next few questions, we’ll ask you about your military service.
          You must add at least one service period.
        </p>
      </>,
    ),
  },
  schema: {
    type: 'object',
    properties: {},
  },
};

const summaryPage = {
  uiSchema: {
    'view:hasServicePeriods': arrayBuilderYesNoUI(
      options,
      {
        title: 'Do you have a service period to add?',
        labels: { Y: 'Yes', N: 'No' },
        labelHeaderLevel: 'p',
      },
      {
        title: 'Do you have another service period to add?',
        labels: { Y: 'Yes', N: 'No' },
        labelHeaderLevel: 'p',
      },
    ),
  },
  schema: {
    type: 'object',
    properties: {
      'view:hasServicePeriods': arrayBuilderYesNoSchema,
    },
    required: ['view:hasServicePeriods'],
  },
};

const itemPage = {
  uiSchema: {
    ...arrayBuilderItemFirstPageTitleUI({
      title: 'Service period',
      nounSingular: options.nounSingular,
      hasMultipleItemPages: false,
      showEditExplanationText: false,
      description: 'You must add at least 1 service period.',
    }),
    serviceBranch: serviceBranchUI({
      title: 'Branch of service',
      errorMessages: { required: 'Select a branch of service' },
    }),
    dateRange: currentOrPastDateRangeUI(
      {
        title: 'Service start date',
        hint:
          "If you don't know when your service period started, enter your best guess",
        removeDateHint: true,
      },
      {
        title: 'Service end date',
        hint:
          "If this is your current service period or don't know when your service period ended you can enter your best guess.",
        removeDateHint: true,
      },
    ),
  },
  schema: {
    type: 'object',
    properties: {
      serviceBranch: serviceBranchSchema(),
      dateRange: {
        ...currentOrPastDateRangeSchema,
        required: ['from'],
      },
    },
    required: ['serviceBranch', 'dateRange'],
  },
};

export const servicePeriodsPages = arrayBuilderPages(options, pageBuilder => ({
  servicePeriodsIntro: pageBuilder.introPage({
    title: 'Add service period',
    path: 'service-history-rebuild',
    depends: formData => formData?.[TOGGLE_KEY],
    uiSchema: introPage.uiSchema,
    schema: introPage.schema,
  }),
  servicePeriodsSummary: pageBuilder.summaryPage({
    title: 'Review your service periods',
    path: 'service-history-rebuild-summary',
    depends: formData => formData?.[TOGGLE_KEY],
    uiSchema: summaryPage.uiSchema,
    schema: summaryPage.schema,
  }),
  servicePeriodsItem: pageBuilder.itemPage({
    title: 'Service period',
    path: 'service-history-rebuild/:index/service-period',
    depends: formData => formData?.[TOGGLE_KEY],
    uiSchema: itemPage.uiSchema,
    schema: itemPage.schema,
  }),
}));
