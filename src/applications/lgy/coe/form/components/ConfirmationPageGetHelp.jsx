import React from 'react';
import { GetHelpContent } from './GetHelpContent';

export const ConfirmationPageGetHelp = () => (
  <div className="vads-u-margin-top--9">
    <va-need-help>
      <div slot="content">
        <GetHelpContent />
      </div>
    </va-need-help>
  </div>
);
