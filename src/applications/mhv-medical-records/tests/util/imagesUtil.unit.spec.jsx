import { expect } from 'chai';
import sinon from 'sinon';
import { parseISO } from 'date-fns';
import { datadogRum } from '@datadog/browser-rum';
import {
  buildRadiologyResults,
  convertMhvRadiologyRecord,
  convertCvixRadiologyRecord,
  convertScdfImagingStudy,
  mergeImagingStudiesIntoLabs,
  computeMergeStats,
  mergeRadiologyLists,
} from '../../util/imagesUtil';
import { EMPTY_FIELD, loincCodes } from '../../util/constants';

const RAD_TYPE = loincCodes.UHD_RADIOLOGY;

describe('buildRadiologyResults', () => {
  const REPORT = 'The report.';
  const IMPRESSION = 'The impression.';

  it('builds the full result', () => {
    const record = {
      reportText: REPORT,
      impressionText: IMPRESSION,
    };
    const report = buildRadiologyResults(record);
    expect(report).to.include(REPORT);
    expect(report).to.include(IMPRESSION);
  });

  it('builds the result without impression', () => {
    const record = { reportText: REPORT };
    const report = buildRadiologyResults(record);
    expect(report).to.include(REPORT);
    expect(report).to.not.include(IMPRESSION);
  });

  it('builds the result without report', () => {
    const record = { impressionText: IMPRESSION };
    const report = buildRadiologyResults(record);
    expect(report).to.not.include(REPORT);
    expect(report).to.include(IMPRESSION);
  });
});

describe('Sort date', () => {
  it('matches for convertMhvRadiologyRecord', () => {
    const date = new Date();
    const dateIso = `${date.toISOString().split('.')[0]}Z`;
    const dateTimestamp = date.getTime();
    const compareDate = Math.floor(dateTimestamp / 1000) * 1000;

    const record = { eventDate: dateIso };
    const convertedRecord = convertMhvRadiologyRecord(record);
    expect(parseISO(convertedRecord.sortDate).getTime()).to.eq(compareDate);
  });

  it('matches for convertCvixRadiologyRecord', () => {
    const date = new Date();
    const dateTimestamp = date.getTime();
    const compareDate = Math.floor(dateTimestamp / 1000) * 1000;

    const record = { performedDatePrecise: dateTimestamp };
    const convertedRecord = convertCvixRadiologyRecord(record);
    expect(parseISO(convertedRecord.sortDate).getTime()).to.eq(compareDate);
  });
});

