#  Youdealt - Mental Wellness & Goal Tracking Platform

A modern Vue 3 web application designed to help users achieve mental wellness through goal tracking, therapy exploration, mindfulness support, and achievement tracking. This project combines beautiful UI with powerful backend features to create a supportive environment for personal growth.

##  Features

-  **Goal Tracking** - Set, track, and achieve your wellness goals
-  **Dashboard** - Visual analytics of your progress and achievements
-  **Map View** - Discover local therapy and wellness resources
-  **User Ratings** - Community feedback and recommendations
-  **Secure Authentication** - Firebase-based user authentication
- **Responsive Design** - Works seamlessly on desktop and mobile
-  **Real-time Database** - Firestore integration for instant data updates
-  **Email Notifications** - EmailJS integration for alerts and confirmations

##  Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Styling**: Bootstrap 5 + Custom CSS
- **Maps**: Mapbox GL
- **UI Components**: PrimeVue, Vuetify
- **Charts**: Chart.js
- **Backend**: Express.js with Firebase Cloud Functions
- **Email Service**: EmailJS

##  Prerequisites

- **Node.js**: v20.19.0 or v22.12.0+
- **npm**: v9+
- **Firebase Account**: Free tier available at [firebase.google.com](https://firebase.google.com)
- **Git**: For version control

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Youdealt.git
cd Youdealt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase Credentials
Create a `.env` file in the root directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

## Project Structure

```
Youdealt/
├── src/
│   ├── components/       # Reusable Vue components
│   ├── views/           # Page components
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia store (state management)
│   ├── assets/          # Images, styles
│   ├── firebaseConfig.js # Firebase initialization
│   ├── App.vue          # Root component
│   └── main.js          # Entry point
├── functions/           # Firebase Cloud Functions
├── public/              # Static assets
├── vite.config.js       # Vite configuration
├── firebase.json        # Firebase hosting config
└── package.json         # Dependencies
```

##  Free Deployment Options

### Option 1: Firebase Hosting + Firestore (Recommended for Firebase projects)

**Advantages**: Built-in integration, free tier included, simple deployment

**Steps**:
1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project named "youdealt"
   - Enable Firestore Database (Free tier)
   - Enable Authentication methods (Email/Password, Google)

2. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

4. **Initialize Firebase**:
   ```bash
   firebase init
   ```

5. **Build the Project**:
   ```bash
   npm run build
   ```

6. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy
   ```

Your app will be live at: `https://youdealt.firebaseapp.com`

---

### Option 2: Netlify + Firebase (Easiest for Beginners)

**Advantages**: Drag-and-drop deployment, automatic previews, free SSL

**Steps**:
1. **Build the Project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub account
   - Click "New site from Git"
   - Select your repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click Deploy

3. **Add Environment Variables** in Netlify:
   - Go to Site Settings → Build & Deploy → Environment
   - Add your Firebase credentials as variables

Your app will be live at: `https://your-site-name.netlify.app`

---

### Option 3: Vercel + Firebase (Alternative Deployment)

**Advantages**: Better performance, edge functions, similar to Netlify

**Steps**:
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Confirm project name
   - Confirm build settings
   - Add environment variables when prompted

Your app will be live at: `https://your-project.vercel.app`

---

### Option 4: Railway.app + PostgreSQL (Alternative Database Option)

**Advantages**: Free tier with $5 monthly credit, PostgreSQL alternative to Firestore, easy scaling

**For this option, you'd need to**:
1. Replace Firestore with PostgreSQL
2. Install `pg` package: `npm install pg`
3. Create `src/database.js` for PostgreSQL connection

**Note**: Only use this if you want to migrate away from Firebase.

---

##  Environment Variables Guide

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_FIREBASE_API_KEY` | Public API key | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | Firebase Console → Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | Firebase Console → Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | Firebase Console → Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | Firebase Console → Project Settings |
| `VITE_FIREBASE_APP_ID` | App ID | Firebase Console → Project Settings |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics ID | Firebase Console → Project Settings |

## 📊 Firestore Setup Guide

### 1. Enable Firestore Database
- Firebase Console → Create Database
- Start in test mode (change security rules later)
- Choose region closest to your users

### 2. Create Collections
```
users/
  - uid
    - email
    - displayName
    - createdAt

goals/
  - goalId
    - userId
    - title
    - description
    - status
    - createdAt
    - completedAt

ratings/
  - ratingId
    - userId
    - rating
    - feedback
    - createdAt
```

### 3. Set Security Rules
Go to Firestore → Rules and update:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /goals/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /ratings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

##  Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Create Firebase project
- [ ] Add environment variables
- [ ] Run locally (`npm run dev`)
- [ ] Build project (`npm run build`)
- [ ] Deploy to hosting platform
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and analytics

##  Troubleshooting

### Issue: "Cannot find module 'firebase'"
```bash
npm install firebase
```

### Issue: Environment variables not loading
- Restart dev server after adding `.env` file
- Ensure variables start with `VITE_`

### Issue: Firestore connection errors
- Check Firebase credentials in `.env`
- Verify Firestore Database is enabled in Firebase Console
- Check security rules allow your operations

### Issue: Deployment fails
- Ensure `dist` folder is generated: `npm run build`
- Check all dependencies are in `package.json`
- Verify environment variables are set on hosting platform

##  Useful Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Guide](https://vitejs.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)

## Cost Estimates

| Service | Free Tier | When You Need to Upgrade |
|---------|-----------|--------------------------|
| Firebase Hosting | 1GB storage, 10GB bandwidth | Exceeding bandwidth limits |
| Firestore | 1GB storage, 50k reads/day | Exceeding read/write limits |
| Netlify | 100 GB bandwidth/month | Enterprise features |
| Vercel | 100GB bandwidth/month | Advanced analytics |

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Author

Your Name - [@yourhandle](https://twitter.com/yourhandle)

##  Acknowledgments

- Vue.js team for the amazing framework
- Firebase for backend services
- PrimeVue for UI components
- Community contributors

---