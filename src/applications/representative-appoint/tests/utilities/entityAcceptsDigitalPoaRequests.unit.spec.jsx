import { expect } from 'chai';

import { entityAcceptsDigitalPoaRequests } from '../../utilities/helpers';

describe('entityAcceptsDigitalPoaRequests', () => {
  context('when the representative is an organization', () => {
    context('when individualAcceptEnabled is false (default)', () => {
      context('when the organization accepts digital submissions', () => {
        it('returns true', () => {
          const mockEntity = {
            type: 'organization',
            attributes: { canAcceptDigitalPoaRequests: true },
          };
          const result = entityAcceptsDigitalPoaRequests(mockEntity);
          expect(result).to.be.true;
        });
      });
      context(
        'when the organization does not accept digital submissions',
        () => {
          it('returns false', () => {
            const mockEntity = {
              type: 'organization',
              attributes: { canAcceptDigitalPoaRequests: false },
            };
            const result = entityAcceptsDigitalPoaRequests(mockEntity);
            expect(result).to.be.false;
          });
        },
      );
    });

    context('when individualAcceptEnabled is true', () => {
      context(
        'when canAcceptDigitalPoaRequests and repsCanAcceptAnyRequest are both true',
        () => {
          it('returns true', () => {
            const mockEntity = {
              type: 'organization',
              attributes: {
                canAcceptDigitalPoaRequests: true,
                repsCanAcceptAnyRequest: true,
              },
            };
            const result = entityAcceptsDigitalPoaRequests(mockEntity, true);
            expect(result).to.be.true;
          });
        },
      );

      context(
        'when canAcceptDigitalPoaRequests is true but repsCanAcceptAnyRequest is false',
        () => {
          it('returns false', () => {
            const mockEntity = {
              type: 'organization',
              attributes: {
                canAcceptDigitalPoaRequests: true,
                repsCanAcceptAnyRequest: false,
              },
            };
            const result = entityAcceptsDigitalPoaRequests(mockEntity, true);
            expect(result).to.be.false;
          });
        },
      );

      context(
        'when canAcceptDigitalPoaRequests is false but repsCanAcceptAnyRequest is true',
        () => {
          it('returns false', () => {
            const mockEntity = {
              type: 'organization',
              attributes: {
                canAcceptDigitalPoaRequests: false,
                repsCanAcceptAnyRequest: true,
              },
            };
            const result = entityAcceptsDigitalPoaRequests(mockEntity, true);
            expect(result).to.be.false;
          });
        },
      );

      context('when both are false', () => {
        it('returns false', () => {
          const mockEntity = {
            type: 'organization',
            attributes: {
              canAcceptDigitalPoaRequests: false,
              repsCanAcceptAnyRequest: false,
            },
          };
          const result = entityAcceptsDigitalPoaRequests(mockEntity, true);
          expect(result).to.be.false;
        });
      });

      context('when repsCanAcceptAnyRequest is missing', () => {
        it('returns false', () => {
          const mockEntity = {
            type: 'organization',
            attributes: {
              canAcceptDigitalPoaRequests: true,
            },
          };
          const result = entityAcceptsDigitalPoaRequests(mockEntity, true);
          expect(result).to.be.false;
        });
      });
    });
  });

  context('when the representative is a vso representative', () => {
    context(
      'when at least one organization accepts digital submissions',
      () => {
        it('returns true', () => {
          const mockEntity = {
            type: 'representative',
            attributes: {
              accreditedOrganizations: {
                data: [
                  { attributes: { canAcceptDigitalPoaRequests: true } },
                  { attributes: { canAcceptDigitalPoaRequests: true } },
                  { attributes: { canAcceptDigitalPoaRequests: false } },
                ],
              },
            },
          };
          const result = entityAcceptsDigitalPoaRequests(mockEntity);
          expect(result).to.be.true;
        });
      },
    );

    context('when no organization accepts digital submissions', () => {
      it('returns false', () => {
        const mockEntity = {
          type: 'representative',
          attributes: {
            accreditedOrganizations: {
              data: [
                { attributes: { canAcceptDigitalPoaRequests: false } },
                { attributes: { canAcceptDigitalPoaRequests: false } },
                { attributes: { canAcceptDigitalPoaRequests: false } },
              ],
            },
          },
        };
        const result = entityAcceptsDigitalPoaRequests(mockEntity);
        expect(result).to.be.false;
      });
    });

    context('when there are no organizations', () => {
      it('returns false', () => {
        const mockEntity = {
          type: 'representative',
          attributes: {
            accreditedOrganizations: {
              data: [],
            },
          },
        };
        const result = entityAcceptsDigitalPoaRequests(mockEntity);
        expect(result).to.be.false;
      });
    });
  });

  context('when the representative is an attorney', () => {
    it('returns false', () => {
      const mockEntity = {
        type: 'representative',
        attributes: { individualType: 'attorney' },
      };
      const result = entityAcceptsDigitalPoaRequests(mockEntity);
      expect(result).to.be.false;
    });
  });

  context('when the representative is a claims agent', () => {
    it('returns false', () => {
      const mockEntity = {
        type: 'representative',
        attributes: { individualType: 'claims_agent' },
      };
      const result = entityAcceptsDigitalPoaRequests(mockEntity);
      expect(result).to.be.false;
    });
  });
});
