# Picklist

## History

The design for the picklist did not match any built-in form library patterns ([see key decisions](https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/products/dependents/picklist/key-decisions.md)). A list of active dependents are shown to the Veteran, and they are able to select from that list which dependent they want to remove. Navigating to the next page would show specific questions about the dependent according to their relationship to the Veteran: child, spouse or parent. If multiple dependents are selected, then the question pages will be shown one-after the other. See the picklist main flow diagram below.

After running through all the selected dependents, the Veteran would continue through the rest of the form. To build this flow, we used a CustomPage with custom routing.

## Why is this using custom code?

The flow of how the picklist works doesn't match any built-in form system routing methods.

- The built-in form flow won't allow us to circle back to repeat pages (e.g. remove multiple children). The array builder is set up to build an array from scratch, and we can't customize the summary page
- We tried to use the built-in [follow-up pattern](https://github.com/department-of-veterans-affairs/vets-website/blob/68ddb36604f19b0f23848a25eb724a605ecd2c15/src/applications/disability-benefits/all-claims/config/form.js#L364-L381), which can work from a filled in array:

  ```js
  followup: {
    // ...
    arrayPath: 'picklist',
    showPagePerItem: true,
    itemFilter: (item, formData) => {
      return item.selected;
    },
    // ...
  }
  ```

But, we discovered that the `itemFilter` didn't allow us to navigate through multiple follow up pages and branches based on the picklist choices.

We also thought about creating a new array with selected dependents, without using the `itemFilter` ([similar to what was done pensions with Marriage count](https://github.com/department-of-veterans-affairs/vets-website/blob/12f806889c9ee6f1702386dbead91e0e6ef776c2/src/applications/pensions/components/MarriageCount.jsx#L54-L60)), but that method wouldn't make it easy to create follow up page that use different fields, or a page that allows you to exit the form.

### Overview of picklist flow

```mermaid
flowchart TD
  Start([Active<br>dependents<br>with checkboxes<br><br>✓ Spouse<br>✓ Child<br>✓ Parent])

  subgraph DepLoop[Dependent picklist loop]
    direction TB
    DepType{Cycle through checked dependent, what is the dependent type?}
    Start --> DepType
    DepType -- "Spouse" --> SpouseReasonToRemove{Reason to remove}
    SpouseReasonToRemove -- "divorce" --> SpouseDetails[Divorce details]
    SpouseDetails --> NextDep
    SpouseReasonToRemove -- "death" --> SpouseDeathDetails[Death details]
    SpouseDeathDetails --> NextDep

    DepType -- "Child" --> ChildIsStepchild[Is stepchild?]
    ChildIsStepchild -- yes/no --> ChildReasonToRemove{Reason to remove}
    ChildLeftSchoolDetails --> NextDep
    ChildReasonToRemove -- "married" --> ChildMarriedDetails[Married details]
    ChildMarriedDetails --> NextDep
    ChildReasonToRemove -- "death" --> ChildDeathDetails[Death details]
    ChildDeathDetails --> NextDep
    ChildReasonToRemove -- "left school" --> ChildLeftSchoolDetails[Left school details]
    ChildReasonToRemove -- "stepchild left household" --> ChildHalfFinancialSupport{Provide at least half financial support?}
    ChildHalfFinancialSupport -- "no" --> ChildLeftHouseholdDetails[Left household details]
    ChildLeftHouseholdDetails --> NextDep
    ChildHalfFinancialSupport -- "yes" --> ChildAddress[Child current address]
    ChildAddress --> ChildLivesWith[Child lives with]
    ChildLivesWith --> ChildLeftHouseholdDetails
    ChildReasonToRemove -- "adopted" --> ChildAdoptedDetails[Adopted details]
    ChildAdoptedDetails --> exit

    DepType -- "Parent" --> ParentReasonToRemove{Reason to remove}
    ParentReasonToRemove -- "Other" --> ParentExit[Use different form]
    ParentExit --> exit
    ParentReasonToRemove -- "death" --> ParentDeathDetails[Death details]
    ParentDeathDetails --> NextDep

    NextDep@{ shape: hex, label: "Check next dependent" }
    NextDep l1@-- "More dependents" --> DepType
    NextDep -- "All done" --> Done([Continue to next page])
  end

  classDef animate stroke-dasharray: 9,5,stroke-dashoffset: 1200,animation: dash 25s linear infinite, stroke:#ff9500, stroke-width:3px;
  class l1 animate

  %% Styling
  style NextDep fill:#ff9500,stroke:#ff6600,stroke-width:2px,color:#000000
```

### Why use custom pages?

While setting up the code, we were going to use `SchemaForm` to render each page within the custom page router, but getting the `uiSchema` to add each dependent's full name or first name into field labels proved to be difficult - we may have needed to use the `updateSchema` callback to change the `enumNames` dynamically. It proved to be easier to build custom pages.

### What problems are left?

Getting custom navigation to work within the form system isn't easy. Current known issues include:

- ~Navigating back from the review & submit page points to the common `'remove-dependent'` route with no way to determine the previous page, so we instead redirect you back to the picklist page~ The routing has been updated to store paths and correctly navigate back through all the followup pages in reverse sequence.
- ~Navigating back through the picklist pages will current go to the first dependent follow up page instead of the last. Calculating visible pages could be done and using that as a path backwards is possible, but we were running out of time.~ We found time to fix navigation.
- If the selected dependent is missing a date of birth of relationship to the Veteran, then the picklist follow up page will redirect the Veteran back to the picklist page.

---

## How to:


### How do I add a new or remove a followup page?

#### Follow these steps to add a page to the flow

- Find the file for the page that will have the new page added after it, e.g. `spouseMarriageEnded.js`
- Copy the code from this file into a new file, and name it something like `spouseNextPage.js`
- Open the `routes.js` file in the same folder as this read me
  - Import the new file, e.g. `import spouseNextPage from './spouseNextPage';`
  - Add a new object the array for the appropriate dependent type (Spouse, Child, or Parent). This capitalization is based on the value from `relationshipToVeteran` in the data.
  - For example, add `{ path: 'marriage-next-page', page: spouseNextPage }`
- Now edit the `spouseMarriageEnded.js` file to navigate forward to the new page
  - Modify the `goForward` handler so that it now returns a path to the new page
  - E.g. `goForward: () => 'marriage-next-page'`
  - The callback is provided the `itemData`, `index` of the dependent, and `fullData` (all form data)
- Now edit the `spouseNextPage.js` file:
  - Edit the `goForward` handler to either return `'DONE'` if it is the last page of the flow, or return the path of the next page
  - Modify the `onSubmit` callback to check required `itemData` and either focus on the error or call `goForward`
  - Update the `Component` with the fields needed to match design
- Test to make sure the routing is working as expected.

#### Follow these steps to add a page to the flow

- Open the `routes.js` file in this folder and remove the page from the array
- Now make sure to edit the page before & after (if it's in the middle of the flow) that page by updating the `goForward` handler to point to the appropriate pages
- In the `goForward` handler, return `'DONE'` if it the last follow up page.
- Test to make sure the routing is working as expected.
