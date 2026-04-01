import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { VaBreadcrumbs } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import api from '../utilities/api';
import ClaimantDetailRow from '../components/ClaimantDetailRow';
import ClaimantDetailsWrapper from '../components/ClaimantDetailsWrapper';
import { claimantOverviewBC } from '../utilities/poaRequests';

const toTitleCase = value => {
  if (!value) return '';

  return String(value)
    .toLowerCase()
    .replace(/\b([a-z])/g, char => char.toUpperCase());
};

const formatAddressPart = value => {
  if (!value) return '';

  return String(value)
    .trim()
    .split(/\s+/)
    .map(part => {
      if (/^[A-Z]{2}$/.test(part)) return part;
      if (/^\d+[A-Za-z]?$/.test(part)) return part;
      return toTitleCase(part);
    })
    .join(' ');
};

const formatAddress = address => {
  if (!address) return '—';

  const {
    street,
    line1,
    line2,
    city,
    state,
    zip,
    postal_code: postalCode,
  } = address;

  const streetPart = [street || line1, line2]
    .filter(Boolean)
    .map(formatAddressPart)
    .join(' ');

  const cityPart = city ? toTitleCase(city) : '';
  const statePart = state ? String(state).toUpperCase() : '';
  const zipPart = zip || postalCode || '';

  if (!streetPart && !cityPart && !statePart && !zipPart) return '—';

  return (
    <>
      {streetPart && (
        <div>
          {streetPart}
          {(cityPart || statePart || zipPart) && ','}
        </div>
      )}
      {(cityPart || statePart || zipPart) && (
        <div>
          {cityPart}
          {cityPart && ','}
          {statePart && ` ${statePart}`}
          {zipPart && ` ${zipPart}`}
        </div>
      )}
    </>
  );
};

const ITF_SECTION_TITLES = {
  compensation: 'Disability compensation',
  pension: 'Pension',
  survivor: 'Survivor',
};

const ITF_BENEFIT_LABELS = {
  compensation: 'Disability compensation (VA Form 21-526EZ)',
  pension: 'Pension (VA Form 21P-527EZ)',
  survivor: 'Survivor benefits',
};

const normalizeItfArray = rawItf => {
  if (!Array.isArray(rawItf)) return [];

  return rawItf
    .map(entry => {
      const attrs = entry?.data?.attributes || entry?.attributes || entry;

      const benefitType =
        attrs?.type || entry?.benefitType || entry?.benefit_type;
      if (!benefitType) return null;

      const itfDate = attrs?.creationDate || attrs?.itfDate || attrs?.itf_date;
      const expirationDate =
        attrs?.expirationDate || attrs?.expiration_date || null;

      return {
        benefitType,
        benefit: ITF_BENEFIT_LABELS[benefitType] || benefitType,
        itfDate: itfDate || null,
        expirationDate,
        status: attrs?.status || null,
      };
    })
    .filter(Boolean);
};

const mapClaimantOverview = raw => ({
  firstName: raw?.first_name,
  lastName: raw?.last_name,
  dateOfBirth: raw?.birth_date,
  veteranSsn: raw?.ssn,
  claimantSsn: raw?.claimant_ssn,
  claimantDateOfBirth: raw?.claimant_birth_date,
  claimantFullName:
    raw?.claimant_first_name || raw?.claimant_last_name
      ? { first: raw?.claimant_first_name, last: raw?.claimant_last_name }
      : null,
  phone: raw?.phone,
  email: raw?.email,
  address: raw?.address || null,
  representativeName: raw?.representative_name || null,
  intentToFile: normalizeItfArray(raw?.itf),
});

