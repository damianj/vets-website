import { setData } from 'platform/forms-system/src/js/actions';
import vaRadioFieldMapping from 'platform/forms-system/src/js/web-component-fields/vaRadioFieldMapping';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import content from '../../locales/en/content.json';
import { VaRadio, VaRadioOption } from '../../utils/imports';

export const NOT_SHARED = 'na';
export const OPTION_NO_LABEL = content['address-selection--no-option'];
export const OPTION_YES_LABEL = content['address-selection--yes-option'];

export const formatAddress = ({ street, street2, city, state, country } = {}) =>
  [street, street2, [city, state].filter(Boolean).join(', '), country]
    .filter(Boolean)
    .join(', ');

export const parseItemIndex = index => {
  if (index === null || index === undefined || index === '') return null;
  const normalizedIndex = Number(index);
  return Number.isInteger(normalizedIndex) && normalizedIndex >= 0
    ? normalizedIndex
    : null;
};

export const safeParse = str => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

const buildAddressOptions = addresses => [
  ...addresses
    .reduce((map, addr) => {
      const formatted = formatAddress(addr);
      if (formatted && !map.has(formatted)) {
        map.set(formatted, { label: formatted, val: JSON.stringify(addr) });
      }
      return map;
    }, new Map())
    .values(),
];

const extractAddresses = (fullData, sourceKeys, excludeIndex) =>
  [sourceKeys].flat().flatMap(key => {
    if (!key.includes('.')) return fullData?.[key] ? [fullData[key]] : [];

    const [arrayPath, prop] = key.split('.');
    return (fullData?.[arrayPath] || [])
      .filter((_, idx) => idx !== excludeIndex)
      .map(item => item?.[prop])
      .filter(Boolean);
  });

const updateApplicantsAtIndex = (applicants = [], index, updater) => {
  if (index === null || applicants[index] === undefined) return applicants;
  const nextApplicants = [...applicants];
  nextApplicants[index] = updater(nextApplicants[index]);
  return nextApplicants;
};

const updateFieldData = (target, fieldName, nextValue, dataKey) => {
  const updated = { ...target, [fieldName]: nextValue };

  if (nextValue === NOT_SHARED) {
    delete updated[dataKey];
    return updated;
  }

  const parsedAddress = safeParse(nextValue);
  return parsedAddress ? { ...updated, [dataKey]: parsedAddress } : updated;
};

const AddressSelectionField = props => {
  const { childrenProps, index, uiOptions } = props;
  const dispatch = useDispatch();
  const mappedProps = vaRadioFieldMapping(props);
  const fullData = useSelector(state => state.form?.data);

  const itemIndex = parseItemIndex(index);
  const isArrayMode = itemIndex !== null;
  const dataKey = uiOptions?.destinationKey;
  const currentValue = childrenProps?.formData ?? mappedProps?.value;
  const fieldName = childrenProps?.name;

  const setDataValue = useCallback(
    ({ detail } = {}) => {
      const nextValue = detail?.value;
      if (nextValue === currentValue) return;

      const updateTarget = target =>
        updateFieldData(target, fieldName, nextValue, dataKey);

      const updatedData = isArrayMode
        ? {
            ...fullData,
            applicants: updateApplicantsAtIndex(
              fullData.applicants,
              itemIndex,
              updateTarget,
            ),
          }
        : updateTarget(fullData);

      childrenProps?.onChange(nextValue);
      dispatch(setData(updatedData));
    },
    [
      childrenProps,
      currentValue,
      dataKey,
      dispatch,
      fieldName,
      fullData,
      isArrayMode,
      itemIndex,
    ],
  );

  const addressOpts = useMemo(
    () => {
      const addresses = extractAddresses(
        fullData,
        uiOptions?.sourceKeys || [],
        isArrayMode ? itemIndex : -1,
      );
      return buildAddressOptions(addresses);
    },
    [fullData, isArrayMode, itemIndex, uiOptions?.sourceKeys],
  );

  const vaRadioOpts = useMemo(
    () => (
      <>
        <VaRadioOption
          key="not_shared"
          name={mappedProps.name}
          label={OPTION_NO_LABEL}
          value={NOT_SHARED}
          checked={currentValue === NOT_SHARED}
          data-dd-privacy="mask"
        />
        {addressOpts.map(({ label, val }) => (
          <VaRadioOption
            key={label}
            name={mappedProps.name}
            label={`${OPTION_YES_LABEL} ${label}`}
            value={val}
            checked={val === currentValue}
            data-dd-privacy="mask"
          />
        ))}
      </>
    ),
    [addressOpts, currentValue, mappedProps.name],
  );

  return (
    <VaRadio {...mappedProps} onVaValueChange={setDataValue}>
      {vaRadioOpts}
    </VaRadio>
  );
};

AddressSelectionField.propTypes = {
  childrenProps: PropTypes.shape({
    formData: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
  }),
  index: PropTypes.string,
  uiOptions: PropTypes.shape({
    destinationKey: PropTypes.string,
    sourceKeys: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
};

export default AddressSelectionField;
