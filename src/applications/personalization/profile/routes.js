import {
  PROFILE_OLD_PATHS,
  PROFILE_PATHS,
  PROFILE_PATH_NAMES,
} from './constants';
import { Edit } from './components/edit/Edit';
import { getRoutesForNav } from './routesForNav';
import ProfileHub from './components/hub/ProfileHub';
import ContactMethodWrapper from './components/health-care-settings/sub-tasks/ContactMethodWrapper';
import AppointmentTimesWrapper from './components/health-care-settings/sub-tasks/AppointmentTimesWrapper';
import ContactTimesWrapper from './components/health-care-settings/sub-tasks/ContactTimesWrapper';

export const getRedirectedRoutes = () => [
  {
    old: PROFILE_OLD_PATHS.SERVICE_HISTORY_INFORMATION,
    new: PROFILE_PATHS.SERVICE_HISTORY_INFORMATION,
  },
  {
    old: PROFILE_OLD_PATHS.DIRECT_DEPOSIT,
    new: PROFILE_PATHS.DIRECT_DEPOSIT,
  },
  {
    old: PROFILE_OLD_PATHS.HEALTH_CARE_CONTACTS,
    new: PROFILE_PATHS.DEPENDENTS_AND_CONTACTS,
  },
  {
    old: PROFILE_OLD_PATHS.ACCREDITED_REPRESENTATIVE,
    new: PROFILE_PATHS.ACCREDITED_REPRESENTATIVE,
  },
  {
    old: PROFILE_OLD_PATHS.VETERAN_STATUS_CARD,
    new: PROFILE_PATHS.VETERAN_STATUS_CARD,
  },
  {
    old: PROFILE_OLD_PATHS.CONNECTED_APPLICATIONS,
    new: PROFILE_PATHS.CONNECTED_APPLICATIONS,
  },
  {
    old: PROFILE_OLD_PATHS.MESSAGES_SIGNATURE,
    new: PROFILE_PATHS.MESSAGES_SIGNATURE,
  },
];

const getRoutes = (
  {
    profileHealthCareSettingsPage = false,
    profileHideHealthCareContacts = false,
  } = {
    profileHealthCareSettingsPage: false,
    profileHideHealthCareContacts: false,
  },
) => {
  return [
    ...getRoutesForNav({
      profileHealthCareSettingsPage,
      profileHideHealthCareContacts,
    }),
    {
      component: Edit,
      name: PROFILE_PATH_NAMES.EDIT,
      path: PROFILE_PATHS.EDIT,
      requiresLOA3: true,
      requiresMVI: true,
      requiresSchedulingPreferencesPilot: false,
    },
    {
      component: ProfileHub,
      name: PROFILE_PATH_NAMES.PROFILE_ROOT,
      path: PROFILE_PATHS.PROFILE_ROOT,
      requiresLOA3: true,
      requiresMVI: true,
      requiresSchedulingPreferencesPilot: false,
    },
    {
      component: ContactMethodWrapper,
      name: PROFILE_PATH_NAMES.SCHEDULING_PREF_CONTACT_METHOD,
      path: PROFILE_PATHS.SCHEDULING_PREF_CONTACT_METHOD,
      requiresLOA3: true,
      requiresMVI: true,
      requiresSchedulingPreferencesPilot: true,
    },
    {
      component: ContactTimesWrapper,
      name: PROFILE_PATH_NAMES.SCHEDULING_PREF_CONTACT_TIME,
      path: PROFILE_PATHS.SCHEDULING_PREF_CONTACT_TIMES,
      requiresLOA3: true,
      requiresMVI: true,
      requiresSchedulingPreferencesPilot: true,
    },
    {
      component: AppointmentTimesWrapper,
      name: PROFILE_PATH_NAMES.SCHEDULING_PREF_APPOINTMENT_TIME,
      path: PROFILE_PATHS.SCHEDULING_PREF_APPOINTMENT_TIMES,
      requiresLOA3: true,
      requiresMVI: true,
      requiresSchedulingPreferencesPilot: true,
    },
  ];
};

export default getRoutes;
