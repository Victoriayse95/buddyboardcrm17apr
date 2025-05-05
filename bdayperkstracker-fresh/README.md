# Birthday Perks Tracker

A web application to track and manage birthday perks and promotions from various businesses.

## Features

- 🎁 Track birthday perks and special offers in one place
- 📅 Organize perks by month and redemption dates
- 🔔 Get notifications for upcoming and expiring perks
- 📱 Responsive design for desktop and mobile
- ✏️ Edit all fields directly in the tables
- 🔍 Search and filter functionality for easy access

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Firebase (Firestore)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/bdayperkstracker.git
cd bdayperkstracker
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bdayperkstracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bdayperkstracker
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bdayperkstracker.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up Firebase Authentication (if needed)
4. Update the `.env.local` file with your project's configuration

### Vercel Deployment

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com/) and create a new project
3. Connect your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Environment variables: Add all Firebase variables from your `.env.local` file
5. Deploy

## Usage

### Add New Redemption

1. Navigate to "Add New Redemption" in the navigation bar
2. Fill in the redemption details (month, dates, name, perks, etc.)
3. Submit the form

### View Current Month Redemptions

1. Visit the homepage to see all perks valid for the current month
2. Mark perks as "Redeemed" when used
3. Keep track of perks that are expiring soon

### Manage All Redemptions

1. Go to "All Redemptions" page to see all perks
2. Use search, sort, and filter options to find specific perks
3. Edit any field by clicking on it
4. Delete perks with the trash icon

## License

MIT

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Heroicons](https://heroicons.com/) 