import React from 'react';
import { expect } from 'chai';
import { render, fireEvent, screen } from '@testing-library/react';
import sinon from 'sinon';
import Pagination from '../../components/Pagination';

describe('<Pagination>', () => {
  let mockOnPageChange;

  beforeEach(() => {
    mockOnPageChange = sinon.spy();
  });

  it('should not render when totalItems is 0', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={0}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />,
    );
    expect(screen.queryByRole('navigation')).to.not.exist;
  });

  it('should not render when totalPages is 1', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={5}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />,
    );
    expect(screen.queryByRole('navigation')).to.not.exist;
  });

  it('should render when totalPages > 1', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />,
    );
    expect(screen.queryByRole('navigation')).to.exist;
  });

  it('should pass aria-label to VaPagination', () => {
    const ariaLabel = 'Test pagination navigation';
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel={ariaLabel}
      />,
    );
    expect(screen.getByRole('navigation')).to.have.attribute(
      'aria-label',
      ariaLabel,
    );
  });

  it('should call onPageChange when a page button is clicked', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel="Test pagination"
      />,
    );

    // Click page 3
    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);

    expect(mockOnPageChange).to.have.been.calledWith(3);
    expect(mockOnPageChange).to.have.been.calledOnce;
  });

  it('should call onPageChange when next page button is clicked', () => {
    render(
      <Pagination
        currentPage={2}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel="Test pagination"
      />,
    );

    // Click next page button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockOnPageChange).to.have.been.calledWith(3);
  });

  it('should call onPageChange when previous page button is clicked', () => {
    render(
      <Pagination
        currentPage={3}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel="Test pagination"
      />,
    );

    // Click previous page button
    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(mockOnPageChange).to.have.been.calledWith(2);
  });

  it('should not call onPageChange when current page button is clicked', () => {
    render(
      <Pagination
        currentPage={2}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel="Test pagination"
      />,
    );

    // Click current page (page 2) - should be disabled and not trigger callback
    const currentPageButton = screen.getByText('2');
    fireEvent.click(currentPageButton);

    expect(mockOnPageChange).to.not.have.been.called;
  });

  it('should render correct number of page buttons', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel="Test pagination"
      />,
    );

    // Should show pages 1, 2, 3, 4, 5 for 50 items (5 pages)
    expect(screen.getByText('1')).to.exist;
    expect(screen.getByText('2')).to.exist;
    expect(screen.getByText('3')).to.exist;
    expect(screen.getByText('4')).to.exist;
    expect(screen.getByText('5')).to.exist;
  });

  it('should handle first page navigation', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel="Test pagination"
      />,
    );

    // Previous button should be disabled on first page
    const prevButton = screen.getByText('Previous');
    expect(prevButton).to.have.attribute('aria-disabled', 'true');
  });

  it('should handle last page navigation', () => {
    render(
      <Pagination
        currentPage={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        ariaLabel="Test pagination"
      />,
    );

    // Next button should be disabled on last page
    const nextButton = screen.getByText('Next');
    expect(nextButton).to.have.attribute('aria-disabled', 'true');
  });
});
