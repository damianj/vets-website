// Custom postal code error messages for address pages
export const POSTAL_CODE_ERROR_MESSAGES = {
  USA: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid 5-digit postal code',
  },
  CAN: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid 6-character postal code',
  },
  MEX: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid 5-digit postal code',
  },
  NONE: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid postal code',
  },
  OTHER: {
    required:
      "Please enter a postal code that meets your country's requirements. If your country doesn't require a postal code, enter NA.",
    pattern: 'Please enter a valid postal code',
  },
};

export const veteranFields = {
  parentObject: 'veteran',
  fullName: 'fullName',
  dateOfBirth: 'dateOfBirth',
  ssn: 'ssn',
  vaFileNumber: 'vaFileNumber',
  veteranServiceNumber: 'veteranServiceNumber',
  address: 'address',
  plannedAddress: 'plannedAddress',
  homePhone: 'homePhone',
  alternatePhone: 'alternatePhone',
  email: 'email',
  agreeToElectronicCorrespondence: 'agreeToElectronicCorrespondence',
};

export const applicationInfoFields = {
  parentObject: 'applicationInfo',
  branchOfService: 'branchOfService',
  activeDutyStatus: 'activeDutyStatus', // Veteran (false) vs Service member (true)
  currentlyOnActiveDuty: 'currentlyOnActiveDuty', // Are you currently on active duty? No (false) vs Yes (true)
  placeOfEntry: 'placeOfEntry',
  dateOfEntry: 'dateOfEntry',
  placeOfRelease: 'placeOfRelease',
  dateOfRelease: 'dateOfRelease',
  vaOfficeLocation: 'vaOfficeLocation',
  conveyanceType: 'conveyanceType',
  conveyanceTypeOther: 'conveyanceTypeOther',
  driverOrPassenger: 'driverOrPassenger',
  previouslyAppliedConveyance: 'previouslyAppliedConveyance',
  previouslyAppliedPlace: 'previouslyAppliedPlace',
  previouslyAppliedDate: 'previouslyAppliedDate',
  appliedDisabilityCompensation: 'appliedDisabilityCompensation',
  appliedDisabilityCompensationPlace: 'appliedDisabilityCompensationPlace',
  dateApplied: 'dateApplied',
};

export const DRIVER_OR_PASSENGER = {
  driver: 'I will be driving this vehicle',
  passenger: 'I will be the passenger only',
};

export const CONVEYANCE_TYPES = {
  automobile: 'Automobile',
  stationWagon: 'Station Wagon',
  van: 'Van',
  truck: 'Truck',
  other: 'Other (Specify)',
};

export const QUALIFYING_DISABILITIES = {
  lossOfFeet: 'Loss or permanent loss of use of one or both feet',
  lossOfHands: 'Loss or permanent loss of use of one or both hands',
  visionCentral:
    'Permanent impairment of vision in both eyes - central visual acuity of 20/200 or less in the better eye with corrective glasses',
  visionPeripheral:
    'Permanent impairment of vision in both eyes - peripheral visual field contracted to 20 degrees or less in the better eye',
  severeBurnInjury:
    'Severe burn injury: deep partial thickness or full thickness burns resulting in scar formation that cause contractures and limit motion of one or more extremities or the trunk and preclude effective operation of an automobile',
  als: 'Amyotrophic lateral sclerosis (ALS)',
};

export const qualifyingDisabilitiesFields = {
  parentObject: 'qualifyingDisabilities',
};

export const BRANCH_OF_SERVICE = {
  army: 'Army',
  navy: 'Navy',
  marineCorps: 'Marine Corps',
  airForce: 'Air Force',
  coastGuard: 'Coast Guard',
  spaceForce: 'Space Force',
  noaa: 'NOAA',
  usphs: 'USPHS',
};

