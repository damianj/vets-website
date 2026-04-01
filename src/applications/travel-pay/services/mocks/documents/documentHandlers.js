const fs = require('fs');
const { claimsStore } = require('../mockStore');

/**
 * Upload a document to a claim (e.g. proof of attendance)
 * POST /travel_pay/v0/claims/:claimId/documents
 */
function uploadDocumentHandler() {
  return (req, res) => {
    const { claimId } = req.params;

    if (!claimsStore[claimId]) {
      claimsStore[claimId] = {
        id: claimId,
        claimId,
        claimNumber: `TC${Math.floor(Math.random() * 1_000_000_000)}`,
        claimStatus: 'InProgress',
        expenses: [],
        documents: [],
      };
    }

    const newDocument = {
      documentId: `mock-doc-${Date.now()}`,
      claimId,
      filename: req.body.fileName || 'proof-of-attendance.pdf',
      mimetype: req.body.contentType || 'application/pdf',
      // Store the raw base64 so downloadDocumentHandler can return the real file
      fileData: req.body.fileData || null,
    };

    if (!claimsStore[claimId].documents) {
      claimsStore[claimId].documents = [];
    }
    claimsStore[claimId].documents.push(newDocument);

    return res.status(200).json(newDocument);
  };
}

/**
 * Delete a document from a claim
 * DELETE /travel_pay/v0/claims/:claimId/documents/:documentId
 */
function deleteDocumentHandler() {
  return (req, res) => {
    const { claimId, documentId } = req.params;

    if (claimsStore[claimId]?.documents) {
      claimsStore[claimId].documents = claimsStore[claimId].documents.filter(
        doc => doc.documentId !== documentId,
      );
    }

    return res.status(200).json({ id: documentId });
  };
}

/**
 * Download a document from a claim
 * GET /travel_pay/v0/claims/:claimId/documents/:docId
 */
function downloadDocumentHandler() {
  return (req, res) => {
    const { docId } = req.params;

    // Error condition for screenshot-2 from the mock data
    if (docId === '12fcfecc-5132-4c16-8a9a-7af07b714cd4') {
      return res.status(503).json({
        errors: [
          {
            title: 'Service unavailable',
            status: 503,
            detail: 'An unknown error has occured.',
            code: 'VA900',
          },
        ],
      });
    }

    // Find the stored document across all claims so we can return the actual uploaded file
    const storedDoc = Object.values(claimsStore)
      .flatMap(claim => claim.documents || [])
      .find(doc => doc.documentId === docId);

    if (storedDoc?.fileData) {
      const buffer = Buffer.from(storedDoc.fileData, 'base64');
      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${storedDoc.filename}"`,
        'Content-Type': storedDoc.mimetype || 'application/octet-stream',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }

    // Fall back to the sample file for pre-seeded documents that have no stored data
    const docx = fs.readFileSync(
      'src/applications/travel-pay/services/mocks/sample-decision-letter.docx',
    );
    res.writeHead(200, {
      'Content-Disposition': 'attachment; filename="Rejection Letter.docx"',
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Length': docx.length,
    });
    return res.end(Buffer.from(docx, 'binary'));
  };
}

module.exports = {
  uploadDocumentHandler,
  deleteDocumentHandler,
  downloadDocumentHandler,
};
