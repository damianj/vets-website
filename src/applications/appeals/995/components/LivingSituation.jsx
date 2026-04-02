import React from 'react';
import PropTypes from 'prop-types';
import {
  housingRiskTitle,
  livingSituationTitle,
  livingSituationList,
  otherHousingRisksLabel,
  pointOfContactNameLabel,
  pointOfContactPhoneLabel,
} from '../content/livingSituation';
import { convertBoolResponseToYesNo } from '../../shared/utils/form-data-display';
import {
  CHAPTER_HEADER_CLASSES,
  LABEL_CLASSES,
  VALUE_CLASSES,
} from '../../shared/constants';

export const LivingSituation = ({ data } = {}) => (
  <>
    <h3 className={CHAPTER_HEADER_CLASSES}>Living situation</h3>
    <dl>
      <dt className={LABEL_CLASSES}>{housingRiskTitle}</dt>
      <dd className={VALUE_CLASSES} data-dd-action-name="has housing risk">
        {convertBoolResponseToYesNo(data?.housingRisk)}
      </dd>
      {data.housingRisk && (
        <>
          <dt className={LABEL_CLASSES}>{livingSituationTitle}</dt>
          <dd className={VALUE_CLASSES} data-dd-action-name="living situation">
            {livingSituationList(data?.livingSituation) || 'None selected'}
          </dd>
          {data.livingSituation?.other && (
            <>
              <dt className={LABEL_CLASSES}>{otherHousingRisksLabel}</dt>
              <dd
                className={VALUE_CLASSES}
                data-dd-action-name="other housing risks"
              >
                {data.otherHousingRisks || 'Nothing entered'}
              </dd>
            </>
          )}
          <dt className={LABEL_CLASSES}>{pointOfContactNameLabel}</dt>
          <dd
            className={VALUE_CLASSES}
            data-dd-action-name="point of contact full name"
          >
            {data.pointOfContactName || 'Nothing entered'}
          </dd>
          <dt className={LABEL_CLASSES}>{pointOfContactPhoneLabel}</dt>
          <dd
            className={VALUE_CLASSES}
            data-dd-action-name="point of contact phone number"
          >
            {data.pointOfContactPhone ? (
              <va-telephone
                contact={data.pointOfContactPhone}
                international={data.pointOfContactHasInternationalPhone}
                not-clickable
              />
            ) : (
              'Nothing entered'
            )}
          </dd>
        </>
      )}
    </dl>
  </>
);

LivingSituation.propTypes = {
  data: PropTypes.shape({
    housingRisk: PropTypes.bool,
    livingSituation: PropTypes.shape({
      facility30Days: PropTypes.bool,
      friendOrFamily: PropTypes.bool,
      home30Days: PropTypes.bool,
      none: PropTypes.bool,
      notRegular: PropTypes.bool,
      other: PropTypes.bool,
      shelter: PropTypes.bool,
    }),
    otherHousingRisks: PropTypes.string,
    pointOfContactName: PropTypes.string,
    pointOfContactPhone: PropTypes.string,
    pointOfContactHasInternationalPhone: PropTypes.bool,
  }),
};
