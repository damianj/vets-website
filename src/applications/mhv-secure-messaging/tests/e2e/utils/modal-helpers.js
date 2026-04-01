/**
 * Helpers for clicking VaModal built-in primary/secondary buttons
 * via shadow DOM. Use these instead of repeating the 3-line
 * .shadow().find('button.usa-button...').click() pattern.
 */

/**
 * Click the primary (non-outline) button inside a va-modal's shadow DOM.
 * @param {string} testId - The data-testid of the modal element
 * @param {Object} [clickOptions] - Options to pass to cy.click()
 */
export const clickModalPrimaryButtonByTestId = (testId, clickOptions = {}) => {
  cy.findByTestId(testId)
    .shadow()
    .find('button.usa-button:not(.usa-button--outline)')
    .click(clickOptions);
};

/**
 * Click the secondary (outline) button inside a va-modal's shadow DOM.
 * @param {string} testId - The data-testid of the modal element
 * @param {Object} [clickOptions] - Options to pass to cy.click()
 */
export const clickModalSecondaryButtonByTestId = (
  testId,
  clickOptions = {},
) => {
  cy.findByTestId(testId)
    .shadow()
    .find('button.usa-button--outline')
    .click(clickOptions);
};
