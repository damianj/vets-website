import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { sendDataDogAction } from '../../util/helpers';

const ScdfImagesReadyAlert = ({ records }) => {
  if (!records?.length) return null;

  return (
    <VaAlert
      status="success"
      visible
      class="vads-u-margin-y--3 no-print"
      role="alert"
      data-testid="alert-scdf-images-ready"
    >
      <h3 slot="headline" className="vads-u-font-size--lg no-print">
        Images ready
      </h3>
      <p>Images are available for the following results:</p>
      <ul
        style={{ listStyle: 'none' }}
        className="vads-u-padding-x--0 vads-u-margin-bottom--0"
      >
        {records.map((record, index) => {
          const isLast = index === records.length - 1;
          const liClass = isLast ? '' : 'vads-u-margin-bottom--2';
          return (
            <li key={record.id} className={liClass}>
              <Link
                to={`/labs-and-tests/${record.id}/images`}
                data-testid="scdf-radiology-view-images"
                data-dd-privacy="mask"
                data-dd-action-name="[images ready alert - view images]"
                onClick={() => {
                  sendDataDogAction('View all images');
                }}
              >
                {record.name} ({record.imageCount}{' '}
                {record.imageCount === 1 ? 'image' : 'images'})
              </Link>
            </li>
          );
        })}
      </ul>
    </VaAlert>
  );
};

export default ScdfImagesReadyAlert;

ScdfImagesReadyAlert.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      imageCount: PropTypes.number,
    }),
  ),
};
