# ReserveSpace — Meeting Room Booking System

ReserveSpace is a responsive meeting room booking application that allows users to view available meeting rooms, select a date and time, make reservations, and manage existing bookings through a simple and user-friendly interface.

The frontend was developed using React and Tailwind CSS and communicates with a Node.js and Express backend through REST API endpoints.

## Features

* **Interactive Dashboard:** A clean and responsive interface for navigating the booking system.
* **Meeting Room Selection:** Choose between Meeting Room A, Meeting Room B, and Meeting Room C.
* **Date Selection:** Select today or a future date for a meeting.
* **Real-Time Availability:** Retrieve available time slots from the backend API.
* **Create Reservations:** Submit a booking with the user's name, email address, selected room, date, and time.
* **Reservation Management:** View existing reservations for a selected room and date.
* **Cancel Reservations:** Cancel a reservation and make the time slot available again.
* **Form Validation and Error Handling:** Display feedback when a booking cannot be completed, including when a time slot is no longer available.
* **Responsive Design:** A layout designed to work across desktop, tablet, and mobile screen sizes.

## Technologies Used

* React — building reusable user interface components.
* JavaScript — application logic and API integration.
* Tailwind CSS — responsive styling and visual design.
* Vite — development server and build tool.
* Fetch API — communicating with the backend REST API.
* Node.js and Express — backend services used by the frontend.

## Project Structure

The frontend project is organised into the following main files and directories:

```text
booking-reservation-frontend/
├── public/
├── src/
│   ├── services/
│   │   └── bookingService.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### Important Files

| File                             | Description                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.jsx`                    | Contains the main application interface, booking form, room selection, available time slots, and reservation management functionality. |
| `src/services/bookingService.js` | Contains functions for communicating with the backend API.                                                                             |
| `src/index.css`                  | Contains global styling and base design settings.                                                                                      |
| `src/main.jsx`                   | Entry point that renders the React application.                                                                                        |
| `vite.config.js`                 | Configures Vite and the Tailwind CSS integration.                                                                                      |
| `package.json`                   | Defines project dependencies and development scripts.                                                                                  |

## Getting Started

Follow the instructions below to run the frontend locally.

### Prerequisites

Ensure that you have the following installed:

* Node.js
* npm
* Git
* Visual Studio Code or another code editor
* The ReserveSpace backend repository

### 1. Clone the Repository

Clone the frontend repository from GitHub:

```bash
git clone https://github.com/bonolokeletsophasha-ai/booking-reservation-frontend.git
```

### 2. Navigate to the Project Directory

```bash
cd booking-reservation-frontend
```

### 3. Install Dependencies

Install the required project dependencies:

```bash
npm install
```

### 4. Start the Development Server

Run the following command:

```bash
npm run dev
```

Vite will display a local development URL in the terminal. Open that URL in your browser to access ReserveSpace.

The default Vite development address is:

```text
http://localhost:5173
```

Keep the terminal running while using the application.

## Backend Integration

ReserveSpace communicates with a separate backend application that handles booking operations and availability checks.

The frontend API service is located at:

```text
src/services/bookingService.js
```

The service uses the following local API base URL:

```text
http://localhost:5000/api
```

Make sure the backend server is running before testing the booking functionality.

### API Endpoints Used

| Method   | Endpoint                                                 | Purpose                                                      |
| -------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `GET`    | `/api/slots?date=YYYY-MM-DD&resource=Meeting%20Room%20A` | Retrieves available time slots for a selected date and room. |
| `POST`   | `/api/bookings`                                          | Creates a new reservation.                                   |
| `GET`    | `/api/bookings/:date/:resource`                          | Retrieves reservations for a selected date and room.         |
| `DELETE` | `/api/bookings/:id`                                      | Cancels an existing reservation.                             |

The backend validates booking information and prevents conflicting reservations.

**Important:** The backend currently uses in-memory storage. Reservations are therefore temporary and are cleared when the backend server restarts.

## Available Scripts

The following npm scripts are available:

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Starts the Vite development server.               |
| `npm run build`   | Builds the frontend for production.               |
| `npm run preview` | Previews the production build locally.            |
| `npm run lint`    | Runs ESLint to check the project for code issues. |

To create a production build, run:

```bash
npm run build
```

Vite generates the production files in the `dist` directory.

## User Workflow

The typical booking process is:

1. Open the ReserveSpace dashboard.
2. Select one of the available meeting rooms.
3. Choose a reservation date.
4. Select an available time slot.
5. Enter your name and email address.
6. Submit the reservation.
7. View the confirmed reservation in the reservation section.
8. Cancel the reservation if it is no longer required.

When a reservation is successfully created, the selected time slot is removed from the available slots returned by the backend. When a reservation is cancelled, the slot becomes available again.

## Design

ReserveSpace uses a modern interface with a cohesive colour palette:

* Indigo and violet for primary actions and branding.
* Lavender for backgrounds and supporting surfaces.
* Mint green for selected details and positive visual indicators.
* Coral for decorative accents.

The interface uses responsive layouts, interactive buttons, clear feedback messages, and consistent styling to make the booking process straightforward.

## Future Improvements

Potential enhancements include:

* User authentication and account management.
* Persistent database storage.
* Reservation history across multiple dates.
* Email confirmations and booking reminders.
* Administrative tools for managing meeting rooms.
* Deployment of the frontend and backend to production hosting platforms.

## Author

Developed as a meeting room booking system project, with a React frontend and a separate Node.js and Express backend.



