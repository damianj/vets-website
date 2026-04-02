import { expect } from 'chai';

import { toSentenceCase } from '../../utils';

describe('search utils: toSentenceCase', () => {
  it('returns empty string for nullish input', () => {
    expect(toSentenceCase()).to.equal('');
    expect(toSentenceCase(null)).to.equal('');
    expect(toSentenceCase(undefined)).to.equal('');
  });

  it('converts a title to sentence case', () => {
    expect(toSentenceCase('HEALTH CARE AND BENEFITS')).to.equal(
      'Health care and benefits',
    );
  });

  it('preserves acronym-like tokens', () => {
    expect(toSentenceCase('VA BENEFITS AND U.S. HEALTH CARE')).to.equal(
      'VA benefits and U.S. health care',
    );
    expect(
      toSentenceCase("BOARD OF VETERANS' APPEALS (BVA) DECISIONS"),
    ).to.equal("Board of veterans' appeals (BVA) decisions");
  });

  it('preserves intentional mixed-case tokens', () => {
    expect(toSentenceCase('VISIT VA.GOV OR MYHEALTHEVET TODAY')).to.equal(
      'Visit VA.GOV or MYHEALTHEVET today',
    );
    expect(toSentenceCase('VA.gov AND MyHealtheVet')).to.equal(
      'VA.gov and MyHealtheVet',
    );
  });
});
