import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import FormRenderer from '../FormRenderer';

describe('FormRenderer', () => {
  const submission = require('./testdata');

  it('should render FormRenderer', () => {
    const tree = render(
      <FormRenderer config={submission.config} data={submission.data} />,
    );

    expect(tree.getByText('Section 1: Veteran information')).to.exist;
    tree.unmount();
  });

  it('should accurately render the sections as an ordered list', () => {
    const tree = render(
      <FormRenderer config={submission.config} data={submission.data} />,
    );
    const olElement = document.querySelector('#ol-section-0-group-0');
    const listItems = document.querySelectorAll('#ol-section-0-group-0 li');
    const firstItemTextContent = listItems[0].textContent;
    expect(firstItemTextContent).to.equal('Name:John Quincy Veteran');

    expect(olElement).to.exist;
    expect(listItems.length).to.equal(3);
    tree.unmount();
  });

  it.skip('should accurately render checklist field as a list item', () => {
    const tree = render(
      <FormRenderer config={submission.config} data={submission.data} />,
    );

    const olElement = document.querySelector('#ol-section-1-group-1');
    const listItems = document.querySelectorAll('#ol-section-1-group-1 li');
    const firstItemTextContent = listItems[0].textContent;
    const secondItemTextContent = listItems[1].textContent;

    expect(olElement).to.exist;
    expect(listItems.length).to.equal(4);
    expect(firstItemTextContent).to.equal(
      'Is this child your biological child?No',
    );
    expect(secondItemTextContent).to.equal(
      "What's your relationship to this child?✓ They're my adopted child✓ They're my stepchild",
    );

    tree.unmount();
  });
  it('screen reader message should be present in the dom', () => {
    const tree = render(
      <FormRenderer config={submission.config} data={submission.data} />,
    );

    const orderedLists = document.querySelectorAll('ol');
    const count = orderedLists.length;
    const srElement = document.querySelector('#ol-section-0-group-1-continue');

    expect(srElement).to.exist;
    expect(count).to.equal(3);
    expect(srElement.textContent).to.equal(
      'Question numbering continues from the previous section.',
    );

    tree.unmount();
  });

  it('formats biographical date fields via fieldFormat', () => {
    const dateConfig = {
      formDescription: 'Test Form',
      formId: 'TEST-001',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Dates',
          fields: [
            {
              fieldLabel: 'Date of Birth',
              fieldFormat: 'biographicalDate',
              fieldValue: '{{person.birthDate}}',
            },
            {
              fieldLabel: 'Legacy DOB',
              fieldFormat: 'dob',
              fieldValue: '{{person.birthDate}}',
            },
            {
              fieldLabel: 'Legacy Date',
              fieldFormat: 'date',
              fieldValue: '{{person.birthDate}}',
            },
          ],
        },
      ],
    };

    const dateData = {
      person: {
        birthDate: '1980-05-12',
      },
    };

    const tree = render(<FormRenderer config={dateConfig} data={dateData} />);

    expect(tree.getAllByText('May 12, 1980')).to.have.length(3);
    tree.unmount();
  });

  it('formats SSN fields via fieldFormat', () => {
    const dateConfig = {
      formDescription: 'Test form for SSN fields',
      formId: 'test-ssn-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'SSN',
          fields: [
            {
              fieldLabel: 'SSN',
              fieldFormat: 'ssn',
              fieldValue: '{{person.ssn}}',
            },
          ],
        },
      ],
    };

    const dateData = {
      person: {
        ssn: '123456789',
      },
    };

    const tree = render(<FormRenderer config={dateConfig} data={dateData} />);

    expect(tree.getAllByText('123-45-6789')).to.have.length(1);
    tree.unmount();
  });

  it('formats international phone number fields via fieldFormat', () => {
    const dateConfig = {
      formDescription: 'Test form for SSN fields',
      formId: 'test-ssn-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'International Phone Number',
          fields: [
            {
              fieldLabel: 'International Phone Number',
              fieldFormat: 'internationalPhone',
              fieldValue: '{{person.internationalPhoneNumber}}',
            },
          ],
        },
      ],
    };

    const dateData = {
      person: {
        internationalPhoneNumber: '3123456789',
      },
    };

    const tree = render(<FormRenderer config={dateConfig} data={dateData} />);

    expect(tree.getAllByText('+3-123-456-789')).to.have.length(1);
  });

  it('formats multi-line fields correctly', () => {
    const config = {
      formDescription: 'Test form for multi-line fields',
      formId: 'test-multiline-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Multi-line field test',
          fields: [
            {
              fieldLabel: 'Uploaded files',
              fieldType: 'multiline',
              fieldValue: "{{multilineList files pluck='filepath'}}",
            },
          ],
        },
      ],
    };
    const data = {
      files: [{ filepath: 'one.jpg' }, { filepath: 'two.pdf' }],
    };

    render(<FormRenderer config={config} data={data} />);

    const listItems = document.querySelectorAll(
      '#ol-section-0-group-0 .vads-u-font-weight--bold',
    );
    expect(listItems[0].textContent).to.equal('one.jpg');
    expect(listItems[1].textContent).to.equal('two.pdf');
  });

  it('formats display-mapped fields via fieldDisplayMap', () => {
    const config = {
      formDescription: 'Test form for SSN fields',
      formId: 'test-ssn-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Marriage history',
          fields: [
            {
              fieldLabel: 'Reason marriage ended',
              fieldValue: '{{person.marriageEndReason}}',
              fieldDisplayMap: {
                DIVORCE: 'Divorce',
                OTHER: 'Other: {{person.marriageEndReasonOther}}',
              },
            },
          ],
        },
      ],
    };
    const marriageEndData = {
      person: {
        marriageEndReason: 'OTHER',
        marriageEndReasonOther: 'Magic wedding ring fell into the sea',
      },
    };

    const tree = render(
      <FormRenderer config={config} data={marriageEndData} />,
    );

    expect(
      tree.getAllByText('Other: Magic wedding ring fell into the sea'),
    ).to.have.length(1);
  });

  it('expands state abbreviations to full names', () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Address',
          fields: [
            {
              fieldLabel: 'State',
              fieldValue: '{{person.state}}',
            },
            {
              fieldLabel: 'State with explicit format',
              fieldFormat: 'state',
              fieldValue: '{{person.state2}}',
            },
          ],
        },
      ],
    };

    const stateData = {
      person: {
        state: 'VA',
        state2: 'TX',
      },
    };

    const tree = render(<FormRenderer config={stateConfig} data={stateData} />);

    expect(tree.getByText('Virginia')).to.exist;
    expect(tree.getByText('Texas')).to.exist;
  });

  it('applies blockStyle italic to block labels', () => {
    const styledConfig = {
      formDescription: 'Style test form',
      formId: 'style-test',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Section',
          blocks: [
            {
              blockLabel: 'Styled block label',
              blockStyle: 'italic',
              fields: [
                {
                  fieldLabel: 'Field',
                  fieldValue: 'value',
                },
              ],
            },
          ],
        },
      ],
    };

    const tree = render(<FormRenderer config={styledConfig} data={{}} />);

    const labelEl = tree.getByText('Styled block label');
    expect(labelEl).to.have.class('block-style-italic');
  });

  it("shows 'Yes' or 'No' based on boolean values", () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Spouse',
          fields: [
            {
              fieldLabel: 'Is your spouse a Veteran?',
              fieldType: 'boolean',
              fieldValue:
                "{{formatBool spouseInformation.isVeteran 'Yes' 'No'}}",
            },
            {
              fieldLabel: 'Do you live with your spouse?',
              fieldType: 'boolean',
              fieldValue:
                "{{formatBool spouseInformation.doesLiveWithSpouse 'Yes' 'No'}}",
            },
          ],
        },
      ],
    };

    const stateData = {
      spouseInformation: {
        isVeteran: true,
        doesLiveWithSpouse: false,
      },
    };

    const tree = render(<FormRenderer config={stateConfig} data={stateData} />);

    expect(tree.getByText('Yes')).to.exist;
    expect(tree.getByText('No')).to.exist;
  });
  it("shows 'Selected' or 'Not selected' based on boolean values", () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Spouse',
          fields: [
            {
              fieldLabel: 'Is your spouse a Veteran?',
              fieldType: 'boolean',
              fieldValue:
                "{{formatBool spouseInformation.isVeteran '✓ Selected' 'Not selected'}}",
            },
            {
              fieldLabel: 'Do you live with your spouse?',
              fieldType: 'boolean',
              fieldValue:
                "{{formatBool spouseInformation.doesLiveWithSpouse '✓ Selected' 'Not selected'}}",
            },
          ],
        },
      ],
    };

    const stateData = {
      spouseInformation: {
        isVeteran: true,
        doesLiveWithSpouse: false,
      },
    };

    const tree = render(<FormRenderer config={stateConfig} data={stateData} />);

    expect(tree.getByText('✓ Selected')).to.exist;
    expect(tree.getByText('Not selected')).to.exist;
  });

  it('should render repeatable blocks at the correct level', () => {
    const config = {
      formDescription: 'Test form for repeatable blocks',
      formId: 'test-repeatable',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Section 1',
          fields: [
            {
              fieldLabel: 'First key',
              fieldValue: 'First value',
            },
          ],
          blocks: [
            {
              repeatable: 'elements',
              blockLabel: 'Repeatable: {{first}} {{last}}',
              fields: [
                {
                  fieldLabel: 'First',
                  fieldValue: '{{first}}',
                },
              ],
            },
            {
              blockLabel: 'Coda block',
              fields: [
                {
                  fieldLabel: 'Last key',
                  fieldValue: 'Last value',
                },
              ],
            },
          ],
        },
      ],
    };
    const data = {
      elements: [
        {
          first: 'one',
          last: 'two',
        },
        {
          first: 'three',
          last: 'four',
        },
      ],
    };

    render(<FormRenderer config={config} data={data} />);

    const headers = document.querySelectorAll('h3');
    expect(headers[0].textContent).to.equal('Repeatable: one two');
    expect(headers[1].textContent).to.equal('Repeatable: three four');
    expect(headers[2].textContent).to.equal('Coda block');
  });

  it('renders signature block', () => {
    const config = {
      formDescription: 'Test form for repeatable blocks',
      formId: 'test-repeatable',
      formVersion: '1.0',
      sections: [],
    };
    const data = {
      signatureDate: '2026-03-09',
    };

    const tree = render(<FormRenderer config={config} data={data} />);

    expect(
      tree.getByText(
        'Signed electronically and submitted via VA.gov on 2026-03-09. Signee signed with an identity-verified account.',
      ),
    ).to.exist;
  });

  it('correctly shows the Biological Child response if isBiologicalChild is true', () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionId: 'addChildrenSection',
          sectionHeader: 'Section 3: Add one or more children',
          blocks: [
            {
              blockLabel: 'Child',
              fields: [
                {
                  fieldLabel: "What's your relationship to this child?",
                  fieldValue:
                    "{{formatBool isBiologicalChild '1' ''}}{{formatBool relationshipToChild.stepchild '2' ''}}{{formatBool relationshipToChild.adopted '3' ''}}",
                  fieldDisplayMap: {
                    '1': "They're my biological child",
                    '2': "They're my stepchild",
                    '3': "They're my adopted child",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const stateData = {
      isBiologicalChild: true,
    };

    const tree = render(<FormRenderer config={stateConfig} data={stateData} />);

    expect(tree.getByText("They're my biological child")).to.exist;
  });

  it('correctly shows the Stepchild response if isBiologicalChild is false (stepchild)', () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionId: 'addChildrenSection',
          sectionHeader: 'Section 3: Add one or more children',
          blocks: [
            {
              blockLabel: 'Child',
              fields: [
                {
                  fieldLabel: "What's your relationship to this child?",
                  fieldValue:
                    "{{formatBool isBiologicalChild '1' ''}}{{formatBool relationshipToChild.stepchild '2' ''}}{{formatBool relationshipToChild.adopted '3' ''}}",
                  fieldDisplayMap: {
                    '1': "They're my biological child",
                    '2': "They're my stepchild",
                    '3': "They're my adopted child",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const stateData = {
      isBiologicalChild: false,
      relationshipToChild: {
        adopted: false,
        stepchild: true,
      },
    };

    const tree = render(<FormRenderer config={stateConfig} data={stateData} />);

    expect(tree.getByText("They're my stepchild")).to.exist;
  });

  it('correctly shows the Adopted response if isBiologicalChild is false (adopted)', () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionId: 'addChildrenSection',
          sectionHeader: 'Section 3: Add one or more children',
          blocks: [
            {
              blockLabel: 'Child',
              fields: [
                {
                  fieldLabel: "What's your relationship to this child?",
                  fieldValue:
                    "{{formatBool isBiologicalChild '1' ''}}{{formatBool relationshipToChild.stepchild '2' ''}}{{formatBool relationshipToChild.adopted '3' ''}}",
                  fieldDisplayMap: {
                    '1': "They're my biological child",
                    '2': "They're my stepchild",
                    '3': "They're my adopted child",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const stateData = {
      isBiologicalChild: false,
      relationshipToChild: {
        adopted: true,
        stepchild: false,
      },
    };

    const tree = render(<FormRenderer config={stateConfig} data={stateData} />);

    expect(tree.getByText("They're my adopted child")).to.exist;
  });

  it("shows 'Yes' or 'No' based on 'Half' values", () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Stepchild',
          fields: [
            {
              fieldLabel:
                'Do you provide at least half of your stepchild’s financial support?',
              fieldType: 'string',
              fieldValue: '{{stepchild.livingExpensesPaid}}',
              fieldDisplayMap: {
                'More than half': 'Yes',
                'Less than half': 'No',
              },
            },
            {
              fieldLabel:
                'Do you provide at least half of your stepchild’s financial support?',
              fieldType: 'string',
              fieldValue: '{{stepchild2.livingExpensesPaid}}',
              fieldDisplayMap: {
                'More than half': 'Yes',
                'Less than half': 'No',
              },
            },
          ],
        },
      ],
    };

    const stateData = {
      stepchild: {
        livingExpensesPaid: 'More than half',
      },
      stepchild2: {
        livingExpensesPaid: 'Less than half',
      },
    };

    const tree = render(<FormRenderer config={stateConfig} data={stateData} />);

    expect(tree.getByText('Yes')).to.exist;
    expect(tree.getByText('No')).to.exist;
  });

  it('formats multi-line fields when source list is missing', () => {
    const stateConfig = {
      formDescription: 'Test state form',
      formId: 'test-state-form',
      formVersion: '1.0',
      sections: [
        {
          sectionHeader: 'Multi-line field test',
          fields: [
            {
              fieldLabel: 'Uploaded files',
              fieldType: 'multiline',
              fieldValue: "{{multilineList files pluck='filepath'}}",
            },
          ],
        },
      ],
    };

    const stateData = {};

    render(<FormRenderer config={stateConfig} data={stateData} />);

    const listItems = document.querySelectorAll(
      '#ol-section-0-group-0 .vads-u-font-weight--bold',
    );
    expect(listItems.length).to.equal(0);
  });
});
