import { useState } from 'react';

const DEFAULT_ITEMS_PER_PAGE = 10;

const usePagination = (items, itemsPerPage = DEFAULT_ITEMS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1);

  const currentItems = items?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const onPageChange = page => {
    setCurrentPage(page);
  };

  const onPageChangeWFocus = (page, focusElem) => {
    onPageChange(page);
    requestAnimationFrame(() => {
      if (focusElem.current) {
        focusElem.current.focus();
      }
    });
  };

  // Generate pagination text (e.g., "Showing 1-3 of 5 items")
  const getPaginationText = (label = 'items') => {
    if (!items || items.length <= itemsPerPage) {
      return '';
    }

    const startItemIndex = (currentPage - 1) * itemsPerPage + 1;
    const endItemIndex = Math.min(currentPage * itemsPerPage, items.length);

    return `Showing ${startItemIndex}-${endItemIndex} of ${
      items.length
    } ${label}`;
  };

  const totalItems = items?.length || 0;
  const hasPagination = totalItems > itemsPerPage;

  return {
    currentPage,
    currentItems,
    onPageChange,
    onPageChangeWFocus,
    getPaginationText,
    hasPagination,
    totalItems,
    itemsPerPage,
  };
};

export default usePagination;
