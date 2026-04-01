import { expect } from 'chai';
import sinon from 'sinon';
import * as api from 'platform/utilities/api';
import { uploadDocument } from '../../../cave/upload';

const TEST_PDF_B64 = 'JVBERi0xLjQ=';

const makePdfFile = (name = 'test.pdf') => ({
  name,
  type: 'application/pdf',
  base64: TEST_PDF_B64,
});

const makeJpegFile = () => ({
  name: 'photo.jpg',
  type: 'image/jpeg',
});

describe('cave/upload — uploadDocument', () => {
  let sandbox;
  let apiRequestStub;
  let originalFileReader;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    apiRequestStub = sandbox.stub(api, 'apiRequest');
    originalFileReader = global.FileReader;

    global.FileReader = class {
      readAsDataURL(file) {
        this.result = `data:${file.type};base64,${file.base64 || ''}`;

        if (this.onload) {
          this.onload();
        }
      }
    };
  });

  afterEach(() => {
    global.FileReader = originalFileReader;
    sandbox.restore();
  });

  it('throws for a non-PDF file type', async () => {
    let error;
    try {
      await uploadDocument(makeJpegFile());
    } catch (e) {
      error = e;
    }
    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.include('Unsupported file type');
  });

  it('accepts a file whose name ends with .pdf regardless of MIME type', async () => {
    apiRequestStub.resolves({ id: 'doc-1', bucket: 'b', pdfKey: 'k' });
    const file = {
      name: 'upload.pdf',
      type: 'application/octet-stream',
      base64: TEST_PDF_B64,
    };
    const result = await uploadDocument(file);
    expect(result.id).to.equal('doc-1');
  });

  it('calls apiRequest with POST method and the expected JSON payload', async () => {
    apiRequestStub.resolves({ id: 'doc-1', bucket: 'b', pdfKey: 'k' });
    await uploadDocument(makePdfFile());
    const expectedBody = Object.fromEntries([
      ['pdf_b64', TEST_PDF_B64],
      ['file_name', 'test.pdf'],
    ]);

    expect(apiRequestStub.calledOnce).to.be.true;
    expect(apiRequestStub.firstCall.args[1].method).to.equal('POST');
    expect(apiRequestStub.firstCall.args[1].headers).to.deep.equal({
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(apiRequestStub.firstCall.args[1].body)).to.deep.equal(
      expectedBody,
    );
  });

  it('returns { id, bucket, pdfKey } on success', async () => {
    apiRequestStub.resolves({
      id: 'doc-1',
      bucket: 'my-bucket',
      pdfKey: 'path/key',
    });
    const result = await uploadDocument(makePdfFile());
    expect(result).to.deep.equal({
      id: 'doc-1',
      bucket: 'my-bucket',
      pdfKey: 'path/key',
    });
  });

  it('throws a wrapped error when apiRequest rejects', async () => {
    apiRequestStub.rejects({
      errors: [
        {
          status: '404',
          code: 'idp_not_found',
          detail: 'Item not found.',
        },
      ],
    });
    let error;
    try {
      await uploadDocument(makePdfFile());
    } catch (e) {
      error = e;
    }
    expect(error.message).to.include('CAVE intake failed');
    expect(error.message).to.include('404');
    expect(error.message).to.include('Item not found.');
    expect(error.status).to.equal(404);
    expect(error.code).to.equal('idp_not_found');
  });

  it('throws when the response has no id', async () => {
    apiRequestStub.resolves({ bucket: 'b', pdfKey: 'k' });
    let error;
    try {
      await uploadDocument(makePdfFile());
    } catch (e) {
      error = e;
    }
    expect(error.message).to.include('no document id');
  });
});
