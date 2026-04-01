import MedicalRecordsSite from '../../mr_site/MedicalRecordsSite';
import LabsAndTests from '../pages/LabsAndTests';
import oracleHealthUser from '../fixtures/user/oracle-health.json';
import labsAndTestData from '../fixtures/labsAndTests/uhd-with-radiology.json';
import imagingStudiesData from '../fixtures/labsAndTests/imaging-studies.json';
import thumbnailsData from '../fixtures/labsAndTests/imaging-thumbnails.json';
import dicomData from '../fixtures/labsAndTests/imaging-dicom.json';

describe('Medical Records - SCDF Radiology Images List', () => {
  const site = new MedicalRecordsSite();
  const mockDate = new Date(2025, 0, 25); // January 25, 2025

  beforeEach(() => {
    cy.clock(mockDate, ['Date']);
    site.login(oracleHealthUser, false);
    site.mockFeatureToggles({
      isAcceleratingEnabled: true,
      isAcceleratingLabsAndTests: true,
      isAcceleratingImagingStudies: true,
    });
    LabsAndTests.setIntercepts({ labsAndTestData });
    LabsAndTests.setImagingIntercepts({
      imagingStudiesData,
      thumbnailsData,
      dicomData,
    });
  });

  afterEach(() => {
    cy.clock().invoke('restore');
  });

  it('navigates to the images page and displays the thumbnail gallery', () => {
    site.loadPage();
    LabsAndTests.goToLabAndTestPage();

    cy.wait('@labs-and-test-list');
    cy.wait('@imagingStudies');

    // Verify the SCDF images ready alert appears on the list page
    cy.get('[data-testid="alert-scdf-images-ready"]').should('be.visible');
    cy.get('[data-testid="scdf-radiology-view-images"]')
      .should('have.length', 1)
      .first()
      .should('contain.text', 'CT HEAD W/O CONTRAST')
      .and('contain.text', '3 images');

    LabsAndTests.selectRadiologyRecord({
      labName: 'CT HEAD W/O CONTRAST',
    });

    cy.wait('@imagingThumbnails');

    // Verify the "Images ready" alert appears on the detail page
    cy.get('[data-testid="alert-images-ready"]').should('be.visible');
    cy.get('[data-testid="images-ready-view-link"]').should(
      'contain.text',
      '3 images',
    );

    LabsAndTests.clickViewAllImages();

    LabsAndTests.verifyImagesPageHeading({
      name: 'CT HEAD W/O CONTRAST',
    });

    LabsAndTests.verifyImageGalleryCount({ count: 3 });

    cy.injectAxeThenAxeCheck();
  });

  it('shows the DICOM download link on the images page', () => {
    site.loadPage();
    LabsAndTests.goToLabAndTestPage();

    cy.wait('@labs-and-test-list');
    cy.wait('@imagingStudies');

    LabsAndTests.selectRadiologyRecord({
      labName: 'CT HEAD W/O CONTRAST',
    });

    cy.wait('@imagingThumbnails');

    LabsAndTests.clickViewAllImages();

    cy.wait('@imagingDicom');

    LabsAndTests.verifyDicomDownloadLink();

    cy.injectAxeThenAxeCheck();
  });
});
