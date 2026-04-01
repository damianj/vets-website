/**
 * AccessVA Tools and Services URL Constants
 *
 * This file contains production and staging URLs for AccessVA tools and services.
 * The appropriate URL set is returned based on the current environment domain.
 *
 * Environment detection:
 * - staging.va.gov → staging URLs
 * - www.va.gov or domains with 'prod' → production URLs
 * - preview-prod.vfs.va.gov → production URLs
 *
 * Categories:
 * - veterans: Services for Veterans, family members, and service members
 * - business: Services for Business partners, employees, and contractors
 */

// Production URLs
const PRODUCTION_LINKS = {
  veterans: [
    { text: 'Ask VA', url: 'https://www.va.gov/contact-us/ask-va/' },
    {
      text: 'Fiduciary Accountings Submission Tool (FAST)',
      url:
        'https://eauth.va.gov/accessva/?cspSelectFor=https%3A//www.my.va.gov/FAST&ForceAuthn=false',
    },
    {
      text: 'Life Insurance Online Policy Access',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=einsurance',
    },
    {
      text: 'Million Veteran Program (MVP)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=mvp',
    },
    {
      text: 'QuickSubmit',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=quicksubmit',
    },
    {
      text: 'Sports4Vets',
      url:
        'https://eauth.va.gov/accessva/?cspSelectFor=https%3A//www.my.va.gov/Veterans&ForceAuthn=false',
    },
    {
      text: 'VA Life Insurance (VALife)',
      url: 'https://www.va.gov/life-insurance/options-eligibility/valife/',
    },
    {
      text: 'VetBiz Portal',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=vetbiz',
    },
    { text: 'VetRide', url: 'https://www.vetride.va.gov/app/home' },
    {
      text:
        'Veterans Exposure Team - Health Outcomes Military Exposures (VET-HOME)',
      url: 'https://vethome.va.gov/',
    },
    {
      text: 'Veterans Health Venture Studio',
      url: 'https://dvagov-vhventures-prod-portal.powerappsportals.us/',
    },
    {
      text: 'Veterans Identification Card (VIC)',
      url: 'https://www.va.gov/records/get-veteran-id-cards/vic/',
    },
    {
      text: 'Veteran Travel Claim Entry',
      url: 'https://www.va.gov/health-care/file-travel-pay-reimbursement/',
    },
    {
      text: 'Veteran Health Identification Card (VHIC)',
      url: 'https://www.va.gov/health-care/get-health-id-card/',
    },
  ],
  business: [
    { text: 'Ask VA', url: 'https://www.va.gov/contact-us/ask-va/' },
    { text: 'Box', url: 'https://eauth.va.gov/accessva/?cspSelectFor=box' },
    { text: 'Box High Impact', url: 'https://veteransaffairs-frhext.box.com/' },
    {
      text: 'Centralized Mail Portal',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=dmhs',
    },
    {
      text: 'Community Care Referrals and Authorization (CCR&A)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=ccra',
    },
    {
      text: 'Education Development Management System (EDMS)',
      url: 'https://www.my.va.gov/DODLiaison',
    },
    {
      text: 'Fiduciary Accountings Submission Tool (FAST)',
      url: 'https://www.my.va.gov/FAST',
    },
    {
      text: 'PCS Travel / moveLINQ Approver Portal',
      url: 'https://imove-approver.mlinqsonline.net/',
    },
    {
      text: 'PCS Travel / moveLINQ Employee Portal',
      url: 'https://imove-employee.mlinqsonline.net/',
    },
    {
      text: 'PCS Travel / moveLINQ Expense Portal',
      url: 'https://imove.mlinqsonline.net/',
    },
    { text: 'Grants4Vets', url: 'https://www.my.va.gov/nvspsegrantee' },
    {
      text: 'Homeless Management Information System (HMIS)',
      url: 'https://www.hmisrepository.va.gov/',
    },
    {
      text: 'IAM Invitation Service',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=iamiis',
    },
    { text: 'Kahua', url: 'https://launch.kahuafn.com/web/' },
    {
      text: 'ProjNet',
      url: 'https://projnet.org/projnet/binKornHome/index.cfm',
    },
    { text: 'Prosthetics Vendor Portal', url: 'https://www.my.va.gov/PVP' },
    {
      text: 'Puppies Assisting Wounded Service Members',
      url: 'https://omhsp-paws-prod.powerappsportals.us/',
    },
    { text: 'QGenda', url: 'https://login.qgenda.com/' },
    {
      text: 'QuickSubmit',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=quicksubmit',
    },
    {
      text: 'Remote Order Entry System (ROES)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=roes',
    },
    {
      text: 'SourceTrack',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=smts',
    },
    {
      text: 'Sports4Vets for Certifying Officials and NVGAG Volunteers',
      url: 'https://www.my.va.gov/stipends4vets',
    },
    { text: 'Squares', url: 'https://www.my.vaemcc.va.gov/SQUARES' },
    {
      text: 'VA Caregiver Support',
      url:
        'https://www.va.gov/family-and-caregiver-benefits/health-and-disability/comprehensive-assistance-for-family-caregivers/',
    },
    {
      text: 'VA Loan Electronic Reporting Interface Reengineering (VALERI-R)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=valerir',
    },
    {
      text: 'VetBiz Portal (VetBiz)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=vetbiz',
    },
    {
      text: 'Veterans Benefits Management Platform (VBMS)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=bip',
    },
    {
      text: 'Veterans Identification Card (VIC)',
      url: 'https://www.va.gov/records/get-veteran-id-cards/vic/',
    },
    {
      text: 'Veterans Health Venture Studio',
      url: 'https://dvagov-vhventures-prod-portal.powerappsportals.us/',
    },
    { text: 'VTA IDES', url: 'https://www.my.vavet.va.gov/AccessVTA' },
    { text: 'VLogicFM', url: 'https://www.vlogicfm.us/' },
    {
      text: 'yourIT - Employee Self Service',
      url:
        'https://eauth.va.gov/accessva/?cspSelectFor=yourit&targetPath=/selfservice',
    },
  ],
};

