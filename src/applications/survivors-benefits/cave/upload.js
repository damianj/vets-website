import { apiRequest } from 'platform/utilities/api';
import { buildIntakeUrl } from './endpoints';
import { createCaveError } from './errors';

const isPdfFile = file =>
  file?.type === 'application/pdf' ||
  file?.name?.toLowerCase().endsWith('.pdf');

const readFileAsBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Unable to prepare PDF for CAVE upload.'));
    };

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to prepare PDF for CAVE upload.'));
        return;
      }

      const [, pdfB64] = reader.result.split(',');
      if (!pdfB64) {
        reject(new Error('Unable to prepare PDF for CAVE upload.'));
        return;
      }

      resolve(pdfB64);
    };

    reader.readAsDataURL(file);
  });

export const uploadDocument = async file => {
  if (!isPdfFile(file)) {
    throw new Error('Unsupported file type for CAVE upload.');
  }

  const pdfB64 = await readFileAsBase64(file);
  const requestBody = Object.fromEntries([
    ['pdf_b64', pdfB64],
    ['file_name', file.name],
  ]);

  let payload;
  try {
    payload = await apiRequest(buildIntakeUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    throw createCaveError(error, {
      prefix: 'CAVE intake failed',
      fallbackDetail: 'CAVE intake request failed.',
    });
  }

  const { id, bucket, pdfKey } = payload || {};

  if (!id) {
    throw new Error('CAVE intake succeeded but no document id was returned.');
  }

  return { id, bucket, pdfKey };
};

export default uploadDocument;
