import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { fireEvent } from '@testing-library/react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import reducer from '../../../reducers';
import * as helpers from '../../../util/helpers';
import ScdfImagesReadyAlert from '../../../components/shared/ScdfImagesReadyAlert';

describe('<ScdfImagesReadyAlert />', () => {
  let dataDogStub;

  beforeEach(() => {
    dataDogStub = sinon.stub(helpers, 'sendDataDogAction');
  });

  afterEach(() => {
    dataDogStub.restore();
  });

  it('renders nothing when records is empty', () => {
    const { container } = renderWithStoreAndRouter(
      <ScdfImagesReadyAlert records={[]} />,
      { initialState: {}, reducers: reducer, path: '/' },
    );
    expect(container.innerHTML).to.equal('');
  });

  it('renders nothing when records is undefined', () => {
    const { container } = renderWithStoreAndRouter(<ScdfImagesReadyAlert />, {
      initialState: {},
      reducers: reducer,
      path: '/',
    });
    expect(container.innerHTML).to.equal('');
  });

  it('renders alert with a single record', () => {
    const records = [{ id: 'study-1', name: 'CHEST XRAY', imageCount: 1 }];
    const { getByTestId, getByText } = renderWithStoreAndRouter(
      <ScdfImagesReadyAlert records={records} />,
      { initialState: {}, reducers: reducer, path: '/' },
    );

    expect(getByTestId('alert-scdf-images-ready')).to.exist;
    expect(getByText(/Images are available for the following results/i)).to
      .exist;

    const link = getByTestId('scdf-radiology-view-images');
    expect(link.textContent).to.contain('CHEST XRAY (1 image)');
    expect(link.getAttribute('href')).to.equal(
      '/labs-and-tests/study-1/images',
    );
  });

  it('renders a list for multiple records and pluralizes correctly', () => {
    const records = [
      { id: 'study-1', name: 'CHEST XRAY', imageCount: 1 },
      { id: 'study-2', name: 'CT THORAX', imageCount: 4 },
    ];
    const { getAllByTestId } = renderWithStoreAndRouter(
      <ScdfImagesReadyAlert records={records} />,
      { initialState: {}, reducers: reducer, path: '/' },
    );

    const links = getAllByTestId('scdf-radiology-view-images');
    expect(links).to.have.lengthOf(2);
    expect(links[0].textContent).to.contain('CHEST XRAY (1 image)');
    expect(links[1].textContent).to.contain('CT THORAX (4 images)');
  });

  it('sends a DataDog action on link click', () => {
    const records = [{ id: 'study-1', name: 'CHEST XRAY', imageCount: 2 }];
    const { getByTestId } = renderWithStoreAndRouter(
      <ScdfImagesReadyAlert records={records} />,
      { initialState: {}, reducers: reducer, path: '/' },
    );

    fireEvent.click(getByTestId('scdf-radiology-view-images'));
    expect(dataDogStub.callCount).to.equal(1);
    expect(dataDogStub.getCall(0).args[0]).to.equal('View all images');
  });
});
