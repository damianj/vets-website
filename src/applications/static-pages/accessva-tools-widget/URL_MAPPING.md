# AccessVA Tools Widget - URL Mapping

> **Note**: URLs in this widget are updated regularly. This document represents a snapshot at the time of last update. The actual URLs are maintained in `AccessVALinks.js`.

## Updating URLs

To update service URLs:
1. Edit `AccessVALinks.js` to add/remove/modify links in the `ACCESSVA_LINKS` constant
2. No code changes needed elsewhere - tests are flexible
3. Update this document for reference (optional)
4. Submit PR with changes

## Current URL List

All URLs extracted from AccessVA links.pdf and applied to the widget.

## Veterans Services

1. **AskVA**
   - https://www.va.gov/contact-us/ask-va/

2. **Fiduciary Accountings Submission Tool (FAST)**
   - https://eauth.va.gov/accessva/?cspSelectFor=https%3A//www.my.va.gov/FAST&ForceAuthn=false

3. **Life Insurance Online Policy Access**
   - https://eauth.va.gov/accessva/?cspSelectFor=einsurance

4. **Million Veteran Program (MVP)**
   - https://eauth.va.gov/accessva/?cspSelectFor=mvp

5. **QuickSubmit**
   - https://eauth.va.gov/accessva/?cspSelectFor=quicksubmit

6. **Sports4Vets**
   - https://eauth.va.gov/accessva/?cspSelectFor=https%3A//www.my.va.gov/Veterans&ForceAuthn=false

7. **VA Life Insurance (VALife)**
   - https://www.va.gov/life-insurance/options-eligibility/valife/

8. **VetBiz Portal**
   - https://eauth.va.gov/accessva/?cspSelectFor=vetbiz

9. **VetRide**
   - https://www.vetride.va.gov/app/home

10. **Veterans Exposure Team - Health Outcomes Military Exposures (VET-HOME)**
    - https://vethome.va.gov/

11. **Veterans Health Venture Studio**
    - https://dvagov-vhventures-prod-portal.powerappsportals.us/

12. **Veterans Identification Card (VIC)**
    - https://www.va.gov/records/get-veteran-id-cards/vic/

13. **Veteran Travel Claim Entry**
    - https://www.va.gov/health-care/file-travel-pay-reimbursement/

14. **Veteran Health Identification Card (VHIC)**
    - https://www.va.gov/health-care/get-health-id-card/

## Business Services

1. **AskVA**
   - https://www.va.gov/contact-us/ask-va/

2. **Box**
   - https://eauth.va.gov/accessva/?cspSelectFor=box

3. **Box High Impact**
   - https://veteransaffairs-frhext.box.com/

4. **Centralized Mail Portal**
   - https://eauth.va.gov/accessva/?cspSelectFor=dmhs

5. **Community Care Referrals and Authorization (CCR&A)**
   - https://eauth.va.gov/accessva/?cspSelectFor=ccra

6. **Education Development Management System (EDMS)**
   - https://www.my.va.gov/DODLiaison

7. **Fiduciary Accountings Submission Tool (FAST)**
   - https://www.my.va.gov/FAST

8. **Financial Services Center PCS Travel iMOVE Approver Portal**
   - https://imove-approver.mlinqsonline.net/

9. **Financial Services Center PCS Travel iMOVE Employee Portal**
   - https://imove-employee.mlinqsonline.net/

10. **Gen3 Data Commons**
    - https://va.data-commons.org/login

11. **Grants4Vets**
    - https://www.my.va.gov/nvspsegrantee

12. **Homeless Management Information System (HMIS)**
    - https://www.hmisrepository.va.gov/

13. **IAM Invitation Service**
    - https://eauth.va.gov/accessva/?cspSelectFor=iamiis

14. **Kahua**
    - https://launch.kahuafn.com/web/

15. **ProjNet**
    - https://projnet2.org/

16. **Prosthetics Vendor Portal**
    - https://www.my.va.gov/PVP

17. **Puppies Assisting Wounded Service Members**
    - https://omhsp-paws-prod.powerappsportals.us/

18. **QGenda**
    - https://login.qgenda.com/

19. **QuickSubmit**
    - https://eauth.va.gov/accessva/?cspSelectFor=quicksubmit

20. **Remote Order Entry System (ROES)**
    - https://eauth.va.gov/accessva/?cspSelectFor=roes

21. **Stakeholder Enterprise Portal (SEP)**
    - https://eauth.va.gov/accessva/?cspSelectFor=sep

22. **SourceTrack**
    - https://eauth.va.gov/accessva/?cspSelectFor=smts

23. **Sports4Vets for Certifying Officials and NVGAG Volunteers**
    - https://www.my.va.gov/stipends4vets

24. **Squares**
    - https://www.my.vaemcc.va.gov/SQUARES

25. **VA Caregiver Support**
    - https://www.va.gov/family-and-caregiver-benefits/health-and-disability/comprehensive-assistance-for-family-caregivers/

26. **VA Loan Electronic Reporting Interface Reengineering (VALERI-R)**
    - https://eauth.va.gov/accessva/?cspSelectFor=valerir

27. **VetBiz Portal (VetBiz)**
    - https://eauth.va.gov/accessva/?cspSelectFor=vetbiz

28. **Veterans Benefits Management Platform (VBMS)**
    - https://eauth.va.gov/accessva/?cspSelectFor=bip

29. **Veterans Identification Card (VIC)**
    - https://www.va.gov/records/get-veteran-id-cards/vic/

30. **Veterans Health Venture Studio**
    - https://dvagov-vhventures-prod-portal.powerappsportals.us/

31. **Veterans Re-Entry Search Service (VRSS)**
    - https://vrss.va.gov/

32. **VTA IDES**
    - https://www.my.vavet.va.gov/AccessVTA

33. **VLogicFM**
    - https://www.vlogicfm.us/

34. **yourIT**
    - https://eauth.va.gov/accessva/?cspSelectFor=yourit&targetPath=/selfservice

---

**Total: 50 services with production URLs**
- 14 Veterans services
- 36 Business services

**Date Updated:** $(Get-Date -Format "yyyy-MM-dd")

**Source:** AccessVA links.pdf

**Widget Status:** ✅ Fully portable, no external dependencies
- No Redux
- No feature flags
- No dynamic API calls
- Static URLs only
- Ready for PR deployment
