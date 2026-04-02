/**
 * Mock medical copay statement shaped like the Lighthouse / medicalCopays API response.
 * Used by StatementTable and related unit tests.
 */
export const mockLighthouseMedicalCopayStatement = {
  id: '4-2vKmP9xQr3nTw',
  type: 'medicalCopays',
  attributes: {
    url: null,
    facility: 'James A. Haley Veterans Hospital',
    facilityId: 'ORG-VAMC',
    city: 'LYONS',
    currentBalance: 50,
    externalId: '4-2vKmP9xQr3nTw',
    invoiceDate: '2024-11-15T10:30:00Z',
    lastUpdatedAt: null,
    billNumber: '4-6c9ZE23XjkA9CC',
    previousBalance: 50,
    previousUnpaidBalance: 50,
  },
};

/** Line items passed to StatementTable as `charges` (detail / line-item rows). */
export const createLighthouseLineItems = count => {
  return Array.from({ length: count }, (_, i) => ({
    datePosted: '2023-10-01',
    description: `Charge ${i + 1}`,
    priceComponents: [{ amount: 10.0 }],
    providerName: 'Test Provider',
  }));
};