export const FORM_21_4502 = {
  INTRODUCTION: {
    FORM_TITLE: 'Apply for automobile and adaptive equipment online',
    FORM_SUBTITLE:
      'Application For Automobile or Other Conveyance and Adaptive Equipment (Under 38 U.S.C. 3901-3904) (VA Form 21-4502)',
    INTRO:
      "Use VA Form 21-4502 if you're a Veteran or service member with certain service-connected disabilities and want to apply for benefits to help pay for a vehicle that meets your needs. This benefit can help you purchase a vehicle or other conveyance and approved adaptive equipment so you can drive or get in and out of the vehicle safely.",
    STEP_ELIGIBILITY_TITLE: 'Check your eligibility',
    STEP_ELIGIBILITY_INTRO:
      'If you’re a Veteran or service member with a service-connected disability resulting from an injury or disease incurred or aggravated during active military service, you may be eligible for this benefit.',
    STEP_ELIGIBILITY_CONDITION_INTRO:
      'At least one of these conditions must be true:',
    STEP_ELIGIBILITY_BULLETS: [
      'Loss or permanent loss of use of one or both hands, or',
      'Loss or permanent loss of use of one or both feet, or',
      'Severe burn injury causing scar formation that limits motion of one or more extremities or the trunk and prevents effective operation of an automobile, or',
      'Amyotrophic lateral sclerosis (ALS), or',
      'Permanent impairment of vision in both eyes that significantly limits your vision',
    ],
    STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_TITLE: 'Additional requirements',
    STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_INTRO:
      'If you meet the eligibility criteria, all of these must be true:',
    STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_BULLETS: [
      'You must receive VA approval before purchasing a vehicle or adaptive equipment, and',
      'You must answer all questions fully and accurately.',
    ],
    STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_FOOTER:
      'Veterans and service members may apply for automobile or adaptive equipment benefits under 38 U.S.C. 3901-3904.',
    STEP_ELIGIBILITY_VISION_TRIGGER: 'How we define vision impairment',
    STEP_ELIGIBILITY_VISION_INTRO:
      'Your vision meets this requirement if one of these is true, even when you use corrective glasses or lenses:',
    STEP_ELIGIBILITY_VISION_BODY: [
      'Central visual acuity of 20/200 or less in the better eye, or',
      'Central visual acuity of more than 20/200 if a visual field defect limits the widest diameter of visual field to 20 degrees or less in the better eye',
    ],
    STEP_GATHER_TITLE: 'Gather your information',
    STEP_GATHER_INTRO: "Here's what you'll need to apply:",
    STEP_GATHER_BULLETS: [
      {
        label: 'Your personal information',
        body:
          'This includes your name, date of birth, Social Security number or Military service number, and contact information.',
      },
      {
        label: 'Your service information',
        body:
          'This includes your branch of service, place and date you entered active duty, and place and date left active duty (if applicable).',
      },
      {
        label: 'Application information',
        body:
          'This includes type of vehicle you’re applying for and any previous VA automobile grants you may have received (if applicable).',
      },
    ],
    STEP_START_TITLE: 'Start your application',
    STEP_START_BODY:
      'We’ll take you through each step of the process. It should take about 15 minutes.',
    STEP_START_FOLLOWUP:
      'You can save your progress and return to this form later.',
    AUTH_START_FORM_TEXT: 'Start the application',
    SAVE_IN_PROGRESS_TEXT:
      'Please complete the 21-4502 form to apply for automobile or adaptive equipment compensation.',
  },
  PREVIOUS_VEHICLE_APPLICATION: {
    TITLE: 'Previous Vehicle Application',
    PAGE_DESCRIPTION:
      'Provide details about your previous application history for an automobile (for example car, truck or van)  or other conveyance (for example motor homes, commercial trucks, or farm machines, such as tractor, harvester, or combine).',
    QUESTION_PREVIOUSLY_APPLIED:
      'Have you previously applied for an automobile or other conveyance?',
    LABELS_PREVIOUSLY_APPLIED: {
      N: 'No',
      Y: 'Yes, (if yes, give date and place)',
    },
    ERROR_PREVIOUSLY_APPLIED:
      'Select either “Yes” or “No” to tell us if you have previously applied for VA disability benefits',
    TITLE_PREVIOUSLY_APPLIED_DATE: 'Previous vehicle application date',
    TITLE_PREVIOUSLY_APPLIED_PLACE: 'Previous vehicle application place',
    HINT_DATE: 'For example: January 19, 2022',
    ERROR_DATE_PATTERN: 'Please enter a valid date',
    ERROR_DATE_INCOMPLETE: 'Please enter a complete date',
    ERROR_DATE_REQUIRED:
      'Enter the date of your prior vehicle application, include the 4-digit year',
    ERROR_PLACE_REQUIRED:
      'Tell us where you submitted your previous vehicle application',
  },
  PERSONAL_INFO: {
    TITLE: 'Section I: Veteran or Service Member ID Information',
    PAGE_DESCRIPTION:
      'We need to collect some basic information about you first.',
    BASIC_INFO_HEADING: 'Basic Information',
    DATE_OF_BIRTH: 'Date of birth',
    ERROR_DOB_INCOMPLETE: 'Please enter a complete date',
    ERROR_FIRST_NAME: "Enter the Veteran or service member's first name",
    ERROR_LAST_NAME: "Enter the Veteran or service member's last name",
    ERROR_DOB_PATTERN: 'Please enter a valid date of birth',
    ERROR_DOB_REQUIRED:
      'Please provide the Veteran or service member’s date of birth, include the 4-digit year',
    ERROR_SSN_PATTERN:
      'Please enter a valid 9 digit Social Security number (dashes allowed)',
    ERROR_SSN_REQUIRED: "Please Enter the Veteran or service member's SSN",
    VA_FILE_NUMBER: 'VA file number (optional)',
    VETERAN_SERVICE_NUMBER: 'Veteran service number (optional)',
    FULL_NAME_LABELS: {
      'first or given name': 'First name',
      'middle name': 'Middle initial',
      'last or family name': 'Last name',
    },
  },
  CONTACT_INFO: {
    TITLE: 'Phone Number and Email Address',
    PAGE_DESCRIPTION: 'How can we reach you?',
    PRIMARY_PHONE: 'Primary telephone number',
    ALTERNATE_PHONE: 'Alternate or international phone number (if applicable)',
    ERROR_PHONE_REQUIRED:
      'Enter a valid United States of America phone number. Use 10 digits.',
    EMAIL: 'Email address',
    EMAIL_HINT:
      "We'll use this email address to confirm when we receive your form",
    ERROR_EMAIL:
      'Enter a valid email address without spaces using this format: email@domain.com',
    AGREE_ELECTRONIC:
      'I agree to receive electronic correspondence from VA about my claim.',
    ERROR_AGREE_EMAIL:
      'Enter an email address to receive electronic correspondence',
  },
  ADDRESS: {
    TITLE: 'Current Mailing Address',
    PAGE_DESCRIPTION:
      "This is where we'll mail important information about your claim.",
    MILITARY_CHECKBOX:
      'I live on a U.S. military base outside of the United States.',
    STREET: 'Street address',
    ERROR_STREET_REQUIRED:
      'Enter the Veteran or service member’s street address',
    STREET2: 'Apartment or unit number',
    CITY: 'City',
    STATE: 'State',
    POSTAL_CODE: 'Postal code',
  },
  PLANNED_ADDRESS: {
    TITLE: 'What is your planned address after release from active duty?',
    ERROR_STREET_REQUIRED: 'Enter the service member’s planned street address',
    STREET2: 'Apartment or unit number (optional)',
  },
  SERVICE_STATUS: {
    TITLE: 'Are you a Veteran or a service member?',
    QUESTION: 'Are you a Veteran or a service member?',
    LABELS: { N: 'I am a Veteran', Y: 'I am a service member' },
    ERROR: 'Please select your current service status',
  },
  APPLICATION_INFORMATION: {
    TITLE: 'Section II: Application Information',
    PAGE_DESCRIPTION:
      'We need information about your service record to evaluate your application.',
    BRANCH_OF_SERVICE: 'Branch of service',
    ERROR_BRANCH_OF_SERVICE: 'Please select your branch of service',
    PLACE_OF_ENTRY: 'Place of entry into active duty',
    ERROR_PLACE_OF_ENTRY: 'Please enter the place you entered into active duty',
    DATE_OF_ENTRY: 'Date of entry into active duty',
    HINT_DATE_OF_ENTRY: 'For example: Jan 19, 2022',
    ERROR_DATE_ENTRY_REQUIRED:
      'Please provide date of entry into active duty, include the 4-digit year',
    ERROR_DATE_ENTRY_INCOMPLETE: 'Please enter a complete date',
    ERROR_DATE_ENTRY_INVALID:
      'Please enter a valid date of entry into active duty',
  },
  CURRENT_SERVICE_STATUS: {
    TITLE: 'Your Current Service Status',
    QUESTION: 'Are you currently on active duty?',
    LABELS: { Y: 'Yes', N: 'No' },
    ERROR:
      'Select either “Yes” or “No” to indicate if you are currently on active duty',
  },
  VETERAN_STATUS_INFORMATION: {
    TITLE: 'Your Release From Active Duty',
    PLACE_OF_RELEASE: 'Place of release from active duty',
    ERROR_PLACE_OF_RELEASE:
      'Enter the city and state or base where you were released from active duty',
    DATE_OF_RELEASE: 'Date of release from active duty',
    HINT_DATE_OF_RELEASE: 'For example: January 19, 2022',
    ERROR_DATE_RELEASE_REQUIRED:
      'Please provide the date of release from active duty, include the 4-digit year',
    ERROR_DATE_RELEASE_INCOMPLETE: 'Please enter a complete date',
    ERROR_DATE_RELEASE_INVALID: 'Please enter a valid date',
  },
  VETERAN_DISABILITY_COMPENSATION: {
    TITLE: 'Your Disability Compensation Information',
    QUESTION_APPLIED:
      'Have you previously applied for VA disability compensation?',
    LABELS: { N: 'No', Y: 'Yes' },
    ERROR_APPLIED:
      'Select either "Yes" or "No" to tell us if you have previously applied for VA disability benefits',
    TITLE_IF_YES: 'If "Yes", specify name and place',
    ERROR_IF_YES:
      'Enter the name of the place where you applied for disability benefits',
    DATE_APPLIED: 'Date you applied',
    HINT_DATE_APPLIED: 'For example: January 19, 2022',
    ERROR_DATE_APPLIED_REQUIRED:
      'Enter the date you applied for disability benefits',
    ERROR_DATE_APPLIED_INCOMPLETE: 'Please enter a complete date',
    ERROR_DATE_APPLIED_INVALID: 'Please enter a valid date of birth',
    VA_OFFICE_LOCATION: 'Location of VA Office that has your file (if known)',
  },
  VEHICLE_DETAILS: {
    TITLE: 'Vehicle details',
    PAGE_DESCRIPTION:
      'Provide details about the automobile or conveyance (vehicle) you are applying for.',
    QUESTION_TYPE: 'Type of automobile or conveyance applied for?',
    ERROR_TYPE: 'Select the type of conveyance (vehicle) you are applying for',
    OTHER_SPECIFY:
      'If "Other", please specify (For example motor homes, commercial trucks, or farm machines, such as tractor, harvester, or combine)',
    ERROR_OTHER:
      'Please enter the type of motorized vehicle you are applying for',
  },
  VEHICLE_USE: {
    TITLE: 'Driver or Passenger',
    DESCRIPTION:
      'Let us know if you will be driving this vehicle or riding as a passenger only.',
    QUESTION: 'Will you be the driver or the passenger of this vehicle?',
    HINT:
      'Select "I will be driving this vehicle" if you will drive this vehicle at any time',
    ERROR:
      'Select whether you will drive the vehicle or only ever ride as a passenger',
    PASSENGER_ALERT:
      'Additional information for passengers will be provided by VBA.',
  },
  QUALIFYING_DISABILITIES: {
    TITLE: 'Your Service-Connected Disabilities',
    QUESTION:
      'Which of the qualifying service-connected disabilities do you have? (Select all that apply)',
    ERROR:
      'Select at least one qualifying service-connected disability to continue',
  },
  CERTIFICATION: {
    TITLE: 'Application Certification Statements, Legal Information',
    PAGE_DESCRIPTION:
      'Select the checkboxes to certify that you will obtain proper licensing to operate the vehicle, and VA has not previously paid an automobile grant on your behalf (or if 30 or more years have passed since the last grant).',
    PENALTY_HEADING: 'Penalty',
    PENALTY_TEXT:
      'The law provides severe penalties, which include fine or imprisonment or both, for the willful submission of any statement or evidence of a material fact, knowing it to be false, or for the fraudulent acceptance of any payment to which you are not entitled.',
    CERTIFY_LICENSING_TITLE:
      'I have read and understand the Application for Vehicle and Equipment Certification.',
    CERTIFY_LICENSING_HEADING:
      'Application for Conveyance and Equipment Certification',
    CERTIFY_LICENSING_DESCRIPTION:
      'I hereby apply for the conveyance selected and the equipment required because of my disability. I agree that before operating the vehicle I shall hereafter apply to the proper authority for the necessary license to operate it. If I am unable to qualify for a license, I certify that a person licensed to operate a similar vehicle in the state of my residence will operate the vehicle for me.',
    CERTIFY_NO_PRIOR_TITLE:
      'I have read and understand the Prior Certification for Automobile Grant or Adaptive Equipment.',
    CERTIFY_NO_PRIOR_HEADING:
      'Prior Certification for Automobile Grant or Adaptive Equipment',
    CERTIFY_NO_PRIOR_DESCRIPTION:
      'I further certify that VA has not previously paid an automobile grant on my behalf or that either (1) the automobile previously purchased with assistance was destroyed as a result of a natural or other disaster, or (2) it has been 30 or more years since my most recent automobile grant. I understand that I must contact my local Veterans Health Administration (VHA) Prosthetic and Sensory Aids Service prior to obtaining any (new or used) adaptive equipment and that VA may deny claims for payment or reimbursements if eligibility has not been established or has been terminated.',
    ERROR_LICENSING:
      'Select the checkbox to certify that you are applying for a vehicle because of your disability and the driver has a valid license.',
    ERROR_NO_PRIOR:
      'Select the checkbox to certify your eligibility for an automobile grant.',
  },
  COMMON: {
    ERROR_DATE_VALID: 'Please provide a valid date',
    HINT_DATE: 'For example: January 19, 2022',
  },
  ELIGIBILITY: {
    TITLE: 'Is this the form I need?',
    INTRO:
      'Use this form if you are a Veteran or service member with specific service-connected disabilities to apply for automobile or other transportation and adaptive equipment allowance under federal law. This benefit helps eligible Veterans and service members purchase a vehicle and obtain approved adaptive equipment needed to operate the vehicle safely.',
    ANSWER_QUESTIONS: 'Answer a few questions to get started.',
    QUESTION_VA_REACHED_OUT:
      'Has the VA reached out to you about this benefit?',
    HINT_VA_REACHED_OUT:
      'This form should be completed only by Veterans who have already been determined by the VA to be entitled to an automobile or adaptive equipment',
    OPTION_YES: 'Yes, I received communication from the VA about this benefit',
    OPTION_NO:
      'No, I have not received communication from the VA about this benefit',
    QUESTION_APPLYING_FOR: 'What benefit are you applying for?',
    OPTION_AUTOMOBILE: 'Financial assistance in purchasing an automobile',
    OPTION_ADAPTIVE_EQUIPMENT:
      'Financial assistance in purchasing approved adaptive equipment',
    SUMMARY_TITLE: 'Eligibility summary',
    YOUR_RESPONSES: 'Your responses:',
    REQUIREMENT_VA_REACHED_OUT: 'VA has reached out to you about this benefit',
    REQUIREMENT_AUTOMOBILE:
      'Applying for financial assistance to purchase an automobile (not adaptive equipment only)',
    NOT_ELIGIBLE_DISABILITY:
      'Based on your response, you may not currently eligible to complete ',
    NOT_ELIGIBLE_DISABILITY_EMPHASIS: 'VA Form 21-4502',
    NOT_ELIGIBLE_DISABILITY_AFTER:
      '. Confirm you have applied for service-connected disability benefits through the VA. Select the link to file for disability compensation with the VA.',
    LINK_DISABILITY_CLAIM:
      'File for disability compensation with VA Form 21-526EZ',
    OPENS_IN_NEW_TAB: '(opens in a new tab)',
    NOT_ELIGIBLE_ADAPTIVE:
      'If you are applying for financial assistance in purchasing adaptive equipment only for a vehicle you already own, complete VA Form 10-1394 (Application for Adaptive Equipment - Motor Vehicle).',
    LINK_FORM_10_1394: 'VA Form 10-1394',
    ELIGIBLE_AUTOMOBILE_BEFORE:
      "Based on your responses, you'll file for an automobile or other conveyance using ",
    ELIGIBLE_AUTOMOBILE_AFTER: '.',
    ALREADY_KNOW_TITLE: 'Already know this is the right form?',
    ALREADY_KNOW_DESCRIPTION:
      'If you know VA Form 21-4502 is correct, or if you were directed to complete this application, you can continue without answering the questions above.',
    CONTINUE: 'Continue',
    REQUIREMENT_MET: 'Requirement met: ',
    REQUIREMENT_NOT_MET: 'Requirement not met: ',
    FORM_10_1394_URL: 'https://www.va.gov/forms/10-1394/',
    DISABILITY_CLAIM_URL:
      'https://www.va.gov/disability/file-disability-claim-form-21-526ez/introduction',
  },
  FORM_CONFIG: {
    TITLE:
      'Application for Automobile or Other Conveyance and Adaptive Equipment (UNDER 38 U.S.C. 3901-3904) (VA 21-4502)',
    SUB_TITLE: 'Please complete this form as accurately as you can.',
    CHAPTER_ELIGIBILITY: 'Is this the form I need?',
    CHAPTER_VETERAN_ID: 'Section I: Basic information',
    CHAPTER_CONTACT: 'Section I: Contact information',
    CHAPTER_ADDRESS: 'Section I: Mailing address',
    CHAPTER_SERVICE_STATUS: 'Section I: Current service status',
    CHAPTER_APPLICATION: 'Section II: Application and service information',
    CHAPTER_QUALIFYING: 'Section II: Qualifying disabilities',
    CHAPTER_SERVICE_RECORD: 'Section II: Service record',
    CHAPTER_CONVEYANCE: 'Section II: Type of vehicle',
    CHAPTER_VEHICLE_USE: 'Section II: Vehicle Use',
    CHAPTER_PREVIOUS_VEHICLE: 'Section II: Vehicle Application History',
    CHAPTER_CERTIFICATION: 'Section II: Required certifications',
    PAGE_PERSONAL_INFO: 'Section I: Veteran or Service Member ID Information',
    PAGE_CONTACT: 'Phone Number and Email Address',
    PAGE_ADDRESS: 'Current Mailing Address',
    PAGE_SERVICE_STATUS: 'Are you a Veteran or a service member?',
    PAGE_PLANNED_ADDRESS: "Section I: Service member's planned address",
    PAGE_APPLICATION_INFO: 'Branch of service',
    PAGE_QUALIFYING: 'Your Service-Connected Disabilities',
    PAGE_CURRENT_SERVICE: 'Your Current Service Status',
    PAGE_VETERAN_STATUS: 'Your Release From Active Duty',
    PAGE_DISABILITY: 'Your Disability Compensation Information',
    PAGE_VEHICLE_DETAILS: 'Vehicle details',
    PAGE_VEHICLE_USE: 'Driver or Passenger',
    PAGE_PREVIOUS_VEHICLE: 'Previous Vehicle Application',
    PAGE_CERTIFICATION:
      'Application Certification Statements, Legal Information',
  },
};
