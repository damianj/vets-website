import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import * as BUCKETS from 'site/constants/buckets';
import fs from 'fs';

export const knownFonts = {
  'Bitter-Bold': 'bitter-bold.ttf',
  'Bitter-Regular': 'bitter-regular.ttf',
  'SourceSansPro-Bold': 'sourcesanspro-bold-webfont.ttf',
  'SourceSansPro-Italic': 'sourcesanspro-italic-webfont.ttf',
  'SourceSansPro-Light': 'sourcesanspro-light-webfont.ttf',
  'SourceSansPro-Regular': 'sourcesanspro-regular-webfont.ttf',
  'RobotoMono-Regular': 'robotomono-regular.ttf',
};

// Built-in PDFKit fonts that require no download.
// Used as fallbacks when custom font downloads fail (e.g. page backgrounded on
// mobile, Safari fetch failures, corporate proxies blocking .ttf requests).
export const fallbackFonts = {
  'Bitter-Bold': 'Helvetica-Bold',
  'Bitter-Regular': 'Helvetica',
  'SourceSansPro-Bold': 'Helvetica-Bold',
  'SourceSansPro-Regular': 'Helvetica',
  'SourceSansPro-Light': 'Helvetica',
  'SourceSansPro-Italic': 'Helvetica-Oblique',
  'RobotoMono-Regular': 'Courier',
};

const registerLocalFont = (doc, font) => {
  try {
    if (fs.existsSync(`src/site/assets/fonts/${knownFonts[font]}`)) {
      doc.registerFont(font, `src/site/assets/fonts/${knownFonts[font]}`);
    }
    return true;
  } catch {
    return false;
  }
};

const downloadAndRegisterFont = async (doc, font) => {
  const bucket = environment.isLocalhost()
    ? ''
    : BUCKETS[environment.BUILDTYPE];
  const url = `${bucket}/generated/${knownFonts[font]}`;
  try {
    const request = await fetch(url);
    if (!request.ok) {
      throw new Error(`HTTP ${request.status}`);
    }
    const binaryFont = await request.arrayBuffer();
    const encodedFont = Buffer.from(binaryFont).toString('base64');
    fs.writeFileSync(knownFonts[font], encodedFont);
    doc.registerFont(font, knownFonts[font]);
  } catch (error) {
    const fallback = fallbackFonts[font];
    if (fallback) {
      // Register the built-in font under the custom font name so templates
      // that reference e.g. 'Bitter-Bold' still work with degraded styling.
      doc.registerFont(font, fallback);
    }
    // Log the failure but don't throw — the fallback font allows PDF
    // generation to continue with degraded styling instead of failing entirely.
    // eslint-disable-next-line no-console
    console.error(
      `Failed to download font ${font} from ${url}, using fallback ${fallback ||
        'none'}: ${error.message}`,
    );
  }
};

export const registerFonts = async function(doc, fonts) {
  const fontPromises = fonts.map(async font => {
    if (!knownFonts[font]) return;

    /**
     * Load custom fonts from the local filesystem if available,
     * otherwise pull them via http.
     */
    const success = registerLocalFont(doc, font);

    if (!success) {
      await downloadAndRegisterFont(doc, font);
    }
  });

  await Promise.all(fontPromises);
};
