import React from 'react';
import { VaAccordion } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { getAccessVALinks } from './AccessVALinks';
import './accessva-tools-widget.scss';

export function AccessVAToolsWidget() {
  // Get environment-appropriate links (staging or production)
  const accessVALinks = getAccessVALinks();
  return (
    <div className="accessva-tools-widget">
      {/* Accordion */}
      <VaAccordion>
        <va-accordion-item
          header="Veterans, family members, and service members"
          id="veterans-accordion"
        >
          <ul className="usa-list">
            {accessVALinks.veterans.map((link, index) => (
              <li key={index}>
                <a href={link.url} className="vads-u-color--link-default">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </va-accordion-item>

        <va-accordion-item
          header="Business partners, employees, and contractors"
          id="business-accordion"
        >
          <ul className="usa-list">
            {accessVALinks.business.map((link, index) => (
              <li key={index}>
                <a href={link.url} className="vads-u-color--link-default">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </va-accordion-item>
      </VaAccordion>
    </div>
  );
}

export default AccessVAToolsWidget;
