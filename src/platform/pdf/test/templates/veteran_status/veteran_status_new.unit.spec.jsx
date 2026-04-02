import { expect } from 'chai';

const getStream = require('get-stream');

// Workaround for pdf.js incompatibility.
// cf. https://github.com/mozilla/pdf.js/issues/15728
const originalPlatform = navigator.platform;
navigator.platform = '';

const pdfjs = require('pdfjs-dist/legacy/build/pdf');

/** Normalizes extracted PDF text (line breaks differ from source strings). */
const normalizePdfText = text => text.replace(/\s+/g, ' ').trim();

const DESCRIPTION_SNIPPETS = [
  'This card makes it easy to prove your service and access Veteran discounts',
  'all while keeping your personal information secure.',
];

describe('Veteran Status PDF template (veteran_status_new)', () => {
  after(() => {
    navigator.platform = originalPlatform;
  });

  const getStringsFromPdf = async pdf => {
    const page = await pdf.getPage(1);
    const content = await page.getTextContent({ includeMarkedContent: true });
    return content.items.map(item => item.str).filter(Boolean);
  };

  const getTextForStructTag = (content, tag) => {
    const { items } = content;
    const idx = items.findIndex(item => item.tag === tag);
    expect(idx, `expected a ${tag} in tagged text content`).to.be.gte(0);
    return items[idx].str || items[idx + 1]?.str;
  };

  const generatePdf = async data => {
    const template = require('../../../templates/veteran_status_new');
    const doc = await template.generate(data);
    doc.end();
    return getStream.buffer(doc);
  };

  const generateAndParsePdf = async data => {
    const pdfData = await generatePdf(data);
    const pdf = await pdfjs.getDocument(pdfData).promise;
    const metadata = await pdf.getMetadata();
    return { metadata, pdf };
  };

  it('places the page title in an H1', async () => {
    const data = require('./fixtures/veteran_status_new.json');
    const { pdf } = await generateAndParsePdf(data);
    const page = await pdf.getPage(1);
    const content = await page.getTextContent({ includeMarkedContent: true });
    expect(getTextForStructTag(content, 'H1')).to.eq('Veteran Status Card');
  });

  it('uses a single root Document in the structure tree', async () => {
    const data = require('./fixtures/veteran_status_new.json');
    const { pdf } = await generateAndParsePdf(data);
    const page = await pdf.getPage(1);
    const structure = await page.getStructTree();
    expect(structure.children.length).to.equal(1);
    expect(structure.children[0].role).to.equal('Document');
  });

  it('renders the marketing description, card copy, and service line', async () => {
    const data = require('./fixtures/veteran_status_new.json');
    const { pdf } = await generateAndParsePdf(data);
    const strings = await getStringsFromPdf(pdf);
    const joined = strings.join('\n');
    const flat = normalizePdfText(joined);
    DESCRIPTION_SNIPPETS.forEach(snippet => {
      expect(flat).to.include(snippet);
    });
    expect(strings.filter(s => s === 'Latest period of service').length).to.eq(
      1,
    );
    expect(strings.filter(s => s === data.details.latestService).length).to.eq(
      1,
    );
    expect(strings.filter(s => s === 'DoD ID Number').length).to.eq(1);
    expect(strings.filter(s => s === data.details.edipi).length).to.eq(1);
    expect(strings.filter(s => s === 'VA disability rating').length).to.eq(1);
    expect(strings.filter(s => s === '30%').length).to.eq(1);
    expect(
      strings.filter(
        s => s === "This card doesn't entitle you to any VA benefits.",
      ).length,
    ).to.eq(1);
    expect(
      strings.filter(s => s === 'Cut this card out and keep in your wallet.')
        .length,
    ).to.eq(1);
  });

  it('sets default document metadata', async () => {
    const data = require('./fixtures/veteran_status_new.json');
    const { metadata } = await generateAndParsePdf(data);
    expect(metadata.info.Language).to.equal('en-US');
    expect(metadata.info.Author).to.equal('Department of Veterans Affairs');
    expect(metadata.info.Title).to.equal(data.title);
  });

  it('rejects payloads missing latestService', async () => {
    const data = require('./fixtures/veteran_status_new.json');
    const template = require('../../../templates/veteran_status_new');
    const bad = {
      ...data,
      details: { ...data.details, latestService: undefined },
    };
    let caught;
    try {
      await template.generate(bad);
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceOf(Error);
    expect(caught.message).to.match(/latestService/);
  });
});
