# BuddyBoard - Pet Services Marketplace

BuddyBoard is a full-stack web application that connects pet owners with verified service providers for pet boarding, daycare, and grooming services.

## Features

- User authentication (Customers, Service Providers, Admin)
- Service provider profiles with availability calendars
- Service search and filtering
- Booking system
- Review and rating system
- Admin dashboard for provider verification

## Tech Stack

- Frontend: Next.js 14, TypeScript, TailwindCSS
- Backend: Firebase (Authentication, Firestore, Storage)
- State Management: React Context
- UI Components: Headless UI, Hero Icons
- Form Handling: React Hook Form, Yup
- Notifications: React Hot Toast

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/buddyboard.git
   cd buddyboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── lib/             # Firebase configuration and utilities
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
└── styles/          # Global styles and Tailwind configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 