describe('mergeRadiologyLists', () => {
  it('returns an empty array when both input arrays are empty', () => {
    const result = mergeRadiologyLists([], []);
    expect(result).to.deep.equal([]);
  });

  it('returns the PHR list when CVIX list is empty', () => {
    const phrList = [{ id: 1, sortDate: '2020-01-01T12:00:00Z' }];
    const result = mergeRadiologyLists(phrList, []);
    expect(result).to.deep.equal(phrList);
  });

  it('returns the CVIX list when PHR list is empty', () => {
    const cvixList = [{ id: 2, sortDate: '2020-01-02T12:00:00Z' }];
    const result = mergeRadiologyLists([], cvixList);
    expect(result).to.deep.equal(cvixList);
  });

  it('concatenates lists when there are no matching dates', () => {
    const phrList = [{ id: 1, sortDate: '2020-01-01T12:00:00Z' }];
    const cvixList = [{ id: 2, sortDate: '2020-01-02T12:00:00Z' }];
    const result = mergeRadiologyLists(phrList, cvixList);
    expect(result).to.deep.equal([...phrList, ...cvixList]);
  });

  it('handles multiple matches correctly', () => {
    const phrList = [
      { id: 1, sortDate: '2020-01-01T10:00:00Z', data: 'phr1' },
      { id: 2, sortDate: '2020-01-02T11:00:00Z', data: 'phr2' },
    ];
    const cvixList = [
      { id: 3, sortDate: '2020-01-01T10:00:00Z', studyId: 'c1', imageCount: 1 },
      { id: 4, sortDate: '2020-01-02T11:00:00Z', studyId: 'c2', imageCount: 2 },
      { id: 5, sortDate: '2020-01-03T12:00:00Z', studyId: 'c3', imageCount: 3 },
    ];
    const result = mergeRadiologyLists(phrList, cvixList);
    expect(result).to.deep.equal([
      {
        id: 1,
        sortDate: '2020-01-01T10:00:00Z',
        data: 'phr1',
        studyId: 'c1',
        imageCount: 1,
      },
      {
        id: 2,
        sortDate: '2020-01-02T11:00:00Z',
        data: 'phr2',
        studyId: 'c2',
        imageCount: 2,
      },
      {
        id: 5,
        sortDate: '2020-01-03T12:00:00Z',
        studyId: 'c3',
        imageCount: 3,
      },
    ]);
  });

  it('prefers name+minute match over minute-only match (multi-stage priority)', () => {
    // When multiple CVIX records share the same timestamp, the one with the
    // matching procedure name should be paired first (stage 1), leaving
    // stage 2 to pair the remaining records by timestamp alone.
    const phrList = [
      {
        id: 'phr1',
        name: 'CT ABDOMEN',
        sortDate: '2020-01-01T10:00:00Z',
        data: 'phr1',
      },
      {
        id: 'phr2',
        name: 'CHEST XRAY',
        sortDate: '2020-01-01T10:00:00Z',
        data: 'phr2',
      },
    ];
    const cvixList = [
      {
        id: 'cvix1',
        name: 'CHEST XRAY',
        sortDate: '2020-01-01T10:00:00Z',
        studyId: 'c1',
        imageCount: 1,
      },
      {
        id: 'cvix2',
        name: 'CT ABDOMEN',
        sortDate: '2020-01-01T10:00:00Z',
        studyId: 'c2',
        imageCount: 2,
      },
    ];
    const result = mergeRadiologyLists(phrList, cvixList);
    expect(result.length).to.equal(2);
    // CT ABDOMEN paired with CT ABDOMEN
    expect(result[0].id).to.equal('phr1');
    expect(result[0].studyId).to.equal('c2');
    // CHEST XRAY paired with CHEST XRAY
    expect(result[1].id).to.equal('phr2');
    expect(result[1].studyId).to.equal('c1');
  });

  it('does not merge records when dates and names both differ', () => {
    const phrList = [
      {
        id: 'phr1',
        name: 'CT ABDOMEN',
        sortDate: '2020-01-01T10:00:00Z',
        data: 'phr1',
      },
    ];
    const cvixList = [
      {
        id: 'cvix1',
        name: 'CHEST XRAY',
        sortDate: '2020-01-01T10:05:00Z', // Different date and different name
        studyId: 'c1',
        imageCount: 1,
      },
    ];
    const result = mergeRadiologyLists(phrList, cvixList);
    expect(result.length).to.equal(2);
  });

  it('merges records by normalized procedure name + same day (ticket #132099)', () => {
    // Verifies stage 3: when timestamps don't match to the minute but the
    // normalized procedure name and calendar day do, records are still merged.
    const phrList = [
      {
        id: 'phr1',
        name: 'KNEE 4 OR MORE VIEWS (LEFT)', // No newline
        sortDate: '2024-04-04T17:08:00Z',
        data: 'phr1',
      },
    ];
    const cvixList = [
      {
        id: 'cvix1',
        name: 'KNEE\n 4 OR MORE VIEWS (LEFT)', // Has newline
        sortDate: '2024-04-04T17:03:00Z', // Same day, different time (5 min diff)
        studyId: 'c1',
        imageCount: 4,
      },
    ];
    const result = mergeRadiologyLists(phrList, cvixList);
    expect(result.length).to.equal(1);
    expect(result[0]).to.deep.equal({
      id: 'phr1',
      name: 'KNEE 4 OR MORE VIEWS (LEFT)',
      sortDate: '2024-04-04T17:08:00Z',
      data: 'phr1',
      studyId: 'c1',
      imageCount: 4,
    });
  });

  it('does not merge records with different procedure names even on same day', () => {
    const phrList = [
      {
        id: 'phr1',
        name: 'KNEE 4 OR MORE VIEWS (LEFT)',
        sortDate: '2024-04-04T17:08:00Z',
        data: 'phr1',
      },
    ];
    const cvixList = [
      {
        id: 'cvix1',
        name: 'CT THORAX W/CONT', // Different procedure
        sortDate: '2024-04-04T17:03:00Z', // Same day
        studyId: 'c1',
        imageCount: 4,
      },
    ];
    const result = mergeRadiologyLists(phrList, cvixList);
    expect(result.length).to.equal(2);
  });
});

