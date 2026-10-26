import { useEffect, useState } from "react";
import {
  getAvailableSlots,
  createBooking,
  getBookingsByDateAndResource,
  cancelBooking,
} from "./services/bookingService.js";

const rooms = [
  "Meeting Room A",
  "Meeting Room B",
  "Meeting Room C",
];

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const endHour = (hours + 1) % 24;

  return `${time} - ${String(endHour).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}

function App() {
  const [activePage, setActivePage] = useState("Overview");

  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedTime, setSelectedTime] = useState("");

  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load available slots whenever the selected room or date changes.
  useEffect(() => {
    if (!selectedDate || !selectedRoom) return;

    let ignore = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setError("");
      setSelectedTime("");

      try {
        const data = await getAvailableSlots(
          selectedDate,
          selectedRoom
        );

        if (!ignore) {
          setAvailableSlots(data.availableSlots);
        }
      } catch (err) {
        if (!ignore) {
          setAvailableSlots([]);
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      ignore = true;
    };
  }, [selectedDate, selectedRoom]);

  // Load confirmed reservations for the selected room and date.
  async function loadBookings() {
    if (!selectedDate || !selectedRoom) return;

    setLoadingBookings(true);

    try {
      const data = await getBookingsByDateAndResource(
        selectedDate,
        selectedRoom
      );

      setBookings(data.bookings);
    } catch (err) {
      setBookings([]);
      setError(err.message);
    } finally {
      setLoadingBookings(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [selectedDate, selectedRoom]);

  // Submit a new reservation.
  async function handleBookingSubmit(event) {
    event.preventDefault();

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and an available time slot.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data = await createBooking({
        name,
        email,
        date: selectedDate,
        resource: selectedRoom,
        time: selectedTime,
      });

      setSuccess(data.message);
      setName("");
      setEmail("");
      setSelectedTime("");

      // Refresh availability and reservations after booking.
      const [slotsData, bookingsData] = await Promise.all([
        getAvailableSlots(selectedDate, selectedRoom),
        getBookingsByDateAndResource(selectedDate, selectedRoom),
      ]);

      setAvailableSlots(slotsData.availableSlots);
      setBookings(bookingsData.bookings);
    } catch (err) {
      setError(err.message);

      // Refresh availability if another user booked the slot first.
      try {
        const data = await getAvailableSlots(
          selectedDate,
          selectedRoom
        );

        setAvailableSlots(data.availableSlots);
      } catch {
        setAvailableSlots([]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Cancel a confirmed reservation.
  async function handleCancelBooking(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const data = await cancelBooking(id);

      setSuccess(data.message);

      const [slotsData, bookingsData] = await Promise.all([
        getAvailableSlots(selectedDate, selectedRoom),
        getBookingsByDateAndResource(selectedDate, selectedRoom),
      ]);

      setAvailableSlots(slotsData.availableSlots);
      setBookings(bookingsData.bookings);
    } catch (err) {
      setError(err.message);
    }
  }

  const navigation = [
    { name: "Overview", icon: "⌂" },
    { name: "My Reservations", icon: "▤" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* Sidebar */}
      <aside className="w-full border-b border-slate-200 bg-white p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white">
            R
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              ReserveSpace
            </h1>
            <p className="text-xs text-slate-500">
              Room Booking System
            </p>
          </div>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                activePage === item.name
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-10 rounded-2xl bg-violet-50 p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg">
            ✦
          </div>

          <h3 className="font-semibold text-slate-800">
            Plan your day
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Find a room and reserve a time that works for you.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-violet-600">
              YOUR WORKSPACE
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {activePage === "Overview"
                ? "Book a Meeting Room"
                : "My Reservations"}
            </h2>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Find the perfect space for your next meeting.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 sm:self-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
              U
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Workspace User
              </p>
              <p className="text-xs text-slate-500">Member</p>
            </div>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-violet-600 p-6 text-white sm:p-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-medium text-violet-200">
              WELCOME TO RESERVESPACE
            </p>

            <h3 className="text-2xl font-bold sm:text-3xl">
              Make room for great ideas.
            </h3>

            <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
              Book meeting rooms in just a few clicks. Choose your room,
              select a date, and find a time that suits your team.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("booking-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Make a reservation
            </button>
          </div>
        </section>

        {/* Feedback Messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        {activePage === "Overview" ? (
          <>
            {/* Room and Date Selection */}
            <section
              id="booking-section"
              className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Find your space
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select a meeting room and your preferred date.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="room"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Meeting room
                  </label>

                  <select
                    id="room"
                    value={selectedRoom}
                    onChange={(event) => {
                      setSelectedRoom(event.target.value);
                      setSuccess("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    {rooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Reservation date
                  </label>

                  <input
                    id="date"
                    type="date"
                    min={getToday()}
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setSuccess("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>
            </section>

            {/* Available Time Slots */}
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Available time slots
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Choose a time for your meeting.
                </p>
              </div>

              {loadingSlots ? (
                <p className="py-6 text-sm text-slate-500">
                  Checking room availability...
                </p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedTime(slot);
                        setError("");
                        setSuccess("");
                      }}
                      aria-pressed={selectedTime === slot}
                      className={`rounded-xl border px-3 py-4 text-sm font-medium transition ${
                        selectedTime === slot
                          ? "border-violet-600 bg-violet-600 text-white shadow-md"
                          : "border-slate-200 bg-white text-slate-700 hover:border-violet-400 hover:bg-violet-50"
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                  <p className="font-semibold text-slate-700">
                    No available slots
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose another date or meeting room.
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-400">
                Available times are retrieved directly from the booking server.
              </p>
            </section>

            {/* Booking Form */}
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Complete your reservation
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your details to confirm your meeting room booking.
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Booking summary
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    Room: {selectedRoom}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Date: {selectedDate || "Not selected"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Time:{" "}
                    {selectedTime
                      ? formatTime(selectedTime)
                      : "Please select a time slot"}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!selectedTime || submitting || loadingSlots}
                  className="w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                >
                  {submitting ? "Confirming booking..." : "Confirm reservation"}
                </button>
              </form>
            </section>

            {/* Reservations List */}
            <ReservationsSection
              bookings={bookings}
              loading={loadingBookings}
              onCancel={handleCancelBooking}
            />
          </>
        ) : (
          <ReservationsSection
            bookings={bookings}
            loading={loadingBookings}
            onCancel={handleCancelBooking}
            showFilters
            selectedRoom={selectedRoom}
            selectedDate={selectedDate}
            setSelectedRoom={setSelectedRoom}
            setSelectedDate={setSelectedDate}
          />
        )}

        <footer className="py-8 text-center text-xs text-slate-400">
          ReserveSpace &copy; {new Date().getFullYear()} · Meeting room
          booking made simple
        </footer>
      </main>
    </div>
  );
}

function ReservationsSection({
  bookings,
  loading,
  onCancel,
  showFilters = false,
  selectedRoom,
  selectedDate,
  setSelectedRoom,
  setSelectedDate,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">
          My Reservations
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Confirmed bookings for the selected meeting room and date.
        </p>
      </div>

      {showFilters && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reservationRoom"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Meeting room
            </label>

            <select
              id="reservationRoom"
              value={selectedRoom}
              onChange={(event) => setSelectedRoom(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reservationDate"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Reservation date
            </label>

            <input
              id="reservationDate"
              type="date"
              min={getToday()}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-6 text-sm text-slate-500">
          Loading reservations...
        </p>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
            ▤
          </div>

          <p className="font-semibold text-slate-700">
            No reservations to display
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Confirmed bookings for this room and date will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h4 className="font-semibold text-slate-900">
                  {booking.name}
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  {booking.email}
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {booking.resource} · {booking.date} ·{" "}
                  {formatTime(booking.time)}
                </p>

                <span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                  {booking.status}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onCancel(booking.id)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Cancel reservation
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default App;