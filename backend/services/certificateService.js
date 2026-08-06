function formatDate(value) {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function generateCertificate(registration) {
  const event = registration?.eventId || {};
  const attendeeName = registration?.name || 'Attendee';
  const eventTitle = event.title || 'Event';
  const eventDate = formatDate(event.startTime || event.date || registration?.createdAt);

  return [
    'Certificate of Attendance',
    `Name: ${attendeeName}`,
    `Event: ${eventTitle}`,
    `Date: ${eventDate}`,
    '',
    'This placeholder certificate confirms the attendee completed the locked registration, check-in, and feedback flow.',
  ].join('\n');
}

module.exports = { generateCertificate };