describe('convertScdfImagingStudy', () => {
  it('converts a full JSONAPI record', () => {
    const record = {
      id: 'study-123',
      attributes: {
        description: 'CHEST 2 VIEWS PA&LAT',
        date: '2025-01-10T09:17:00Z',
        notes: ['Note A', 'Note B'],
        identifier: 'urn:vastudy:200CRNR-CM_4',
        series: [{ uid: 's1' }],
        status: 'available',
        imageCount: 5,
      },
    };
    const result = convertScdfImagingStudy(record);
    expect(result.id).to.equal('study-123');
    expect(result.name).to.equal('CHEST 2 VIEWS PA&LAT');
    expect(result.date).to.be.a('string');
    expect(result.date).to.not.equal(EMPTY_FIELD);
    expect(result.rawDate).to.equal('2025-01-10T09:17:00Z');
    expect(result.results).to.equal('Note A\nNote B');
    expect(result.studyId).to.equal('urn:vastudy:200CRNR-CM_4');
    expect(result.series).to.deep.equal([{ uid: 's1' }]);
    expect(result.status).to.equal('available');
    expect(result.imageCount).to.equal(5);
  });

  it('defaults imageCount to 0 when not provided', () => {
    const record = { id: 'no-count', attributes: {} };
    const result = convertScdfImagingStudy(record);
    expect(result.imageCount).to.equal(0);
  });

  it('uses EMPTY_FIELD for missing fields', () => {
    const record = { id: 'minimal' };
    const result = convertScdfImagingStudy(record);
    expect(result.id).to.equal('minimal');
    expect(result.name).to.equal(EMPTY_FIELD);
    expect(result.date).to.equal(EMPTY_FIELD);
    expect(result.rawDate).to.be.null;
    expect(result.results).to.equal(EMPTY_FIELD);
    expect(result.studyId).to.equal('minimal');
    expect(result.series).to.deep.equal([]);
    expect(result.status).to.be.null;
  });

  it('falls back to record-level properties when attributes is absent', () => {
    const record = {
      id: 'flat-record',
      description: 'FLAT DESC',
      date: '2025-06-01T12:00:00Z',
      notes: ['Flat note'],
      identifier: 'flat-id',
      series: [{ uid: 'flat-s1' }],
      status: 'complete',
    };
    const result = convertScdfImagingStudy(record);
    expect(result.name).to.equal('FLAT DESC');
    expect(result.studyId).to.equal('flat-id');
    expect(result.status).to.equal('complete');
  });

  it('joins notes with newline', () => {
    const record = {
      id: 'notes-test',
      attributes: { notes: ['Line 1', 'Line 2', 'Line 3'] },
    };
    const result = convertScdfImagingStudy(record);
    expect(result.results).to.equal('Line 1\nLine 2\nLine 3');
  });

  it('returns EMPTY_FIELD for empty notes array', () => {
    const record = { id: 'empty-notes', attributes: { notes: [] } };
    const result = convertScdfImagingStudy(record);
    expect(result.results).to.equal(EMPTY_FIELD);
  });
});

