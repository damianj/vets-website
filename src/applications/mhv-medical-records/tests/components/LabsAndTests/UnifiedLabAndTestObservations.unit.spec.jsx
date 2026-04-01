import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import UnifiedLabAndTestObservations from '../../../components/LabsAndTests/UnifiedLabAndTestObservations';

describe('UnifiedLabAndTestObservations Component', () => {
  const mockResults = [
    {
      testCode: 'Test Code 1',
      value: { text: 'Value 1' },
      referenceRange: 'Range 1',
      status: 'Status 1',
      bodySite: 'Body Site 1',
      sampleTested: 'Sample 1',
      comments: ['Comment 1'],
    },
    {
      testCode: 'Test Code 2',
      value: { text: 'Value 2' },
      referenceRange: 'Range 2',
      status: 'Status 2',
    },
  ];

  it('renders the component with provided results', () => {
    const screen = render(
      <UnifiedLabAndTestObservations results={mockResults} />,
    );

    expect(screen.getByText('Test Code 1')).to.exist;
    expect(screen.getByText('Value 1')).to.exist;
    expect(screen.getByText('Range 1')).to.exist;
    expect(screen.getByText('Status 1')).to.exist;
    expect(screen.getByText('Body Site 1')).to.exist;
    expect(screen.getByText('Sample 1')).to.exist;
    expect(screen.getByText('Comment 1')).to.exist;

    expect(screen.getByText('Test Code 2')).to.exist;
    expect(screen.getByText('Value 2')).to.exist;
    expect(screen.getByText('Range 2')).to.exist;
    expect(screen.getByText('Status 2')).to.exist;
  });

  it('does not render optional fields if they are not provided', () => {
    const screen = render(
      <UnifiedLabAndTestObservations results={mockResults} />,
    );

    expect(screen.queryByText('Body Site 2')).not.to.exist;
    expect(screen.queryByText('Sample 2')).not.to.exist;
    expect(screen.queryByText('Comment 2')).not.to.exist;
  });

  it('renders multiple comments as separate list items', () => {
    const multiCommentResults = [
      {
        testCode: 'Cholesterol',
        value: { text: '180 mg/dL' },
        referenceRange: '',
        status: 'Final',
        comments: [
          '<200 mg/dL: Desirable',
          '200-240 mg/dL: Borderline',
          '>240 mg/dL: At risk',
        ],
      },
    ];

    const screen = render(
      <UnifiedLabAndTestObservations results={multiCommentResults} />,
    );

    expect(screen.getByText('<200 mg/dL: Desirable')).to.exist;
    expect(screen.getByText('200-240 mg/dL: Borderline')).to.exist;
    expect(screen.getByText('>240 mg/dL: At risk')).to.exist;
  });

  it('renders string comments for backward compatibility', () => {
    const stringCommentResults = [
      {
        testCode: 'Glucose',
        value: { text: '100 mg/dL' },
        referenceRange: '',
        status: 'Final',
        comments: 'Old format string comment',
      },
    ];

    const screen = render(
      <UnifiedLabAndTestObservations results={stringCommentResults} />,
    );

    expect(screen.getByText('Old format string comment')).to.exist;
  });

  it('displays interpretation when present, mapped via interpretationMap', () => {
    const resultsWithInterpretation = [
      {
        testCode: 'Glucose',
        value: { text: '250 mg/dL' },
        referenceRange: '70 - 110',
        status: 'final',
        interpretation: 'H',
        comments: [],
      },
    ];

    const screen = render(
      <UnifiedLabAndTestObservations results={resultsWithInterpretation} />,
    );

    expect(screen.getByText('Interpretation')).to.exist;
    expect(screen.getByText('High')).to.exist;
  });

  it('displays critical high interpretation correctly', () => {
    const resultsWithCriticalHigh = [
      {
        testCode: 'Potassium',
        value: { text: '7.0 meq/L' },
        referenceRange: '3.5 - 5.1',
        status: 'final',
        interpretation: 'HH',
        comments: [],
      },
    ];

    const screen = render(
      <UnifiedLabAndTestObservations results={resultsWithCriticalHigh} />,
    );

    expect(screen.getByText('Interpretation')).to.exist;
    expect(screen.getByText('Critical high')).to.exist;
  });

  it('does not render interpretation row when interpretation is absent', () => {
    const resultsWithoutInterpretation = [
      {
        testCode: 'Sodium',
        value: { text: '140 mmol/L' },
        referenceRange: '136 - 145',
        status: 'final',
        comments: [],
      },
    ];

    const screen = render(
      <UnifiedLabAndTestObservations results={resultsWithoutInterpretation} />,
    );

    expect(screen.queryByText('Interpretation')).not.to.exist;
  });

  it('displays raw interpretation code when not found in interpretationMap', () => {
    const resultsWithUnmappedCode = [
      {
        testCode: 'Custom Test',
        value: { text: 'Positive' },
        referenceRange: '',
        status: 'final',
        interpretation: 'UNKNOWN_CODE',
        comments: [],
      },
    ];

    const screen = render(
      <UnifiedLabAndTestObservations results={resultsWithUnmappedCode} />,
    );

    expect(screen.getByText('Interpretation')).to.exist;
    expect(screen.getByText('UNKNOWN_CODE')).to.exist;
  });
});
