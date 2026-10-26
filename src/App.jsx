import { useState } from "react";

function App() {
  const [activePage, setActivePage] = useState("Overview");

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
            <p className="text-xs text-slate-500">Room Booking System</p>
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
          <h3 className="font-semibold text-slate-800">Plan your day</h3>
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

        {activePage === "Overview" ? (
          <>
            {/* Booking Section */}
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
                    defaultValue="Meeting Room A"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    <option>Meeting Room A</option>
                    <option>Meeting Room B</option>
                    <option>Meeting Room C</option>
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>
            </section>

            {/* Availability Section */}
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Available time slots
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose a time for your meeting.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Check availability
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  "09:00 - 10:00",
                  "10:00 - 11:00",
                  "11:00 - 12:00",
                  "12:00 - 13:00",
                  "13:00 - 14:00",
                  "14:00 - 15:00",
                  "15:00 - 16:00",
                  "16:00 - 17:00",
                ].map((slot) => (
                  <button
                    key={slot}
                    disabled
                    title="Availability will be connected to the backend in the next step."
                    className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm font-medium text-slate-400"
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Time slots will become selectable once the backend is connected.
              </p>
            </section>

            {/* Reservations Section */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Your reservations
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your confirmed meeting room bookings will appear here.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                  ▤
                </div>

                <p className="font-semibold text-slate-700">
                  No reservations to display yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your bookings will appear here once you make a reservation.
                </p>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              My Reservations
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your reservation management view will be completed when we
              connect the booking API.
            </p>
          </section>
        )}

        <footer className="py-8 text-center text-xs text-slate-400">
          ReserveSpace &copy; {new Date().getFullYear()} · Meeting room booking made simple
        </footer>
      </main>
    </div>
  );
}

export default App;
