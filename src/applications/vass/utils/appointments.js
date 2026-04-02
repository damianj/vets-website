/**
 * @typedef {Object} Topic
 * @property {string} [topicId] - Unique identifier for the topic
 * @property {string} [topicName] - Display name of the topic
 * @property {string} [skillId] - Unique identifier for the topic (legacy) will be removed in the future
 * @property {string} [skillName] - Display name of the topic (legacy) will be removed in the future
 */

/**
 * @typedef {Object} Appointment
 * @property {string} appointmentId - Unique identifier for the appointment
 * @property {string} startUtc - Start date/time in ISO 8601 format (UTC)
 * @property {string} endUtc - End date/time in ISO 8601 format (UTC)
 * @property {string} agentId - Unique identifier for the assigned agent
 * @property {string} agentNickname - Display name of the assigned agent
 * @property {number} appointmentStatusCode - Numeric status code (e.g., 1 = Active)
 * @property {string} appointmentStatus - Human-readable status (e.g., 'Active')
 * @property {number} schedulerStatusCode - Numeric scheduler status code (e.g., 1 = Scheduled)
 * @property {string} schedulerStatus - Human-readable scheduler status (e.g., 'Scheduled')
 * @property {string} [cancelledStartUtc] - Original start date/time before cancellation in ISO 8601 format (UTC)
 * @property {string} [cancelledEndUtc] - Original end date/time before cancellation in ISO 8601 format (UTC)
 * @property {string} cohortStartUtc - Cohort start date/time in ISO 8601 format (UTC)
 * @property {string} cohortEndUtc - Cohort end date/time in ISO 8601 format (UTC)
 * @property {Topic[]} [topics] - Optional array of topics for the appointment
 */

/**
 * Normalizes appointment topics from the `skillId`/`skillName` format
 * to the canonical `topicId`/`topicName` format. When the backend migrates
 * to `topicId`/`topicName`, this function can be removed.
 * @param {Appointment} appointment - Raw appointment response from the API
 * @returns {Appointment} Appointment with normalized topic fields
 */
function normalizeAppointmentTopics(appointment) {
  if (!appointment?.topics?.length) return appointment;
  return {
    ...appointment,
    topics: appointment.topics.map(topic => ({
      topicId: topic.topicId || topic.skillId,
      topicName: topic.topicName || topic.skillName,
    })),
  };
}

/**
 * Creates a mock appointment data object for testing purposes.
 * @param {Partial<Appointment>} [appointmentData={}] - Optional partial appointment data to override defaults
 * @returns {Appointment} A complete appointment object with default values merged with overrides
 */
function createAppointmentData(appointmentData = {}) {
  return {
    appointmentId: 'abcdef123456',
    topics: [
      {
        topicId: 'f264b072-f910-f111-8407-001dd80e4366',
        topicName: 'Compensation',
      },
      {
        topicId: '2e3493a8-f910-f111-8407-001dd80e4366',
        topicName: 'General VA Benefits',
      },
    ],
    startUtc: '2025-12-24T10:00:00Z',
    endUtc: '2025-12-24T10:30:00Z',
    agentId: '353dd0fc-335b-ef11-bfe3-001dd80a9f48',
    agentNickname: 'Bill Brasky',
    appointmentStatusCode: 1,
    appointmentStatus: 'Active',
    schedulerStatusCode: 1,
    schedulerStatus: 'Scheduled',
    cancelledStartUtc: '2025-12-24T10:00:00Z',
    cancelledEndUtc: '2025-12-24T10:30:00Z',
    cohortStartUtc: '2025-12-01T00:00:00Z',
    cohortEndUtc: '2026-02-28T23:59:59Z',
    ...appointmentData,
  };
}

/**
 * Creates RTK Query cache state with a pre-populated appointment.
 * Use this to mock the getAppointment query result.
 *
 * @param {string} appointmentId - The appointment ID to use in the cache key
 * @param {Object} appointmentData - The appointment data to cache (use createMockAppointmentData)
 * @returns {Object} RTK Query state object for vassApi
 *
 * @example
 * const vassApiState = createVassApiStateWithAppointment('123', createMockAppointmentData({ appointmentId: '123' }));
 * const options = getDefaultRenderOptions({}, { vassApi: vassApiState });
 */
function createVassApiStateWithAppointment(appointmentId, appointmentData) {
  return {
    queries: {
      [`getAppointment({"appointmentId":"${appointmentId}"})`]: {
        status: 'fulfilled',
        endpointName: 'getAppointment',
        requestId: 'test',
        startedTimeStamp: 0,
        data: { ...appointmentData, appointmentId },
      },
    },
    mutations: {},
    provided: {},
    subscriptions: {},
    config: {
      online: true,
      focused: true,
      middlewareRegistered: true,
    },
  };
}

module.exports = {
  normalizeAppointmentTopics,
  createAppointmentData,
  createVassApiStateWithAppointment,
};
