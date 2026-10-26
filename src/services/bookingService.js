const API_BASE_URL = "http://localhost:5000/api";

// Fetch available time slots for a room on a selected date
export async function getAvailableSlots(date, resource) {
  const params = new URLSearchParams({
    date,
    resource,
  });

  const response = await fetch(
    `${API_BASE_URL}/slots?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch available slots.");
  }

  return data;
}

// Create a new booking
export async function createBooking(bookingDetails) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingDetails),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create booking.");
  }

  return data;
}

// Fetch confirmed bookings for a selected date and room
export async function getBookingsByDateAndResource(date, resource) {
  const params = new URLSearchParams({
    date,
    resource,
  });

  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(date)}/${encodeURIComponent(resource)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch bookings.");
  }

  return data;
}

// Cancel a booking using its unique ID
export async function cancelBooking(bookingId) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to cancel booking.");
  }

  return data;
}

