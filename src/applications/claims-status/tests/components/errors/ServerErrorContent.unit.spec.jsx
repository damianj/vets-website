import React from 'react';
import { render, within } from '@testing-library/react';
import { expect } from 'chai';

import ServerErrorContent from '../../../components/errors/ServerErrorContent';

describe('<ServerErrorContent>', () => {
  it('should render the heading and body content', () => {
    const { container } = render(<ServerErrorContent />);

    expect(
      within(container).getByRole('heading', {
        level: 2,
        name: 'We can’t load this page',
      }),
    ).to.exist;

    expect(
      within(container).getByText(
        /We’re sorry\. Something went wrong on our end\. Please refresh this page or try again later\./,
      ),
    ).to.exist;
  });
});