describe('mergeImagingStudiesIntoLabs', () => {
  let addActionStub;

  beforeEach(() => {
    addActionStub = sinon.stub(datadogRum, 'addAction');
  });

  afterEach(() => {
    addActionStub.restore();
  });

  it('returns labsList unchanged when imagingStudies is empty', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:15:00Z' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, []);
    expect(result).to.equal(labs);
  });

  it('returns empty array when both inputs are empty', () => {
    const result = mergeImagingStudiesIntoLabs([], []);
    expect(result).to.deep.equal([]);
  });

  it('matches records within tolerance window and copies imaging fields', () => {
    const labs = [
      {
        id: 'lab-1',
        type: RAD_TYPE,
        sortDate: '2025-01-10T09:15:00Z',
        name: 'CHEST XRAY',
      },
    ];
    const studies = [
      {
        id: 'study-1',
        rawDate: '2025-01-10T09:15:20Z',
        status: 'available',
        imageCount: 3,
      },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result).to.have.lengthOf(1);
    expect(result[0].imagingStudyId).to.equal('study-1');
    expect(result[0].imagingStudyStatus).to.equal('available');
    expect(result[0].imageCount).to.equal(3);
    expect(result[0].name).to.equal('CHEST XRAY');
  });

  it('defaults imageCount to 0 when imaging study has no imageCount', () => {
    const labs = [
      {
        id: 'lab-1',
        type: RAD_TYPE,
        sortDate: '2025-01-10T09:15:00Z',
        name: 'CHEST XRAY',
      },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:15:20Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0].imageCount).to.equal(0);
  });

  it('does not match records outside the tolerance window', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:31Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0]).to.not.have.property('imagingStudyId');
  });

  it('matches at exactly 30 seconds apart', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:30Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0].imagingStudyId).to.equal('study-1');
  });

  it('does not match at 31 seconds apart', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:31Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0]).to.not.have.property('imagingStudyId');
  });

  it('uses each imaging study at most once (1:1 matching)', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
      { id: 'lab-2', type: RAD_TYPE, sortDate: '2025-01-10T09:00:25Z' },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:10Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    const matched = result.filter(r => r.imagingStudyId);
    expect(matched).to.have.lengthOf(1);
    expect(matched[0].id).to.equal('lab-1');
  });

  it('skips labs without sortDate', () => {
    const labs = [
      { id: 'no-date', type: RAD_TYPE },
      {
        id: 'with-date',
        type: RAD_TYPE,
        sortDate: '2025-01-10T09:00:00Z',
      },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:10Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0]).to.not.have.property('imagingStudyId');
    expect(result[1].imagingStudyId).to.equal('study-1');
  });

  it('skips imaging studies without rawDate', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [{ id: 'study-1', status: 'available' }];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0]).to.not.have.property('imagingStudyId');
  });

  it('skips labs with invalid sortDate', () => {
    const labs = [{ id: 'lab-1', type: RAD_TYPE, sortDate: 'not-a-date' }];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:00Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0]).to.not.have.property('imagingStudyId');
  });

  it('skips non-radiology labs even when timestamps match', () => {
    const labs = [
      {
        id: 'chem-1',
        type: 'chemistry',
        sortDate: '2025-01-10T09:00:00Z',
      },
      { id: 'rad-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [
      {
        id: 'study-1',
        rawDate: '2025-01-10T09:00:05Z',
        status: 'available',
        imageCount: 2,
      },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0]).to.not.have.property('imagingStudyId');
    expect(result[1].imagingStudyId).to.equal('study-1');
  });

  it('handles multiple labs matching multiple studies', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
      { id: 'lab-2', type: RAD_TYPE, sortDate: '2025-01-10T14:00:00Z' },
      { id: 'lab-3', type: RAD_TYPE, sortDate: '2025-01-11T10:00:00Z' },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:20Z', status: 'available' },
      { id: 'study-2', rawDate: '2025-01-11T10:00:15Z', status: 'complete' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(result[0].imagingStudyId).to.equal('study-1');
    expect(result[1]).to.not.have.property('imagingStudyId');
    expect(result[2].imagingStudyId).to.equal('study-2');
    expect(result[2].imagingStudyStatus).to.equal('complete');
  });

  it('does not mutate the original labs array', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:10Z', status: 'available' },
    ];
    const result = mergeImagingStudiesIntoLabs(labs, studies);
    expect(labs[0]).to.not.have.property('imagingStudyId');
    expect(result[0].imagingStudyId).to.equal('study-1');
  });

  it('emits a datadogRum action with merge statistics', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
      { id: 'lab-2', type: RAD_TYPE, sortDate: '2025-01-10T14:00:00Z' },
    ];
    const studies = [
      {
        id: 'study-1',
        rawDate: '2025-01-10T09:00:20Z',
        status: 'available',
        imageCount: 3,
      },
    ];
    mergeImagingStudiesIntoLabs(labs, studies);
    expect(addActionStub.calledOnce).to.be.true;
    const [actionName, stats] = addActionStub.firstCall.args;
    expect(actionName).to.equal('merge_imaging_studies');
    expect(stats.reportCount).to.equal(2);
    expect(stats.studyCount).to.equal(1);
    expect(stats.matchedCount).to.equal(1);
    expect(stats.unmatchedReports).to.equal(1);
    expect(stats.unmatchedStudies).to.equal(0);
    expect(stats.maxClosestDistanceMs).to.equal(20000);
    expect(stats.minClosestDistanceMs).to.equal(20000);
    expect(stats.toleranceMs).to.equal(30000);
  });

  it('emits stats with zero studies when only radiology reports exist', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    mergeImagingStudiesIntoLabs(labs, []);
    expect(addActionStub.calledOnce).to.be.true;
    const [, stats] = addActionStub.firstCall.args;
    expect(stats.reportCount).to.equal(1);
    expect(stats.studyCount).to.equal(0);
    expect(stats.matchedCount).to.equal(0);
  });

  it('does not emit stats when both lists are empty', () => {
    mergeImagingStudiesIntoLabs([], []);
    expect(addActionStub.called).to.be.false;
  });
});

