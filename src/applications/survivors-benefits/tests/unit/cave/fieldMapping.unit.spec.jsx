import { expect } from 'chai';
import {
  VETERAN_INFO_FIELDS,
  MILITARY_HISTORY_FIELDS,
} from '../../../cave/fieldMapping';

describe('cave/fieldMapping', () => {
  // ---------------------------------------------------------------------------
  // VETERAN_INFO_FIELDS
  // ---------------------------------------------------------------------------

  describe('VETERAN_INFO_FIELDS', () => {
    describe('field[0] — Veteran name', () => {
      const field = VETERAN_INFO_FIELDS[0];

      it('getFormValue returns veteranFullName', () => {
        const name = { first: 'John', last: 'Smith' };
        expect(field.getFormValue({ veteranFullName: name })).to.deep.equal(
          name,
        );
      });

      it('getFormValue returns undefined when absent', () => {
        expect(field.getFormValue({})).to.be.undefined;
      });

      it('normalize lowercases and trims a name object', () => {
        const val = { first: 'JOHN', middle: '', last: 'SMITH', suffix: '' };
        expect(field.normalize(val)).to.equal('john smith');
      });

      it('normalize includes middle initial', () => {
        expect(
          field.normalize({ first: 'John', middle: 'Q', last: 'Smith' }),
        ).to.equal('john q smith');
      });

      it('normalize returns empty string for null', () => {
        expect(field.normalize(null)).to.equal('');
      });

      it('formatValue returns formatted full name', () => {
        expect(
          field.formatValue({
            first: 'John',
            middle: 'Q',
            last: 'Smith',
            suffix: '',
          }),
        ).to.equal('John Q Smith');
      });

      it('applyToForm merges canonical into veteranFullName', () => {
        const canonical = {
          first: 'Jane',
          last: 'Doe',
          middle: '',
          suffix: '',
        };
        const result = field.applyToForm(
          { veteranFullName: { first: 'John' } },
          canonical,
        );
        expect(result.veteranFullName.first).to.equal('Jane');
        expect(result.veteranFullName.last).to.equal('Doe');
      });

      it('applyToForm preserves other form fields', () => {
        const result = field.applyToForm({ foo: 'bar' }, { first: 'Jane' });
        expect(result.foo).to.equal('bar');
      });

      describe('dd214 artifact', () => {
        const artifact = field.artifacts.find(a => a.artifactKey === 'dd214');

        it('getArtifactValue returns veteranName when both first and last are present', () => {
          const name = { first: 'John', last: 'Smith' };
          expect(
            artifact.getArtifactValue({ veteranName: name }),
          ).to.deep.equal(name);
        });

        it('getArtifactValue returns null when only first is present', () => {
          expect(
            artifact.getArtifactValue({
              veteranName: { first: 'John', last: '' },
            }),
          ).to.be.null;
        });

        it('getArtifactValue returns null when only last is present', () => {
          expect(
            artifact.getArtifactValue({
              veteranName: { first: '', last: 'Smith' },
            }),
          ).to.be.null;
        });

        it('getArtifactValue returns null when neither first nor last', () => {
          expect(
            artifact.getArtifactValue({
              veteranName: { first: '', last: '' },
            }),
          ).to.be.null;
        });

        it('getArtifactValue returns null when veteranName is null', () => {
          expect(artifact.getArtifactValue({ veteranName: null })).to.be.null;
        });

        it('formatArtifactValue returns formatted name', () => {
          expect(
            artifact.formatArtifactValue({ first: 'John', last: 'Smith' }),
          ).to.equal('John Smith');
        });

        it('setArtifactValue sets veteranName', () => {
          const canonical = { first: 'Jane', last: 'Doe' };
          expect(
            artifact.setArtifactValue({}, canonical).veteranName,
          ).to.deep.equal(canonical);
        });
      });

      describe('deathCertificates artifact', () => {
        const artifact = field.artifacts.find(
          a => a.artifactKey === 'deathCertificates',
        );

        it('getArtifactValue returns decendentFullName when both first and last are present', () => {
          const name = { first: 'Pat', last: 'Smith' };
          expect(
            artifact.getArtifactValue({ decendentFullName: name }),
          ).to.deep.equal(name);
        });

        it('getArtifactValue returns null when only first is present', () => {
          expect(
            artifact.getArtifactValue({
              decendentFullName: { first: 'Pat', last: '' },
            }),
          ).to.be.null;
        });

        it('getArtifactValue returns null when no name parts', () => {
          expect(artifact.getArtifactValue({ decendentFullName: null })).to.be
            .null;
        });

        it('setArtifactValue sets decendentFullName', () => {
          const canonical = { first: 'Pat', last: 'Veteran' };
          expect(
            artifact.setArtifactValue({}, canonical).decendentFullName,
          ).to.deep.equal(canonical);
        });
      });
    });

    // -------------------------------------------------------------------------

    describe('field[1] — Social Security number', () => {
      const field = VETERAN_INFO_FIELDS[1];

      it('getFormValue returns ssn from veteranSocialSecurityNumber', () => {
        expect(
          field.getFormValue({
            veteranSocialSecurityNumber: { ssn: '123456789' },
          }),
        ).to.equal('123456789');
      });

      it('getFormValue returns undefined when field absent', () => {
        expect(field.getFormValue({})).to.be.undefined;
      });

      it('normalize returns value unchanged', () => {
        expect(field.normalize('123456789')).to.equal('123456789');
      });

      it('normalize returns empty string for null', () => {
        expect(field.normalize(null)).to.equal('');
      });

      it('formatValue masks bare-digit SSN to show last 4', () => {
        expect(field.formatValue('123456789')).to.equal('*****6789');
      });

      it('applyToForm sets ssn', () => {
        const result = field.applyToForm({}, '987654321');
        expect(result.veteranSocialSecurityNumber.ssn).to.equal('987654321');
      });

      it('applyToForm preserves other ssn fields', () => {
        const result = field.applyToForm(
          { veteranSocialSecurityNumber: { confirmSsn: 'x' } },
          '987654321',
        );
        expect(result.veteranSocialSecurityNumber.confirmSsn).to.equal('x');
      });

      describe('dd214 artifact', () => {
        const artifact = field.artifacts.find(a => a.artifactKey === 'dd214');

        it('getArtifactValue returns veteranSsn', () => {
          expect(
            artifact.getArtifactValue({ veteranSsn: '123456789' }),
          ).to.equal('123456789');
        });

        it('getArtifactValue returns null for empty string', () => {
          expect(artifact.getArtifactValue({ veteranSsn: '' })).to.be.null;
        });

        it('getArtifactValue returns null when field missing', () => {
          expect(artifact.getArtifactValue({})).to.be.null;
        });

        it('formatArtifactValue adds dashes then applies mask', () => {
          // bare 9-digit → dashes inserted → mask applied
          // dashes break 4-consecutive-digit run so display shows formatted SSN
          expect(artifact.formatArtifactValue('123456789')).to.equal(
            '123-45-6789',
          );
        });

        it('setArtifactValue strips non-digits and sets veteranSsn', () => {
          const result = artifact.setArtifactValue({}, '123-45-6789');
          expect(result.veteranSsn).to.equal('123456789');
        });
      });

      describe('deathCertificates artifact', () => {
        const artifact = field.artifacts.find(
          a => a.artifactKey === 'deathCertificates',
        );

        it('getArtifactValue returns decendentSsn', () => {
          expect(
            artifact.getArtifactValue({ decendentSsn: '987654321' }),
          ).to.equal('987654321');
        });

        it('getArtifactValue returns null for missing/empty', () => {
          expect(artifact.getArtifactValue({ decendentSsn: null })).to.be.null;
          expect(artifact.getArtifactValue({})).to.be.null;
        });

        it('setArtifactValue strips non-digits and sets decendentSsn', () => {
          const result = artifact.setArtifactValue({}, '987-65-4321');
          expect(result.decendentSsn).to.equal('987654321');
        });
      });
    });

    // -------------------------------------------------------------------------

    describe('field[2] — Date of birth', () => {
      const field = VETERAN_INFO_FIELDS[2];

      it('getFormValue returns veteranDateOfBirth', () => {
        expect(
          field.getFormValue({ veteranDateOfBirth: '1950-03-15' }),
        ).to.equal('1950-03-15');
      });

      it('normalize returns value or empty string', () => {
        expect(field.normalize('1950-03-15')).to.equal('1950-03-15');
        expect(field.normalize(null)).to.equal('');
      });

      it('formatValue formats an ISO date', () => {
        expect(field.formatValue('1950-03-15')).to.equal('March 15, 1950');
      });

      it('applyToForm sets veteranDateOfBirth', () => {
        const result = field.applyToForm({}, '1950-03-15');
        expect(result.veteranDateOfBirth).to.equal('1950-03-15');
      });

      describe('dd214 artifact', () => {
        const artifact = field.artifacts.find(a => a.artifactKey === 'dd214');

        it('getArtifactValue returns veteranDob or null', () => {
          expect(
            artifact.getArtifactValue({ veteranDob: '1950-03-15' }),
          ).to.equal('1950-03-15');
          expect(artifact.getArtifactValue({ veteranDob: '' })).to.be.null;
        });

        it('formatArtifactValue formats an ISO date', () => {
          expect(artifact.formatArtifactValue('1950-03-15')).to.equal(
            'March 15, 1950',
          );
        });

        it('setArtifactValue sets veteranDob', () => {
          expect(
            artifact.setArtifactValue({}, '1950-03-15').veteranDob,
          ).to.equal('1950-03-15');
        });
      });
    });

    // -------------------------------------------------------------------------

    describe('field[3] — Date of death', () => {
      const field = VETERAN_INFO_FIELDS[3];

      it('getFormValue returns veteranDateOfDeath', () => {
        expect(
          field.getFormValue({ veteranDateOfDeath: '2020-01-05' }),
        ).to.equal('2020-01-05');
      });

      it('applyToForm sets veteranDateOfDeath', () => {
        const result = field.applyToForm({}, '2020-01-05');
        expect(result.veteranDateOfDeath).to.equal('2020-01-05');
      });

      it('formatValue formats an ISO date', () => {
        expect(field.formatValue('2020-01-05')).to.equal('January 5, 2020');
      });

      describe('deathCertificates artifact', () => {
        const artifact = field.artifacts.find(
          a => a.artifactKey === 'deathCertificates',
        );

        it('getArtifactValue returns decendentDateOfDeath or null', () => {
          expect(
            artifact.getArtifactValue({
              decendentDateOfDeath: '2020-01-05',
            }),
          ).to.equal('2020-01-05');
          expect(artifact.getArtifactValue({})).to.be.null;
        });

        it('formatArtifactValue formats an ISO date', () => {
          expect(artifact.formatArtifactValue('2020-01-05')).to.equal(
            'January 5, 2020',
          );
        });

        it('setArtifactValue sets decendentDateOfDeath', () => {
          expect(
            artifact.setArtifactValue({}, '2020-01-05').decendentDateOfDeath,
          ).to.equal('2020-01-05');
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // MILITARY_HISTORY_FIELDS
  // ---------------------------------------------------------------------------

  describe('MILITARY_HISTORY_FIELDS', () => {
    describe('field[0] — Branch of service', () => {
      const field = MILITARY_HISTORY_FIELDS[0];

      it('getFormValue returns serviceBranch', () => {
        expect(field.getFormValue({ serviceBranch: 'army' })).to.equal('army');
      });

      it('normalize returns value or empty string', () => {
        expect(field.normalize('army')).to.equal('army');
        expect(field.normalize(null)).to.equal('');
      });

      it('formatValue returns human-readable label for known values', () => {
        expect(field.formatValue('army')).to.equal('Army');
        expect(field.formatValue('airForce')).to.equal('Air Force');
        expect(field.formatValue('navy')).to.equal('Navy');
        expect(field.formatValue('marineCorps')).to.equal('Marine Corps');
        expect(field.formatValue('spaceForce')).to.equal('Space Force');
      });

      it('formatValue falls back to the raw value for unknown values', () => {
        expect(field.formatValue('unknown-branch')).to.equal('unknown-branch');
      });

      it('applyToForm sets serviceBranch', () => {
        const result = field.applyToForm({}, 'navy');
        expect(result.serviceBranch).to.equal('navy');
      });

      describe('dd214 artifact', () => {
        const artifact = field.artifacts.find(a => a.artifactKey === 'dd214');

        it('getArtifactValue returns branchOfService', () => {
          expect(
            artifact.getArtifactValue({ branchOfService: 'army' }),
          ).to.equal('army');
        });

        it('getArtifactValue returns null for empty string', () => {
          expect(artifact.getArtifactValue({ branchOfService: '' })).to.be.null;
        });

        it('formatArtifactValue returns human-readable label', () => {
          expect(artifact.formatArtifactValue('navy')).to.equal('Navy');
        });

        it('setArtifactValue sets branchOfService', () => {
          expect(
            artifact.setArtifactValue({}, 'navy').branchOfService,
          ).to.equal('navy');
        });
      });
    });

    // -------------------------------------------------------------------------

    describe('field[1] — Date entered active service', () => {
      const field = MILITARY_HISTORY_FIELDS[1];

      it('getFormValue returns activeServiceDateRange.from', () => {
        expect(
          field.getFormValue({
            activeServiceDateRange: { from: '1970-02-15' },
          }),
        ).to.equal('1970-02-15');
      });

      it('getFormValue returns undefined when field absent', () => {
        expect(field.getFormValue({})).to.be.undefined;
      });

      it('formatValue formats an ISO date', () => {
        expect(field.formatValue('1970-02-15')).to.equal('February 15, 1970');
      });

      it('applyToForm sets activeServiceDateRange.from and preserves .to', () => {
        const result = field.applyToForm(
          { activeServiceDateRange: { to: '1974-02-14' } },
          '1970-02-15',
        );
        expect(result.activeServiceDateRange.from).to.equal('1970-02-15');
        expect(result.activeServiceDateRange.to).to.equal('1974-02-14');
      });

      describe('dd214 artifact', () => {
        const artifact = field.artifacts.find(a => a.artifactKey === 'dd214');

        it('getArtifactValue returns dateEnteredActiveService or null', () => {
          expect(
            artifact.getArtifactValue({
              dateEnteredActiveService: '1970-02-15',
            }),
          ).to.equal('1970-02-15');
          expect(artifact.getArtifactValue({})).to.be.null;
        });

        it('setArtifactValue sets dateEnteredActiveService', () => {
          expect(
            artifact.setArtifactValue({}, '1970-02-15')
              .dateEnteredActiveService,
          ).to.equal('1970-02-15');
        });
      });
    });

    // -------------------------------------------------------------------------

    describe('field[2] — Date separated from service', () => {
      const field = MILITARY_HISTORY_FIELDS[2];

      it('getFormValue returns activeServiceDateRange.to', () => {
        expect(
          field.getFormValue({ activeServiceDateRange: { to: '1974-02-14' } }),
        ).to.equal('1974-02-14');
      });

      it('getFormValue returns undefined when field absent', () => {
        expect(field.getFormValue({})).to.be.undefined;
      });

      it('formatValue formats an ISO date', () => {
        expect(field.formatValue('1974-02-14')).to.equal('February 14, 1974');
      });

      it('applyToForm sets activeServiceDateRange.to and preserves .from', () => {
        const result = field.applyToForm(
          { activeServiceDateRange: { from: '1970-02-15' } },
          '1974-02-14',
        );
        expect(result.activeServiceDateRange.to).to.equal('1974-02-14');
        expect(result.activeServiceDateRange.from).to.equal('1970-02-15');
      });

      describe('dd214 artifact', () => {
        const artifact = field.artifacts.find(a => a.artifactKey === 'dd214');

        it('getArtifactValue returns dateSeparatedFromService or null', () => {
          expect(
            artifact.getArtifactValue({
              dateSeparatedFromService: '1974-02-14',
            }),
          ).to.equal('1974-02-14');
          expect(artifact.getArtifactValue({})).to.be.null;
        });

        it('setArtifactValue sets dateSeparatedFromService', () => {
          expect(
            artifact.setArtifactValue({}, '1974-02-14')
              .dateSeparatedFromService,
          ).to.equal('1974-02-14');
        });
      });
    });
  });
});
