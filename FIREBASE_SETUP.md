# Firebase Setup Instructions

Follow these steps to set up Firebase for your Birthday Perks Tracker:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project "bdayperkstracker"
4. Follow the setup wizard to complete project creation

## 2. Set Up Firestore Database

1. In your Firebase project, go to the left sidebar and click "Firestore Database"
2. Click "Create database"
3. Start in test mode (allows read/write access without authentication)
4. Choose a location closest to your target users
5. Click "Enable"

## 3. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) near the top left, then "Project settings"
2. Go to the "General" tab, scroll down to "Your apps" section
3. Click the "</>" icon to add a web app
4. Register your app with the name "Birthday Perks Tracker"
5. Copy the Firebase configuration object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "xxx",
  authDomain: "bdayperkstracker.firebaseapp.com",
  projectId: "bdayperkstracker",
  storageBucket: "bdayperkstracker.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
};
```

## 4. Update Your .env.local File

1. Open the `.env.local` file in your project
2. Replace the placeholder values with your actual Firebase configuration values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bdayperkstracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bdayperkstracker
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bdayperkstracker.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
```

## 5. Deploy Firestore Rules (Optional)

If you want to deploy the included Firestore security rules:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init`
4. Select "Firestore" when prompted for features
5. Select your project
6. When asked about rules file, use the default `firestore.rules`
7. Deploy the rules: `firebase deploy --only firestore:rules`

## 6. Test Your Connection

1. Start your application: `npm run dev`
2. Try adding a new redemption
3. Check your Firestore Database in the Firebase Console to see if the data was saved correctly

Now your application should be properly connected to Firebase and able to store data in Firestore! 