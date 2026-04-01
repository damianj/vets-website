import { expect } from 'chai';
import reviewErrors from '../reviewErrors';
import formConfig from '../config/form';

describe('reviewErrors', () => {
  const EXPECTED_MESSAGE =
    'Reason for claim (select at least one type and add at least one new condition)';
  const EXPECTED_CLAIM_TYPE_REDIRECT = {
    chapterKey: 'disabilities',
    pageKey: 'claimType',
    navigationType: 'redirect',
  };
  const EXPECTED_CONDITIONS_SUMMARY_REDIRECT = {
    chapterKey: 'disabilities',
    pageKey: 'Summary',
    navigationType: 'redirect',
  };

  describe('newDisabilities', () => {
    it('returns error message string', () => {
      expect(reviewErrors.newDisabilities).to.equal(EXPECTED_MESSAGE);
    });
  });

  describe('condition', () => {
    it('returns same message as newDisabilities regardless of index', () => {
      expect(reviewErrors.condition()).to.equal(EXPECTED_MESSAGE);
      expect(reviewErrors.condition(0)).to.equal(EXPECTED_MESSAGE);
      expect(reviewErrors.condition(2)).to.equal(EXPECTED_MESSAGE);
    });
  });

  describe('_override for newDisabilities and condition errors', () => {
    const errorCases = [
      'newDisabilities',
      'instance.newDisabilities',
      'instance.newDisabilities does not meet minimum length of 1',
      'newDisabilities[0]',
      'instance.newDisabilities[0] requires property "condition"',
      'newDisabilities[1] condition is required',
      'condition',
      'instance.newDisabilities[0].condition',
      'newDisabilities[0].condition',
    ];

    errorCases.forEach(errorString => {
      it(`redirects "${errorString}" error to claim-type page`, () => {
        const result = reviewErrors._override(errorString);
        expect(result).to.deep.equal(EXPECTED_CLAIM_TYPE_REDIRECT);
      });
    });

    errorCases.forEach(errorString => {
      it(`redirects "${errorString}" error to claim-type page when workflow flag is off`, () => {
        const result = reviewErrors._override(errorString, {
          formData: { disabilityCompNewConditionsWorkflow: false },
        });
        expect(result).to.deep.equal(EXPECTED_CLAIM_TYPE_REDIRECT);
      });
    });

    errorCases.forEach(errorString => {
      it(`redirects "${errorString}" error to Summary page when workflow flag is on`, () => {
        const result = reviewErrors._override(errorString, {
          formData: { disabilityCompNewConditionsWorkflow: true },
        });
        expect(result).to.deep.equal(EXPECTED_CONDITIONS_SUMMARY_REDIRECT);
      });
    });

    errorCases.forEach(errorString => {
      it(`redirects "${errorString}" error to claim-type page when formData has no workflow flag`, () => {
        const result = reviewErrors._override(errorString, {
          formData: { someOtherField: 'hello world' },
        });
        expect(result).to.deep.equal(EXPECTED_CLAIM_TYPE_REDIRECT);
      });
    });
  });

  describe('toxicExposure', () => {
    it('builds error for gulf war 1990 details page', () => {
      const res = reviewErrors._override(
        'toxicExposure.gulfWar1990Details.afghanistan.startDate',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('gulf-war-1990-location-afghanistan');
    });

    it('builds error for gulf war 2001 details page', () => {
      const res = reviewErrors._override(
        'toxicExposure.gulfWar2001Details.lebanon.endDate',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('gulf-war-2001-location-lebanon');
    });

    it('builds error for herbicide details page', () => {
      const res = reviewErrors._override(
        'toxicExposure.herbicideDetails.cambodia.startDate',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('herbicide-location-cambodia');
    });

    it('builds error for other exposure details', () => {
      const res = reviewErrors._override(
        'toxicExposure.otherExposuresDetails.mos.startDate',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('additional-exposure-mos');
    });

    it('builds error for other herbicide locations', () => {
      const res = reviewErrors._override(
        'toxicExposure.otherHerbicideLocations.startDate',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('herbicide-location-other');
    });

    it('builds error for other exposures details page', () => {
      const res = reviewErrors._override(
        'toxicExposure.specifyOtherExposures.endDate',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('additional-exposure-other');
    });

    it('builds error for herbicide locations page', () => {
      const res = reviewErrors._override(
        'toxicExposure.otherHerbicideLocations.description',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('herbicideLocations');
    });

    it('builds error for additional exposures page', () => {
      const res = reviewErrors._override(
        'toxicExposure.specifyOtherExposures.description',
      );

      expect(typeof res).to.equal('object');
      expect(res.chapterKey).to.equal('disabilities');
      expect(res.pageKey).to.equal('additional-exposures');
    });
  });

  describe('default', () => {
    it('handles key not found', () => {
      expect(reviewErrors._override('foo.bar.foo')).to.equal(null);
    });
  });

  describe('formConfig.reviewErrors._override (platform integration)', () => {
    it('exposes _override on the form config reviewErrors', () => {
      expect(formConfig.reviewErrors._override).to.be.a('function');
    });

    it('redirects newDisabilities to claim-type page when workflow flag is off', () => {
      const result = formConfig.reviewErrors._override('newDisabilities', {
        formData: { disabilityCompNewConditionsWorkflow: false },
      });
      expect(result).to.deep.equal(EXPECTED_CLAIM_TYPE_REDIRECT);
    });

    it('redirects newDisabilities to Summary page when workflow flag is on', () => {
      const result = formConfig.reviewErrors._override('newDisabilities', {
        formData: { disabilityCompNewConditionsWorkflow: true },
      });
      expect(result).to.deep.equal(EXPECTED_CONDITIONS_SUMMARY_REDIRECT);
    });

    it('resolves toxic exposure error with platform context shape', () => {
      const result = formConfig.reviewErrors._override(
        'toxicExposure.gulfWar1990Details.afghanistan.startDate',
        { formData: { toxicExposure: {} } },
      );
      expect(result).to.deep.equal({
        chapterKey: 'disabilities',
        pageKey: 'gulf-war-1990-location-afghanistan',
      });
    });

    it('returns null for unrecognized errors with platform context', () => {
      expect(
        formConfig.reviewErrors._override('unknown.error.key', {
          formData: {},
        }),
      ).to.equal(null);
    });

    it('handles missing context gracefully', () => {
      const result = formConfig.reviewErrors._override('newDisabilities');
      expect(result).to.deep.equal(EXPECTED_CLAIM_TYPE_REDIRECT);
    });
  });
});
