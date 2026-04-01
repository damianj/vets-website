import { expect } from 'chai';
import sinon from 'sinon';
import formConfig from '../../../config/form';

describe('21-4502 form config', () => {
  it('is an object with formId, rootUrl, and transformForSubmit', () => {
    expect(formConfig).to.be.an('object');
    expect(formConfig.formId).to.equal('21-4502');
    expect(formConfig).to.have.property('rootUrl');
    expect(formConfig.rootUrl).to.be.a('string');
    expect(formConfig.transformForSubmit).to.be.a('function');
  });

  it('has correct URLs and tracking prefix', () => {
    expect(formConfig.submitUrl).to.include(
      '/simple_forms_api/v1/simple_forms',
    );
    expect(formConfig.urlPrefix).to.equal('/');
    expect(formConfig.trackingPrefix).to.equal('ss-4502-');
  });

  it('has preSubmitInfo with statementOfTruth and fullNamePath', () => {
    expect(formConfig.preSubmitInfo).to.be.an('object');
    expect(formConfig.preSubmitInfo.statementOfTruth).to.be.an('object');
    expect(formConfig.preSubmitInfo.statementOfTruth.body).to.include(
      'accurate and has been represented correctly',
    );
    expect(formConfig.preSubmitInfo.statementOfTruth.fullNamePath).to.equal(
      'veteran.fullName',
    );
  });

  it('has saveInProgress and savedFormMessages', () => {
    expect(formConfig.saveInProgress.messages).to.include.keys(
      'inProgress',
      'expired',
      'saved',
    );
    expect(formConfig.savedFormMessages).to.include.keys('notFound', 'noAuth');
  });

  it('shows the finish-later link above the nav buttons with the expected text', () => {
    expect(formConfig.showSaveLinkAfterButtons).to.equal(false);
    expect(formConfig.customText.finishAppLaterMessage).to.equal(
      'Finish this application later',
    );
  });

  it('has onFormLoaded that redirects to introduction when no returnUrl', () => {
    const router = { push: () => {} };
    const pushSpy = sinon.spy(router, 'push');

    formConfig.onFormLoaded({
      returnUrl: undefined,
      router,
      routes: [],
      formData: {},
      formConfig: { urlPrefix: '/' },
    });

    expect(pushSpy.calledOnce).to.be.true;
    expect(pushSpy.firstCall.args[0]).to.equal('/introduction');
  });

  describe('chapters', () => {
    it('has eligibility as first chapter', () => {
      expect(formConfig.chapters).to.have.property('eligibilityChapter');
      const firstChapterKey = Object.keys(formConfig.chapters)[0];
      expect(firstChapterKey).to.equal('eligibilityChapter');
      expect(
        formConfig.chapters.eligibilityChapter.pages.eligibilityPage,
      ).to.have.property('CustomPage');
    });

    it('has schema and uiSchema for form pages', () => {
      const veteranPages = formConfig.chapters.veteranIdChapter.pages;
      expect(veteranPages.personalInfoBasicPage).to.have.property('schema');
      expect(veteranPages.personalInfoBasicPage).to.have.property('uiSchema');

      const contactPage =
        formConfig.chapters.contactChapter.pages.contactInfoPage;
      expect(contactPage).to.have.property('schema');
      expect(contactPage).to.have.property('uiSchema');

      const appPage =
        formConfig.chapters.applicationAndServiceInformationChapter.pages
          .applicationInformationPage;
      expect(appPage).to.have.property('schema');
      expect(appPage).to.have.property('uiSchema');
    });

    it('does not seed choice fields with null initial values', () => {
      const { chapters } = formConfig;

      expect(
        chapters.serviceStatusChapter.pages.serviceStatusPage,
      ).to.not.have.property('initialData');
      expect(
        chapters.applicationAndServiceInformationChapter.pages
          .applicationInformationPage,
      ).to.not.have.property('initialData');
      expect(
        chapters.serviceRecordChapter.pages.currentServiceStatusPage,
      ).to.not.have.property('initialData');
      expect(
        chapters.serviceRecordChapter.pages.veteranDisabilityCompensationPage,
      ).to.not.have.property('initialData');
      expect(
        chapters.conveyanceTypeChapter.pages.vehicleDetailsPage,
      ).to.not.have.property('initialData');
      expect(
        chapters.vehicleUseChapter.pages.vehicleUsePage,
      ).to.not.have.property('initialData');
      expect(
        chapters.previousVehicleApplicationChapter.pages
          .previousVehicleApplicationPage,
      ).to.not.have.property('initialData');
    });

    it('shows veteran-only service record pages only when not currently on active duty', () => {
      const { pages } = formConfig.chapters.serviceRecordChapter;

      expect(
        pages.veteranStatusInformationPage.depends({
          applicationInfo: { currentlyOnActiveDuty: false },
        }),
      ).to.equal(true);
      expect(
        pages.veteranDisabilityCompensationPage.depends({
          applicationInfo: { currentlyOnActiveDuty: false },
        }),
      ).to.equal(true);

      expect(
        pages.veteranStatusInformationPage.depends({
          applicationInfo: { currentlyOnActiveDuty: true },
        }),
      ).to.equal(false);
      expect(
        pages.veteranDisabilityCompensationPage.depends({
          applicationInfo: { currentlyOnActiveDuty: true },
        }),
      ).to.equal(false);
    });
  });
});