const formatItfDate = value => {
  if (!value) return '—';

  const raw = typeof value === 'string' ? value : String(value);
  const dateOnly = raw.includes('T') ? raw.split('T')[0] : raw;

  let d;

  if (/^\d{8}$/.test(dateOnly)) {
    const y = Number(dateOnly.slice(0, 4));
    const m = Number(dateOnly.slice(4, 6)) - 1;
    const day = Number(dateOnly.slice(6, 8));
    d = new Date(y, m, day);
  } else {
    d = new Date(dateOnly);
  }

  if (Number.isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const daysUntil = isoDate => {
  if (!isoDate) return null;
  const end = new Date(isoDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const formatExpiresText = expirationDate => {
  const d = daysUntil(expirationDate);
  if (d == null) return '';
  if (d < 0) return '(Expired)';
  return `(Expires in ${d} days)`;
};

const showExpiryWarning = expirationDate => {
  const d = daysUntil(expirationDate);
  return d != null && d >= 0 && d <= 60;
};

const ClaimantOverviewPage = () => {
  const { authorized = true, claimant = null, notRepresented = false } =
    useLoaderData() || {};
  const unauthorized = authorized === false;

  const wrapperFirstName = claimant?.firstName || '—';
  const wrapperLastName = claimant?.lastName || '—';

  if (unauthorized && notRepresented) {
    return (
      <section className="vads-u-width--full claimant-overview">
        <VaBreadcrumbs
          breadcrumbList={claimantOverviewBC}
          label="claimant overview breadcrumb"
          homeVeteransAffairs={false}
        />

        <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
          Claimant not found
        </h2>

        <div className="vads-l-grid-row">
          <div className="vads-l-col--12 medium-screen:vads-l-col--8">
            <div className="vads-u-margin-y--2">
              <va-alert status="info">
                <h2 slot="headline">You don’t represent this claimant</h2>
                <p>
                  This claimant may be in our system, but you can’t access their
                  information or act on their behalf until you establish
                  representation.
                </p>
                <a href="/representative/help">
                  Learn about establishing representation
                </a>
              </va-alert>
            </div>
          </div>
        </div>

        <a
          className="vads-c-action-link--green vads-u-margin-top--2"
          href="/representative/find-claimant"
        >
          Find another claimant
        </a>
      </section>
    );
  }

  return (
    <section className="vads-u-width--full claimant-overview">
      <VaBreadcrumbs
        breadcrumbList={claimantOverviewBC}
        label="claimant overview breadcrumb"
        homeVeteransAffairs={false}
      />

      <ClaimantDetailsWrapper
        firstName={wrapperFirstName}
        lastName={wrapperLastName}
      >
        {unauthorized &&
          notRepresented && (
            <>
              <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
                Claimant not found
              </h2>

              <div className="vads-u-margin-y--2">
                <va-alert status="info">
                  <h3 slot="headline">You don’t represent this claimant</h3>
                  <p>
                    This claimant may be in our system, but you can’t access
                    their information or act on their behalf until you establish
                    representation.
                  </p>
                  <a href="/representative/help">
                    Learn about establishing representation
                  </a>
                </va-alert>
              </div>
            </>
          )}

        {unauthorized &&
          !notRepresented && (
            <>
              <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--4">
                Claimant overview
              </h2>
              <div className="vads-u-margin-y--2">
                <va-alert status="warning">
                  <h3 slot="headline">
                    You’re not authorized to view this claimant
                  </h3>
                  <p>
                    You may not have access to this claimant yet, or your
                    current account isn’t set up with the required permissions.
                  </p>
                </va-alert>
              </div>
            </>
          )}

        {!unauthorized && (
          <>
            <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--4">
              Claimant overview
            </h2>

            <section className="vads-u-margin-top--0">
              <h3 className="vads-u-margin-top--0 claimant-overview__section-heading">
                Claimant information
              </h3>

              <div className="vads-grid-row">
                <div className="vads-grid-col-11">
                  <ul className="poa-request-details__list poa-request-details__list--info">
                    <ClaimantDetailRow
                      label="Social Security number"
                      value={
                        claimant?.veteranSsn
                          ? `***-**-${String(claimant.veteranSsn).slice(-4)}`
                          : '—'
                      }
                    />
                    <ClaimantDetailRow
                      label="Date of birth"
                      value={formatItfDate(claimant?.dateOfBirth)}
                    />
                    <ClaimantDetailRow
                      label="Address"
                      value={formatAddress(claimant?.address)}
                    />
                    <ClaimantDetailRow
                      label="Phone"
                      value={
                        claimant?.phone ? (
                          <va-telephone
                            contact={claimant.phone}
                            not-clickable
                          />
                        ) : (
                          '—'
                        )
                      }
                    />
                    <ClaimantDetailRow
                      label="Email"
                      value={
                        claimant?.email ? (
                          <a href={`mailto:${claimant.email}`}>
                            {claimant.email}
                          </a>
                        ) : (
                          'No email on file'
                        )
                      }
                    />
                  </ul>
                </div>
              </div>
            </section>

            <section className="vads-u-margin-top--4">
              <h3 className="vads-u-margin-top--0 claimant-overview__section-heading">
                Representative information
              </h3>

              <div className="vads-grid-row">
                <div className="vads-grid-col-11">
                  <ul className="poa-request-details__list poa-request-details__list--info">
                    <ClaimantDetailRow
                      label="Representative"
                      value={claimant?.representativeName || '—'}
                    />
                  </ul>
                </div>
              </div>

              <div className="vads-u-margin-top--4">
                <va-additional-info trigger="The portal doesn’t check for limited representation">
                  <p className="vads-u-margin-y--0 vads-u-font-size--base vads-u-line-height--4">
                    Limited representation means that the representation is only
                    for a specific claim or claims. Check with the claimant or
                    in VBMS for any existing limited representation.
                  </p>
                </va-additional-info>
              </div>
            </section>

            <section className="vads-u-margin-top--4">
              <h3 className="vads-u-margin-top--0 vads-u-margin-bottom--1">
                Intent to file status
              </h3>

              {claimant?.intentToFile?.length ? (
                <>
                  {claimant.intentToFile.map(itf => (
                    <div
                      key={`${itf.benefitType}-${itf.itfDate ||
                        'no-date'}-${itf.expirationDate || 'no-exp'}`}
                      style={{ marginTop: '20px' }}
                    >
                      {claimant?.intentToFile?.length > 1 && (
                        <h4 className="vads-u-margin-top--0 vads-u-margin-bottom--1">
                          {ITF_SECTION_TITLES[itf.benefitType] ||
                            itf.benefitType}
                        </h4>
                      )}

                      <div className="vads-grid-row">
                        <div className="vads-grid-col-11">
                          <ul className="poa-request-details__list poa-request-details__list--info">
                            <ClaimantDetailRow
                              label="Benefit"
                              value={itf.benefit || '—'}
                            />
                            <ClaimantDetailRow
                              label="ITF date"
                              value={
                                <span className="vads-u-display--inline-flex vads-u-align-items--center">
                                  {showExpiryWarning(itf.expirationDate) && (
                                    <va-icon
                                      icon="warning"
                                      size="2"
                                      style={{ color: '#fdb81e' }}
                                      className="vads-u-margin-right--0p5"
                                    />
                                  )}
                                  <span>
                                    {formatItfDate(itf.itfDate)}
                                    {itf.expirationDate && (
                                      <span className="vads-u-color--gray-medium">
                                        {'\u00A0'}
                                        {formatExpiresText(itf.expirationDate)}
                                      </span>
                                    )}
                                  </span>
                                </span>
                              }
                            />
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="vads-u-margin-top--0 vads-u-margin-bottom--3">
                    This claimant doesn’t have an intent to file. To establish
                    an intent to file within minutes, submit online VA Form
                    21-0966.
                  </p>

                  <a
                    className="vads-c-action-link--blue vads-u-margin-top--2"
                    href="/representative/representative-form-upload/submit-va-form-21-0966/introduction"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Submit online VA Form 21-0966
                  </a>
                </>
              )}
            </section>
          </>
        )}
      </ClaimantDetailsWrapper>
    </section>
  );
};

ClaimantOverviewPage.loader = async ({ params }) => {
  const claimantId = params?.claimantId;
  if (!claimantId) throw new Response('Not Found', { status: 404 });

  try {
    const overviewRes = await api.getClaimantOverview(claimantId);

    if (overviewRes.status === 401) throw overviewRes;
    if (!overviewRes.ok) throw overviewRes;

    const overviewJson = await overviewRes.json();
    const overviewRaw = overviewJson?.data || overviewJson;
    const claimant = mapClaimantOverview(overviewRaw);

    return { authorized: true, claimant, claimantId };
  } catch (err) {
    if (err instanceof Response && err.status === 403) {
      return {
        authorized: false,
        claimant: null,
        claimantId,
        notRepresented: true,
      };
    }

    throw err;
  }
};

export default ClaimantOverviewPage;
