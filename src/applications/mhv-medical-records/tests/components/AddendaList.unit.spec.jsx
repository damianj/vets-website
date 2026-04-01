import { expect } from 'chai';
import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import reducer from '../../reducers';
import AddendaList from '../../components/CareSummaries/AddendaList';

const sampleAddenda = [
  {
    date: '2024-12-18T05:22:40+00:00',
    dateSigned: '2024-12-18T05:25:10+00:00',
    writtenBy: 'MARCI P MCGUIRE',
    signedBy: 'MARCI P MCGUIRE',
    note: 'VGhpcyBpcyBhIHRlc3Qgbm90ZSBjb250ZW50Lg==', // "This is a test note content."
  },
  {
    date: '2024-12-12T11:28:20+00:00',
    dateSigned: '2024-12-12T11:28:47+00:00',
    writtenBy: 'VICTORIA A BORLAND',
    signedBy: 'VICTORIA A BORLAND',
    note: 'VGhpcyBpcyBhbiBhZGRlbmR1bSBub3RlLg==', // "This is an addendum note."
  },
];

describe('AddendaList', () => {
  const initialState = {
    mr: {
      careSummariesAndNotes: {
        careSummariesAndNotesList: [],
      },
    },
  };

  it('renders without errors', () => {
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={sampleAddenda} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    expect(screen).to.exist;
  });

  it('should display the correct number of addenda items', () => {
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={sampleAddenda} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    const items = screen.getAllByTestId('notes-list-item');
    expect(items.length).to.equal(2);
  });

  it('should display formatted dates for each addendum', () => {
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={sampleAddenda} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    const dateElements = screen.getAllByTestId('note-list-item-date');
    expect(dateElements.length).to.equal(2);
    expect(dateElements[0].textContent).to.include('December');
  });

  it('should display the "Date entered" label', () => {
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={sampleAddenda} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    expect(screen.getAllByText('Date entered').length).to.be.greaterThan(0);
  });

  it('should display "Written by" when writtenBy is present', () => {
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={sampleAddenda} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    const writtenByElements = screen.getAllByTestId(
      'note-list-item-written-by',
    );
    expect(writtenByElements.length).to.equal(2);
    expect(writtenByElements[0].textContent).to.include('MARCI P MCGUIRE');
  });

  it('should display "Signed by" when signedBy is present', () => {
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={sampleAddenda} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    const signedByElements = screen.getAllByTestId('note-list-item-signed-by');
    expect(signedByElements.length).to.equal(2);
    expect(signedByElements[0].textContent).to.include('MARCI P MCGUIRE');
  });

  it('should display the decoded note content for each addendum', () => {
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={sampleAddenda} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    const noteElements = screen.getAllByTestId('note-list-item-note');
    expect(noteElements.length).to.equal(2);
    expect(noteElements[0].textContent).to.include(
      'This is a test note content.',
    );
    expect(noteElements[1].textContent).to.include('This is an addendum note.');
  });

  it('should hide "Written by" when writtenBy is null', () => {
    const addendaWithoutAuthor = [
      {
        ...sampleAddenda[0],
        writtenBy: null,
        signedBy: null,
      },
    ];
    const screen = renderWithStoreAndRouter(
      <AddendaList addenda={addendaWithoutAuthor} />,
      {
        initialState,
        reducers: reducer,
        path: '/summaries-and-notes/',
      },
    );
    const writtenByElements = screen.queryAllByTestId(
      'note-list-item-written-by',
    );
    expect(writtenByElements.length).to.equal(0);
  });
});
