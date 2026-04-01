import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import { registerFonts, knownFonts, fallbackFonts } from '../registerFonts';

describe('registerFonts', () => {
  let doc;
  let fetchStub;
  let existsSyncStub;
  let writeFileSyncStub;
  let consoleErrorStub;

  beforeEach(() => {
    doc = { registerFont: sinon.stub() };
    fetchStub = sinon.stub(global, 'fetch');
    existsSyncStub = sinon.stub(fs, 'existsSync').throws(new Error('ENOENT'));
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    fetchStub.restore();
    existsSyncStub.restore();
    writeFileSyncStub.restore();
    consoleErrorStub.restore();
  });

  describe('knownFonts', () => {
    it('contains expected font entries', () => {
      expect(knownFonts).to.have.property('Bitter-Bold');
      expect(knownFonts).to.have.property('SourceSansPro-Regular');
      expect(knownFonts).to.have.property('RobotoMono-Regular');
    });
  });

  describe('registerFonts', () => {
    it('skips unknown fonts', async () => {
      await registerFonts(doc, ['NonExistentFont']);
      expect(doc.registerFont.called).to.be.false;
      expect(fetchStub.called).to.be.false;
    });
  });

  describe('fallbackFonts', () => {
    it('maps every knownFont to a built-in PDFKit fallback', () => {
      Object.keys(knownFonts).forEach(font => {
        expect(fallbackFonts).to.have.property(font);
      });
    });
  });

  describe('downloadAndRegisterFont fallback behavior', () => {
    it('registers fallback font when fetch rejects', async () => {
      fetchStub.rejects(new Error('Failed to fetch'));

      await registerFonts(doc, ['Bitter-Bold']);
      expect(doc.registerFont.calledOnce).to.be.true;
      expect(doc.registerFont.firstCall.args[0]).to.equal('Bitter-Bold');
      expect(doc.registerFont.firstCall.args[1]).to.equal('Helvetica-Bold');
      expect(consoleErrorStub.called).to.be.true;
    });

    it('registers fallback font when arrayBuffer fails', async () => {
      fetchStub.resolves({
        ok: true,
        arrayBuffer: sinon.stub().rejects(new Error('body stream error')),
      });

      await registerFonts(doc, ['SourceSansPro-Regular']);
      expect(doc.registerFont.calledOnce).to.be.true;
      expect(doc.registerFont.firstCall.args[0]).to.equal(
        'SourceSansPro-Regular',
      );
      expect(doc.registerFont.firstCall.args[1]).to.equal('Helvetica');
      expect(consoleErrorStub.called).to.be.true;
    });

    it('registers fallback font on HTTP error response', async () => {
      fetchStub.resolves({ ok: false, status: 403 });

      await registerFonts(doc, ['Bitter-Bold']);
      expect(doc.registerFont.calledOnce).to.be.true;
      expect(doc.registerFont.firstCall.args[0]).to.equal('Bitter-Bold');
      expect(doc.registerFont.firstCall.args[1]).to.equal('Helvetica-Bold');
      expect(consoleErrorStub.called).to.be.true;
    });

    it('downloads and registers font on success', async () => {
      const fakeBuffer = new ArrayBuffer(8);
      fetchStub.resolves({
        ok: true,
        arrayBuffer: sinon.stub().resolves(fakeBuffer),
      });

      await registerFonts(doc, ['Bitter-Bold']);
      expect(doc.registerFont.calledOnce).to.be.true;
      expect(doc.registerFont.firstCall.args[0]).to.equal('Bitter-Bold');
      expect(consoleErrorStub.called).to.be.false;
    });
  });
});