// Staging URLs
const STAGING_LINKS = {
  veterans: [
    { text: 'Ask VA', url: 'https://www.va.gov/contact-us/ask-va/' },
    {
      text: 'Fiduciary Accountings Submission Tool (FAST)',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/FAST',
    },
    {
      text: 'Life Insurance Online Policy Access',
      url: 'https://sqa.eauth.va.gov/einsurance/PolicyAccess',
    },
    {
      text: 'Million Veteran Program (MVP)',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=https://mvp-reef-gc-qa.va-mvp.com/v3/saml_sso/access_va/metadata',
    },
    {
      text: 'QuickSubmit',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=https://test.digitization.gcio.com/va/upload/SP-Metadata.xml',
    },
    {
      text: 'Sports4Vets',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/Veterans',
    },
    {
      text: 'VA Life Insurance (VALife)',
      url: 'https://sqa.eauth.va.gov/einsurance/VALIFE',
    },
    {
      text: 'VetBiz Portal',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=https://vip-service-qa-external.devtest.vaec.va.gov/ssoapp/SSO/Metadata/vems',
    },
    {
      text: 'VetRide',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://staging-ssp.vetride.va.gov/saml2/service-provider-metadata/ssoe',
    },
    {
      text:
        'Veterans Exposure Team - Health Outcomes Military Exposures (VET-HOME)',
      url: 'https://vethome-qa.powerappsportals.us/',
    },
    {
      text: 'Veterans Health Venture Studio',
      url: 'https://dvagov-vhventures-test-portal.powerappsportals.us',
    },
    {
      text: 'Veterans Identification Card (VIC)',
      url: 'https://sqa.eauth.va.gov/VIC/accessVA',
    },
    {
      text: 'Veteran Travel Claim Entry',
      url: 'https://dvagov-btsss-qa.dynamics365portals.us',
    },
    {
      text: 'Veteran Health Identification Card (VHIC)',
      url: 'https://sqa.eauth.va.gov/vhic-ss/',
    },
  ],
  business: [
    { text: 'Ask VA', url: 'https://www.va.gov/contact-us/ask-va/' },
    {
      text: 'Veterans Benefits Management Platform (VBMS)',
      url: 'https://sqa.eauth.va.gov/BIP/vbmsp2',
    },
    {
      text: 'Box',
      url: 'https://sqa.eauth.va.gov/accessva/broker?PartnerId=box.net',
    },
    {
      text: 'Box High Impact',
      url: 'https://veteransaffairs-frhext-dev.account.box.com/',
    },
    {
      text: 'VA Caregiver Support',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/CARMAVendor',
    },
    {
      text: 'Community Care Referrals and Authorization (CCR&A)',
      url: 'https://sqa.eauth.va.gov/crmweb/ewebapp',
    },
    {
      text: 'Centralized Mail Portal',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=https://uatkeycloak.dmhscarec2test.com/realms/dmhs',
    },
    {
      text: 'Education Development Management System (EDMS)',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/DODLiaison',
    },
    {
      text: 'Fiduciary Accountings Submission Tool (FAST)',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/FAST',
    },
    {
      text: 'Homeless Management Information System (HMIS)',
      url: 'https://test.hmis.va.gov/',
    },
    {
      text: 'IAM Invitation Service',
      url: 'https://sqa.eauth.va.gov/IAMIIS/iam-iis-web/login.action',
    },
    {
      text: 'PCS Travel / moveLINQ Approver Portal',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://vatestapproversp.mlinqs.net',
    },
    {
      text: 'PCS Travel / moveLINQ Employee Portal',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://vatestemployeesp.mlinqs.net',
    },
    {
      text: 'PCS Travel / moveLINQ Expense Portal',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://vatestexpensesp.mlinqs.net',
    },
    {
      text: 'Kahua',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://prodil2launchdevx.kahua.com/sso',
    },
    {
      text: 'Life Insurance Online Policy Access',
      url: 'https://sqa.eauth.va.gov/einsurance/PolicyAccess',
    },
    {
      text: 'MCEQ Vendor Portal',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/MCEQVendorPortal',
    },
    {
      text: 'Million Veteran Program (MVP)',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=https://mvp-reef-gc-qa.va-mvp.com/v3/saml_sso/access_va/metadata',
    },
    {
      text: 'Grants4Vets',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/nvspsegrantee',
    },
    {
      text: 'Puppies Assisting Wounded Service Members',
      url: 'https://omhsp-paws-prod.powerappsportals.us/',
    },
    {
      text: 'ProjNet',
      url: 'https://sqa.eauth.va.gov/accessva/broker?PartnerId=projnet2.org',
    },
    {
      text: 'Prosthetics Vendor Portal',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/PVP',
    },
    {
      text: 'QGenda',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://app-training.qgenda.com/sso/saml2',
    },
    {
      text: 'QuickSubmit',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=https://test.digitization.gcio.com/va/upload/SP-Metadata.xml',
    },
    {
      text: 'Remote Order Entry System (ROES)',
      url: 'https://sqa.eauth.va.gov/ROESPKI/dalclanding.htm',
    },
    {
      text: 'Sports4Vets',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/Veterans',
    },
    {
      text: 'Sports4Vets for Certifying Officials and NVGAG Volunteers',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.int.va.gov/stipends4vets',
    },
    {
      text: 'SourceTrack',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=SMTS',
    },
    {
      text: 'Squares',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.my.vaemcc.int.va.gov/SQUARES',
    },
    {
      text: 'VA Loan Electronic Reporting Interface Reengineering (VALERI-R)',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://www.okta.com/saml2/service-provider/sppxozmprtzqusudsjkn',
    },
    {
      text: 'VAeDelivery',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://test.vaedelivery.gdit.com',
    },
    {
      text: 'Veteran Travel Claim Entry',
      url: 'https://dvagov-btsss-qa.dynamics365portals.us',
    },
    {
      text:
        'Veterans Exposure Team - Health Outcomes Military Exposures (VET-HOME)',
      url: 'https://vethome-qa.powerappsportals.us/',
    },
    {
      text: 'Veterans Health Venture Studio',
      url: 'https://dvagov-vhventures-test-portal.powerappsportals.us',
    },
    {
      text: 'Veterans Identification Card (VIC)',
      url: 'https://sqa.eauth.va.gov/VIC/accessVA',
    },
    { text: 'VTA IDES', url: 'https://sqa.eauth.va.gov/VTA2' },
    {
      text: 'VetBiz Portal (VetBiz)',
      url:
        'https://sqa.eauth.va.gov/isam/sps/saml20idp/saml20/logininitial?PartnerId=https://vip-service-qa-external.devtest.vaec.va.gov/ssoapp/SSO/Metadata/vems',
    },
    {
      text: 'VetRide',
      url:
        'https://sqa.eauth.va.gov/accessva/broker?PartnerId=https://staging-ssp.vetride.va.gov/saml2/service-provider-metadata/ssoe',
    },
    {
      text: 'Veteran Health Identification Card (VHIC)',
      url: 'https://sqa.eauth.va.gov/vhic-ss/',
    },
    {
      text: 'VLogicFM',
      url: 'https://sqa.eauth.va.gov/accessva/broker?PartnerId=VLFM_VA_SQASSOe',
    },
    {
      text: 'yourIT - Employee Self Service',
      url:
        'https://sqa.eauth.va.gov/accessva/?cspSelectFor=yourit&targetPath=/selfservice',
    },
  ],
};

/**
 * Determines if the current environment is staging based on the domain
 * @returns {boolean} True if staging environment
 */
function isStaging() {
  if (typeof window === 'undefined') return false;
  const { hostname } = window.location;
  return hostname.includes('staging');
}

/**
 * Gets the appropriate links based on the current environment
 * @returns {object} Links object with veterans and business arrays
 */
export function getAccessVALinks() {
  return isStaging() ? STAGING_LINKS : PRODUCTION_LINKS;
}

// Export default as production links for backwards compatibility
export const ACCESSVA_LINKS = PRODUCTION_LINKS;
