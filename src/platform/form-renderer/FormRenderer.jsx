import React from 'react';
import PropTypes from 'prop-types';
import {
  getNestedProperty,
  renderStr,
  formatPhoneNumber,
  formatDateValue,
  formatSSN,
  formatInternationalPhoneNumber,
  formatMilitaryPostOffice,
  formatStateName,
} from './util';

import './sass/FormRenderer.scss';

function createLabel(obj) {
  const tag = `h${obj.depth + 2}`;
  const baseClassName =
    {
      h2: 'vads-u-margin-top--0 vads-u-margin-bottom--0',
      h3: 'vads-u-margin-top--0 vads-u-margin-bottom--1',
      h4: 'vads-u-margin-top--2 vads-u-margin-bottom--0',
    }[tag] || '';
  const className = obj.style
    ? `${baseClassName} block-style-${obj.style}`.trim()
    : baseClassName;
  return React.createElement(tag, { className, key: obj.key }, obj.label);
}

function createField(obj) {
  return (
    <li id={`li-${obj.key}`} key={obj.key} className="form-renderer-item">
      <div key={obj.key} className="vads-grid-row vads-u-margin-x--0">
        <div className="vads-grid-col-5 vads-u-padding-x--0">{obj.label}</div>
        <div className="vads-grid-col-7 vads-u-padding-left--3 vads-u-padding-right--2p5 vads-u-font-weight--bold">
          {obj.value}
        </div>
      </div>
    </li>
  );
}

function createMultilineField(obj) {
  const lines = obj.values?.map((value, index) => {
    const key = `${obj.key}[#${index}]`;
    return (
      <div key={key} className="vads-u-font-weight--bold">
        {value}
      </div>
    );
  });
  return (
    <li id={`li-${obj.key}`} key={obj.key}>
      <div>{obj.label}</div>
      {lines}
    </li>
  );
}

