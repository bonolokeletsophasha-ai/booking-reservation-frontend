import { useCallback,useEffect, useState } from "react";
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
  const loadBookings = useCallback(async () => {
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
  }, [selectedDate, selectedRoom]);

  useEffect(() => {
  loadBookings();
}, [loadBookings]);

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
    <div className="min-h-screen bg-[#F0EDFF] text-[#202044] md:flex">
      {/* Sidebar */}
     <aside className="w-full border-b border-violet-200 bg-gradient-to-b from-[#E8E3FF] to-[#F0EDFF] p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-10 flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#5145CD] via-violet-600 to-[#7C3AED] shadow-lg shadow-violet-300/60">
            {/* Decorative logo detail */}
            <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full border-4 border-white/20" />

            {/* Doorway symbol */}
            <svg
             viewBox="0 0 48 48"
             fill="none"
             xmlns="http://www.w3.org/2000/svg"
             className="relative h-8 w-8"
             aria-label="ReserveSpace logo"
             role="img"
            >
            <path
              d="M10 39V12C10 9.8 11.8 8 14 8H29C31.2 8 33 9.8 33 12V39"
              stroke="#D7F8E8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M17 39V17H33V39"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M33 18L39 12L33 6"
              stroke="#FF8066"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle cx="27" cy="29" r="1.8" fill="#D7F8E8" />
          </svg>
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

          <div className="flex items-center gap-3 self-start rounded-xl border border-violet-100 bg-[#FAF9FF] px-4 py-3 shadow-sm sm:self-auto">
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

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#5145CD] via-violet-600 to-[#7C3AED] p-6 text-white shadow-xl shadow-violet-200/60 sm:p-8 lg:p-10">
          {/* Decorative background shapes */}
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[30px] border-white/10" />

           <div className="pointer-events-none absolute right-24 top-28 h-20 w-20 rounded-full bg-[#FF8066]/30 blur-xl" />

            <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-10 translate-y-10 rounded-full bg-white/10" />

              <div className="relative z-10 max-w-2xl">
               <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-widest text-violet-100 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#D7F8E8]" />
                   WELCOME TO RESERVESPACE
                </span>


               <h3 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Make room for{" "}
               <span className="text-[#D7F8E8]">great ideas.</span>
               </h3>

             <p className="mt-4 max-w-lg text-sm leading-7 text-violet-100 sm:text-base">
              Great meetings start with the right space. Find your perfect room,
              choose a time that works for your team, and get straight to what matters.
             </p>

            <button
              onClick={() =>
              document
              .getElementById("booking-section")
              ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#5145CD] shadow-lg shadow-indigo-950/10 transition duration-300 hover:-translate-y-1 hover:bg-[#D7F8E8] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">

                 Make a reservation
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
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
              className="mb-8 rounded-3xl border border-violet-100 bg-[#FAF9FF] p-5 shadow-sm shadow-violet-200/40 sm:p-7"
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {rooms.map((room, index) => {
                const isSelected = selectedRoom === room;


                const roomDetails = [
                  {
                    icon: "🪴",
                    description: "A comfortable space for team meetings.",
                    accent: "bg-emerald-100",
                  },
                  {
                    icon: "💡",
                    description: "A bright space for creative thinking.",
                    accent: "bg-amber-100",
                  },
                  {
                    icon: "🚀",
                    description: "A focused space for big ideas.",
                    accent: "bg-rose-100",
                  },
                ];

                const details = roomDetails[index] || roomDetails[0];

                  return (
                    <button
                     key={room}
                     type="button"
                     onClick={() => {
                        setSelectedRoom(room);
                        setSuccess("");
                 }}
                   aria-pressed={isSelected}
                   className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                   isSelected
                   ? "border-[#5145CD] bg-[#F7F5FF] shadow-md shadow-violet-100"
                   : "border-slate-100 bg-white hover:border-violet-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${details.accent}`}>
                    {details.icon}
                  </div>

                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition ${
                       isSelected
                       ? "border-[#5145CD] bg-[#5145CD] text-white"
                       : "border-slate-200 text-transparent group-hover:border-violet-300"
                 }`}
              >
                 ✓
                </span>
              </div>

              <h4 className="mt-4 font-bold text-[#202044]">{room}</h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {details.description}
              </p>

              {isSelected && (
                <span className="mt-3 inline-block rounded-full bg-[#D7F8E8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                 Selected
                </span>
             )}
          </button>
         );


        })}

        </div>

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

            <section className="mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/50 sm:p-7">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D7F8E8] text-lg">
                       ◷
                    </span>


                    <h3 className="text-lg font-extrabold text-[#202044]">
                       Available time slots
                    </h3>
                  </div>

                    <p className="mt-2 text-sm text-slate-500">
                       Choose a time that works best for your meeting.
                    </p>
                </div>

                {!loadingSlots && availableSlots.length > 0 && (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#D7F8E8] px-3 py-2 text-xs font-bold text-emerald-800">
                     <span className="h-2 w-2 rounded-full bg-emerald-500" />
                     {availableSlots.length} {availableSlots.length === 1 ? "slot" : "slots"} available
                     </span>
                )}


              </div>

              {loadingSlots ? ( 
                <div className="flex items-center justify-center gap-3 rounded-2xl bg-[#F7F5FF] px-4 py-10"> 
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-[#5145CD]" />

                    <p className="text-sm font-medium text-slate-600">
                       Checking room availability...
                    </p>
                </div>


              ) : availableSlots.length > 0 ? ( 
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
               {availableSlots.map((slot) => {
const isSelected = selectedTime === slot;


    return (
      <button
        key={slot}
        type="button"
        onClick={() => {
          setSelectedTime(slot);
          setError("");
          setSuccess("");
        }}
        aria-pressed={isSelected}
        className={`group relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5145CD] ${
          isSelected
            ? "border-[#5145CD] bg-[#5145CD] text-white shadow-lg shadow-violet-200"
            : "border-slate-100 bg-slate-50/70 text-[#202044] hover:border-[#5145CD]/40 hover:bg-[#F7F5FF]"
        }`}
      >
        <span
          className={`text-lg transition-transform duration-200 group-hover:scale-105 ${
            isSelected ? "text-white" : "text-[#5145CD]"
          }`}
        >
          {formatTime(slot)}
        </span>

        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isSelected ? "text-violet-100" : "text-emerald-700"
          }`}
        >
          {isSelected ? "Selected" : "Available"}
        </span>

        {isSelected && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs text-white">
            ✓
          </span>
        )}
      </button>
    );
             })}
              </div>


              ) : ( <div className="rounded-2xl border border-dashed border-violet-200 bg-[#F7F5FF]/70 px-4 py-10 text-center"> <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                     ◷ </div>

                       <p className="mt-4 font-bold text-[#202044]">
                        No available slots
                        </p>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                          All times for this room are booked on your selected date. Try another
                          date or choose a different meeting room.
                        </p>
                    </div>


                  )}

                  <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4">
                     <span className="mt-0.5 text-sm text-[#5145CD]">ⓘ</span>


                      <p className="text-xs leading-5 text-slate-500">
                          Availability is retrieved from the booking server and updates when
                           reservations are made or cancelled.
                      </p>


                  </div>
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
                     className="mb-2 block text-sm font-bold text-[#202044]"
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
                    className="w-full rounded-xl border border-violet-100 bg-[#F7F5FF] px-4 py-3.5 text-sm text-[#202044] placeholder:text-slate-400 transition duration-200 hover:border-violet-300 focus:border-[#5145CD] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100"
                  />


                </div>

                <div>
                  <label
                     htmlFor="email"
                     className="mb-2 block text-sm font-bold text-[#202044]"
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
                    className="w-full rounded-xl border border-violet-100 bg-[#F7F5FF] px-4 py-3.5 text-sm text-[#202044] placeholder:text-slate-400 transition duration-200 hover:border-violet-300 focus:border-[#5145CD] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100"
                  />


                </div>

                {/* Booking Summary */}

                <div className="overflow-hidden rounded-2xl border border-violet-100 bg-[#F7F5FF]">
                  <div className="flex items-center gap-3 border-b border-violet-100 px-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                      📋
                    </div>


                    <div>
                      <h4 className="font-extrabold text-[#202044]">
                        Booking summary
                      </h4>

                      <p className="mt-0.5 text-xs text-slate-500">
                          Review your meeting details
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">Meeting room</span>

                        <span className="text-right text-sm font-bold text-[#202044]">
                         {selectedRoom}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">Date</span>

                      <span className="text-right text-sm font-semibold text-[#202044]">
                         {selectedDate || "Not selected"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">Meeting time</span>

                      <span
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                          selectedTime
                          ? "bg-[#D7F8E8] text-emerald-800"
                          : "bg-white text-slate-500"
                        }`}
                      >
                      {selectedTime
                       ? formatTime(selectedTime)
                       : "Select a time slot"}
                      </span>
                    </div>
                  </div>


                </div>

                {/* Confirm Reservation */}
                <button
                  type="submit"
                  disabled={!selectedTime || submitting || loadingSlots}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#5145CD] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5145CD] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none sm:w-auto"

                >

                {submitting ? "Confirming reservation..." : "Confirm reservation"}



                {!submitting && (
                  <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
                      →
                  </span>
                )}


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
<section className="overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/50 sm:p-7">
{/* Section heading */} 
<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"> 
  <div> 
    <div className="flex items-center gap-3"> 
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D7F8E8] text-xl">
          ▤ 
      </span>


        <div>
          <h3 className="text-lg font-extrabold text-[#202044]">
            My Reservations
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Keep track of your upcoming meetings.
          </p>
        </div>
      </div>
    </div>

    {!loading && bookings.length > 0 && (
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F7F5FF] px-3 py-2 text-xs font-bold text-[#5145CD]">
        <span className="h-2 w-2 rounded-full bg-[#5145CD]" />
        {bookings.length}{" "}
        {bookings.length === 1 ? "reservation" : "reservations"}
      </span>
    )}
  </div>

  {/* Room and date filters */}
  {showFilters && (
    <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-violet-100 bg-[#F7F5FF]/70 p-4 sm:grid-cols-2">
      {/* Meeting Room Filter */}
      <div className="flex flex-col">
        <label
          htmlFor="reservationRoom"
          className="mb-2 flex h-8 items-center text-sm font-bold text-[#202044]"
        >
          Meeting room
        </label>

        <select
          id="reservationRoom"
          value={selectedRoom}
          onChange={(event) => setSelectedRoom(event.target.value)}
          className="h-[50px] w-full rounded-xl border border-violet-100 bg-white px-4 text-sm font-medium text-[#202044] transition hover:border-violet-300 focus:border-[#5145CD] focus:outline-none focus:ring-4 focus:ring-violet-100"
        >
        {rooms.map((room) => (
          <option key={room} value={room}>
           {room}
          </option>
        ))}
      </select>
    </div>

    {/* Reservation Date Filter */}
    <div className="flex flex-col">
      <label
        htmlFor="reservationDate"
        className="mb-2 flex h-8 items-center text-sm font-bold text-[#202044]"
      >
        Reservation date
      </label>

      <input
        id="reservationDate"
        type="date"
        min={getToday()}
        value={selectedDate}
        onChange={(event) => setSelectedDate(event.target.value)}
        className="h-[50px] w-full rounded-xl border border-violet-100 bg-white px-4 text-sm font-medium text-[#202044] transition hover:border-violet-300 focus:border-[#5145CD] focus:outline-none focus:ring-4 focus:ring-violet-100"
      />
    </div>
  </div>
  )}

  {/* Loading state */}
  {loading ? (
    <div className="flex items-center justify-center gap-3 rounded-2xl bg-[#F7F5FF] px-4 py-10">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-[#5145CD]" />

      <p className="text-sm font-medium text-slate-600">
        Loading reservations...
      </p>
    </div>
  ) : bookings.length === 0 ? (
    /* Empty state */
    <div className="rounded-2xl border border-dashed border-violet-200 bg-[#F7F5FF]/60 px-4 py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
        🗓️
      </div>

      <h4 className="mt-4 font-bold text-[#202044]">
        No reservations yet
      </h4>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        There are no confirmed bookings for this meeting room and date.
        Try another date or room, or make a new reservation.
      </p>
    </div>
  ) : (
    /* Reservation cards */
    <div className="space-y-4">
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="group rounded-2xl border border-violet-100 bg-[#FAF9FF] p-4 transition duration-200 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5FF] text-xl transition group-hover:bg-[#D7F8E8]">
                👤
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="break-words font-extrabold text-[#202044]">
                    {booking.name}
                  </h4>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7F8E8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {booking.status}
                  </span>
                </div>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {booking.email}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F7F5FF] px-2.5 py-2 text-xs font-semibold text-[#5145CD]">
                    <span>▤</span>
                    {booking.resource}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600">
                    <span>📅</span>
                    {booking.date}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600">
                    <span>◷</span>
                    {formatTime(booking.time)}
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => onCancel(booking.id)} 
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-600 transition duration-200 hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:self-center" > 
              <span aria-hidden="true">×</span>
               Cancel reservation 
            </button>
          </div> 
        </article> 
      ))} 
    </div> 
  )} 
</section>
);
}


export default App;