describe('computeMergeStats', () => {
  it('computes correct counts for a mix of matched and unmatched', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
      { id: 'lab-2', type: RAD_TYPE, sortDate: '2025-01-10T14:00:00Z' },
      { id: 'lab-3', type: RAD_TYPE, sortDate: '2025-01-11T10:00:00Z' },
    ];
    // study-1 is 20s from lab-1, study-2 is far from all labs
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:20Z' },
      { id: 'study-2', rawDate: '2025-01-12T08:00:00Z' },
    ];
    const matchedIds = new Set(['study-1']);

    const stats = computeMergeStats(labs, studies, matchedIds);

    expect(stats.reportCount).to.equal(3);
    expect(stats.studyCount).to.equal(2);
    expect(stats.matchedCount).to.equal(1);
    expect(stats.unmatchedReports).to.equal(2);
    expect(stats.unmatchedStudies).to.equal(1);
    // study-1 closest is lab-1 at 20s, study-2 closest is lab-3 at 22h
    expect(stats.minClosestDistanceMs).to.equal(20000);
    expect(stats.maxClosestDistanceMs).to.be.greaterThan(20000);
    expect(stats.toleranceMs).to.equal(30000);
  });

  it('returns null distances when there are no reports', () => {
    const labs = [];
    const studies = [{ id: 'study-1', rawDate: '2025-01-12T08:00:00Z' }];
    const matchedIds = new Set();

    const stats = computeMergeStats(labs, studies, matchedIds);

    expect(stats.matchedCount).to.equal(0);
    expect(stats.minClosestDistanceMs).to.be.null;
    expect(stats.maxClosestDistanceMs).to.be.null;
  });

  it('counts near misses within 2x tolerance', () => {
    // Lab at 09:00:00, unmatched study at 09:00:45 (45s away, within 60s = 2x30s)
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [{ id: 'study-1', rawDate: '2025-01-10T09:00:45Z' }];
    const matchedIds = new Set();

    const stats = computeMergeStats(labs, studies, matchedIds);

    expect(stats.nearMissCount).to.equal(1);
    expect(stats.unmatchedStudies).to.equal(1);
    expect(stats.minClosestDistanceMs).to.equal(45000);
  });

  it('does not count distant unmatched studies as near misses', () => {
    // Lab at 09:00:00, unmatched study at 10:00:00 (3600s away, well outside 60s)
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [{ id: 'study-1', rawDate: '2025-01-10T10:00:00Z' }];
    const matchedIds = new Set();

    const stats = computeMergeStats(labs, studies, matchedIds);

    expect(stats.nearMissCount).to.equal(0);
  });

  it('tracks min and max closest distances across multiple studies', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
      { id: 'lab-2', type: RAD_TYPE, sortDate: '2025-01-10T14:00:00Z' },
    ];
    // study-1 is 5s from lab-1, study-2 is 25s from lab-2
    const studies = [
      { id: 'study-1', rawDate: '2025-01-10T09:00:05Z' },
      { id: 'study-2', rawDate: '2025-01-10T14:00:25Z' },
    ];
    const matchedIds = new Set(['study-1', 'study-2']);

    const stats = computeMergeStats(labs, studies, matchedIds);

    expect(stats.minClosestDistanceMs).to.equal(5000);
    expect(stats.maxClosestDistanceMs).to.equal(25000);
  });

  it('excludes labs without valid sortDate from reportCount', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
      { id: 'lab-2', type: RAD_TYPE },
      { id: 'lab-3', type: RAD_TYPE, sortDate: 'not-a-date' },
    ];
    const studies = [];
    const matchedIds = new Set();

    const stats = computeMergeStats(labs, studies, matchedIds);

    expect(stats.reportCount).to.equal(1);
  });

  it('excludes non-radiology labs from reportCount', () => {
    const labs = [
      { id: 'lab-1', type: RAD_TYPE, sortDate: '2025-01-10T09:00:00Z' },
      { id: 'chem-1', type: 'chemistry', sortDate: '2025-01-10T09:00:00Z' },
      { id: 'path-1', type: 'pathology', sortDate: '2025-01-10T09:00:00Z' },
    ];
    const studies = [];
    const matchedIds = new Set();

    const stats = computeMergeStats(labs, studies, matchedIds);

    expect(stats.reportCount).to.equal(1);
  });
});
