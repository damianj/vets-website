import React from 'react';
import { srSubstitute } from '~/platform/forms-system/src/js/utilities/ui/mask-string';
import { VALUE_CLASSES } from '../constants';

export const getFullName = (nameObj = {}) => {
  return [nameObj.first || '', nameObj.middle || '', nameObj.last || '']
    .filter(Boolean)
    .join(' ')
    .trim();
};

export const renderFullName = (nameObj, actionName = 'Veteran full name') => {
  const fullName = getFullName(nameObj);

  return fullName ? (
    <dd className={VALUE_CLASSES} data-dd-action-name={actionName}>
      {fullName}
      {nameObj.suffix ? `, ${nameObj.suffix}` : ''}
    </dd>
  ) : null;
};

// separate each number so the screenreader reads "number ending with 1 2 3 4"
// instead of "number ending with 1,234"
export const maskVafn = number => {
  return srSubstitute(
    `***–**–${number}`,
    `V A file number ending with ${number.split('').join(' ')}`,
  );
};