function createChecklist(obj) {
  const label = obj.label.endsWith('?') ? obj.label : `${obj.label}:`;
  return (
    <li id={`li-${obj.key}`} key={obj.key} className="form-renderer-item">
      <div key={obj.key} className="vads-grid-row">
        <div className="vads-grid-col-5">{label}</div>
        <div className="vads-grid-col-6 vads-u-font-weight--bold vads-u-margin-left--2">
          <ul className="no-bullets">
            {obj.options.map(opt => {
              return (
                <li key={opt}>
                  <div>✓ {opt}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}

function handleStringFormatting(field, data) {
  let renderedValue = renderStr(field.fieldValue, data);
  const formatToken = field.fieldFormat?.toLowerCase();
  switch (formatToken) {
    case 'ssn':
      renderedValue = formatSSN(renderedValue);
      break;
    case 'phone':
      renderedValue = formatPhoneNumber(renderedValue);
      break;
    case 'internationalphone':
      renderedValue = formatInternationalPhoneNumber(renderedValue);
      break;
    case 'biographicaldate':
    case 'dob':
    case 'date':
      renderedValue = formatDateValue(renderedValue);
      break;
    case 'militarypostoffice':
      renderedValue = formatMilitaryPostOffice(renderedValue);
      break;
    case 'state':
      renderedValue = formatStateName(renderedValue);
      break;
    default:
      if (
        !field.fieldFormat &&
        field.fieldLabel.toLowerCase().includes('state')
      ) {
        renderedValue = formatStateName(renderedValue);
      }
      if (field.fieldDisplayMap && renderedValue in field.fieldDisplayMap) {
        renderedValue = renderStr(field.fieldDisplayMap[renderedValue], data);
      }
      return renderedValue;
  }
  return renderedValue;
}

function emit(obj) {
  if (!obj) {
    return [];
  }
  return [obj];
}

function renderPart(part, data, depth, key, suppressRepeatable) {
  if (part.showIf && !getNestedProperty(data, part.showIf)) return [];
  if (part.showUnless && getNestedProperty(data, part.showUnless)) return [];

  if ('blocks' in part || 'fields' in part) {
    const grouping = part;

    if (grouping.repeatable && !suppressRepeatable) {
      const items = getNestedProperty(data, grouping.repeatable);
      if (!(items instanceof Array)) return [];

      return items
        .map((item, index) => {
          const itemCopy = { ...item, LIST_INDEX: index + 1 };
          return renderPart(
            grouping,
            itemCopy,
            depth,
            `${key}[#${index}]`,
            true,
          );
        })
        .flat();
    }

    const labelValue = grouping.sectionHeader || grouping.blockLabel;
    const label =
      typeof labelValue === 'string' ? renderStr(labelValue, data) : labelValue;
    const style = grouping.blockStyle;
    const header = { label, depth, key, ...(style && { style }) };
    emit(header);

    const renderables = [header];
    const subpartTypes = [
      { items: grouping.fields, prefix: 'fields' },
      { items: grouping.blocks, prefix: 'blocks' },
    ];

    subpartTypes.forEach(({ items, prefix }) => {
      if (!items) return;
      const results = items
        .map((subpart, index) =>
          renderPart(subpart, data, depth + 1, `${key}.${prefix}[${index}]`),
        )
        .flat();
      renderables.push(...results);
    });

    return renderables;
  }

  if (part.fieldType === 'multiline') {
    const field = part;
    const renderedMultiline = renderStr(field.fieldValue, data);
    const values =
      renderedMultiline?.length === 0 ? [] : renderedMultiline?.split('\n');
    return emit({
      label: part.fieldLabel,
      values,
      key,
    });
  }

  if ('fieldValue' in part) {
    const field = part;
    return emit({
      label: field.fieldLabel,
      value: handleStringFormatting(field, data),
      key,
    });
  }

  if ('style' in part && part.style === 'checklist') {
    const options = part.options
      .filter(option => renderStr(option.value, data) === 'true')
      .map(option => option.label);
    return emit(options.length ? { label: part.label, options, key } : null);
  }

  return [];
}

function render(template, data) {
  let listItemCount = 0;
  let orderedListCount = 0;
  const elements = [];

  const addToCurrentItems = (currentListItems, element, type) => {
    listItemCount += 1;
    if (type === 'field') {
      currentListItems.push(createField(element));
    } else if (type === 'multilineField') {
      currentListItems.push(createMultilineField(element));
    } else if (type === 'checklist') {
      currentListItems.push(createChecklist(element));
    }
  };

  const createList = (currentListItems, index) => {
    const start = listItemCount - currentListItems.length + 1;
    const olId = `ol-section-${index}-group-${orderedListCount}`;
    const descId = `${olId}-continue`;
    elements.push(
      <div key={olId}>
        {orderedListCount > 0 && (
          <p id={descId} className="sr-only">
            Question numbering continues from the previous section.
          </p>
        )}
        <ol
          className="vads-u-margin-top--0 vads-u-margin-bottom--1p5"
          {...orderedListCount > 0 && {
            'aria-describedby': descId,
          }}
          start={start}
          id={olId}
        >
          {currentListItems}
        </ol>
      </div>,
    );
    orderedListCount += 1;
  };

  for (const [index, section] of template.sections.entries()) {
    if (index > 0) {
      elements.push(
        <hr
          className="vads-u-border--1px vads-u-border-color--gray-light vads-u-margin-y--1p5"
          key={`HR-${index}`}
        />,
      );
    }

    let currentListItems = [];

    for (const el of renderPart(section, data, 0, `.sections[${index}]`)) {
      if ('depth' in el) {
        if (currentListItems.length > 0) {
          createList(currentListItems, index);
          currentListItems = [];
        }
        elements.push(createLabel(el));
      } else if ('value' in el) {
        addToCurrentItems(currentListItems, el, 'field');
      } else if ('values' in el) {
        addToCurrentItems(currentListItems, el, 'multilineField');
      } else if ('options' in el) {
        addToCurrentItems(currentListItems, el, 'checklist');
      }
    }

    if (currentListItems.length > 0) {
      createList(currentListItems, index);
      currentListItems = [];
    }
  }

  return elements;
}

const FormRenderer = ({ config, data }) => {
  const rendered = render(config, data);
  const signatureInfo = `Signed electronically and submitted via VA.gov on
          ${data.signatureDate}.`;
  return (
    <div className="digital-forms-renderer vads-grid-container vads-u-padding--0">
      <div className="vads-grid-col-12">
        <h1 className="vads-u-margin-bottom--1 vads-u-margin-top--0">
          {config.formDescription}{' '}
          <span className="form-name">(VA Form {config.formId})</span>
        </h1>
        <div>{config.formVersion}</div>
        <div>{signatureInfo}</div>
        {rendered}
        <div>
          <span>
            {signatureInfo} Signee signed with an identity-verified account.
          </span>
        </div>
      </div>
    </div>
  );
};

FormRenderer.propTypes = {
  config: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default FormRenderer;
