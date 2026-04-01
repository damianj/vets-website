# Content Team Guide: Adding AccessVA Tools Widget to Pages

## Quick Start

To add the AccessVA Tools and Services widget to any page, simply add this single line of HTML:

```html
<div data-widget-type="accessva-tools"></div>
```

That's it! The widget will automatically render with all functionality.

## Step-by-Step Instructions

### For Drupal CMS Editors

1. **Navigate to the page** you want to edit in the Drupal admin interface
2. **Edit the page content** in the WYSIWYG editor
3. **Switch to "Source" or "HTML" view** (look for `<>` button)
4. **Add the widget code** where you want it to appear:
   ```html
   <div data-widget-type="accessva-tools"></div>
   ```
5. **Save the page**
6. **Preview** to verify the widget renders correctly

### For Content-Build (Markdown/Liquid Files)

If you're editing `.md` or `.drupal.liquid` files in content-build:

1. **Open the file** in your editor
2. **Add the widget HTML** at the desired location:
   ```html
   <div data-widget-type="accessva-tools"></div>
   ```
3. **Commit and push** your changes
4. **The build system** will automatically include the widget

## Widget Features

The widget automatically provides:

- ✅ **Page Title**: "AccessVA tools and services"
- ✅ **Breadcrumb Navigation**: Links back to VA.gov home
- ✅ **Introductory Text**: Explains the purpose
- ✅ **Two Accordion Sections**:
  - Veterans, family members, and service members
  - Business partners, employees, and contractors
- ✅ **Service Links**: All links point to production VA.gov and AccessVA URLs
- ✅ **Responsive Design**: Works on all devices
- ✅ **Accessibility**: WCAG 2.2 AA compliant
- ✅ **No Dependencies**: Fully static with no API or backend requirements
- ✅ **Completely Portable**: Works anywhere with just the widget div

> **Note**: Service links are updated regularly. The number of links in each category may change over time as services are added or removed.

## URL Management

The widget uses **static production URLs** hardcoded in the application:

- ✅ All 50 service links are pre-configured in `AccessVALinks.js`
- ✅ Links point to production VA.gov and eauth.va.gov URLs
- ✅ No feature flags or API calls required
- ✅ Links are maintained through code updates

**To update links**: Submit a pull request with changes to `AccessVALinks.js` file in the widget source code.

## Page Layout Examples

### Full-Width on Dedicated Page

```html
<!DOCTYPE html>
<html>
<body>
  <div class="usa-width-full">
    <div data-widget-type="accessva-tools"></div>
  </div>
</body>
</html>
```

### Three-Quarter Width with Sidebar

```html
<div class="medium-8 columns">
  <div data-widget-type="accessva-tools"></div>
</div>
<div class="medium-4 columns">
  <!-- Sidebar content -->
</div>
```

### Embedded in Article

```html
<article>
  <h2>How to Access VA Online Tools</h2>
  <p>You can access various VA services through AccessVA...</p>
  
  <div data-widget-type="accessva-tools"></div>
  
  <h2>Need More Help?</h2>
  <p>Contact the VA if you need assistance...</p>
</article>
```

## Common Questions

### Can I customize the widget appearance?
The widget uses VA Design System styling. Contact the design team if you need customizations.

### Can I add more categories?
Not through the widget itself. Contact engineering to discuss expanding functionality.

### Can I add or remove specific links?
Yes, but it requires a code change. Submit a pull request to update the `AccessVALinks.js` file with the new link configuration.

### Does it work on mobile?
Yes! The widget is fully responsive and mobile-friendly.

### What about accessibility?
The widget meets WCAG 2.2 AA standards and includes proper ARIA labels, keyboard navigation, and screen reader support.

### Can I have multiple widgets on one page?
Yes, you can add multiple instances, but this is not recommended for user experience reasons.

## Testing Checklist

Before publishing a page with the widget:

- [ ] Widget renders without errors
- [ ] All accordion sections expand/collapse correctly
- [ ] Veterans service links are visible and point to correct URLs
- [ ] Business service links are visible and point to correct URLs
- [ ] Links navigate to production VA.gov/AccessVA pages
- [ ] Page looks good on mobile devices
- [ ] Breadcrumbs navigate correctly
- [ ] No console errors
- [ ] Page loads reasonably fast

> **Note**: The number of links may vary as services are added or removed. Verify that links work, not the exact count.

## Troubleshooting

### Widget doesn't appear
1. Check HTML syntax is correct: `<div data-widget-type="accessva-tools"></div>`
2. Make sure you're using exact widget type name
3. Clear browser cache and reload
4. Check browser console for JavaScript errors

### Widget looks broken
1. Check if page is loading VA Design System CSS
2. Verify no custom CSS is conflicting
3. Test in incognito/private browsing mode
4. Try different browser

### Links not working
All links point to production URLs. If a link doesn't work, it may be that:
1. The service requires authentication
2. The URL has changed - submit a PR to update `AccessVALinks.js`
3. The service is temporarily unavailable


