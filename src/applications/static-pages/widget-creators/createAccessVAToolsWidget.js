import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Creates and renders AccessVA Tools and Services widgets
 * This widget displays a categorized list of VA online services with accordion functionality
 * Uses static link data - no backend dependencies required
 *
 * @param {string} widgetType - Widget type identifier
 */
export default async function createAccessVAToolsWidget(store, widgetType) {
  const widgets = Array.from(
    document.querySelectorAll(`[data-widget-type="${widgetType}"]`),
  );

  if (widgets.length) {
    const {
      default: AccessVAToolsWidget,
    } = await import(/* webpackChunkName: "accessva-tools-widget" */
    'applications/static-pages/accessva-tools-widget');

    widgets.forEach(el => {
      ReactDOM.render(<AccessVAToolsWidget />, el);
    });
  }
}
