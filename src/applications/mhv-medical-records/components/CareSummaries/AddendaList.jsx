import React from 'react';
import PropTypes from 'prop-types';
import { decodeBase64Report } from '../../util/helpers';
import { formatDateTimeInUserTimezone } from '../../util/dateHelpers';
import { EMPTY_FIELD } from '../../util/constants';
import LabelValue from '../shared/LabelValue';

/**
 * Component that renders an array of addenda from the backend.
 * Each addendum is displayed as a card with date, author, and
 * the decoded base64 note content.
 *
 * @param {Object} props
 * @param {Array} props.addenda - Array of raw addendum objects from the backend
 */
const AddendaList = ({ addenda }) => {
  return (
    <div data-testid="notes-list">
      <ul className="record-list-items vads-u-margin--0 vads-u-padding--0">
        {addenda.map((addendum, index) => (
          <li
            key={`${addendum.dateSigned || addendum.date || index}-${
              addendum.writtenBy
            }`}
          >
            <va-card
              background
              class="record-list-item vads-u-padding-y--2p5 vads-u-margin-bottom--2p5 vads-u-padding-x--3"
              data-testid="notes-list-item"
              data-dd-privacy="mask"
            >
              <LabelValue
                label="Date entered"
                value={
                  formatDateTimeInUserTimezone(addendum.date) || EMPTY_FIELD
                }
                testId="note-list-item-date"
                actionName="[addendum - date]"
              />
              {addendum.writtenBy && (
                <LabelValue
                  label="Written by"
                  value={addendum.writtenBy}
                  testId="note-list-item-written-by"
                  actionName="[note - written by]"
                />
              )}
              {addendum.signedBy && (
                <LabelValue
                  label="Signed by"
                  value={addendum.signedBy}
                  testId="note-list-item-signed-by"
                  actionName="[note - signed by]"
                />
              )}

              <div
                className="vads-u-margin-top--1p5"
                data-testid="note-list-item-note"
              >
                <span className="vads-u-font-weight--bold">Note</span>
                <p
                  className="monospace vads-u-line-height--6 vads-u-margin-y--0 breakable-text-wrap"
                  data-dd-privacy="mask"
                  data-dd-action-name="[note list - note content]"
                >
                  {decodeBase64Report(addendum.note)}
                </p>
              </div>
            </va-card>
          </li>
        ))}
      </ul>
    </div>
  );
};

AddendaList.propTypes = {
  addenda: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      dateSigned: PropTypes.string,
      writtenBy: PropTypes.string,
      signedBy: PropTypes.string,
      note: PropTypes.string,
    }),
  ),
};

export default AddendaList;
