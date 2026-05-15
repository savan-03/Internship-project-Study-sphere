# StudySphere Project Structure

## Root

- `FRONTEND/`
  React + Vite client application.
- `BACKEND/`
  Express + MongoDB API server.
- `PROJECT_STRUCTURE.md`
  High-level structure and module map.

## Frontend

### App Shell

- `FRONTEND/src/App.jsx`
  Main router, auth guards, admin shell, and module route wiring.
- `FRONTEND/src/main.jsx`
  Vite entry point.

### Shared Context + API Layer

- `FRONTEND/src/components/context/Axiosinstance.js`
  Shared Axios client and auth token wiring.
- `FRONTEND/src/components/context/AuthContext.jsx`
  Login state and authenticated user state.
- `FRONTEND/src/components/context/DsaContext.jsx`
  DSA problems, attempts, stats, and execution state.
- `FRONTEND/src/components/context/ResourceContext.jsx`
  Resource library, uploads, bookmarks, reviews, comments, collections.
- `FRONTEND/src/components/context/GamificationContext.jsx`
  Leaderboard, badges, points, and challenge state.
- `FRONTEND/src/components/context/NotificationsContext.jsx`
  In-app notification state and preferences.
- `FRONTEND/src/components/context/*.service.js`
  Module-specific API wrappers for `auth`, `ai`, `analytics`, `dsa`, `gamification`, `notifications`, and `social`.

### Layout

- `FRONTEND/src/components/layout/PublicNavbar.jsx`
  Public-site navigation.
- `FRONTEND/src/components/layout/AuthenticatedSidebar.jsx`
  Logged-in sidebar navigation.
- `FRONTEND/src/components/layout/Footer.jsx`
  Shared footer.

### Pages by Module

#### Core / Account

- `FRONTEND/src/auth/Loginpage.jsx`
- `FRONTEND/src/PAGES/Dashboard.jsx`
- `FRONTEND/src/PAGES/Settings.jsx`
- `FRONTEND/src/PAGES/UserProfilePage.jsx`
- `FRONTEND/src/PAGES/AdminProfilePage.jsx`
- `FRONTEND/src/PAGES/ModeratorProfilePage.jsx`
- `FRONTEND/src/components/resources/ProfileWizard.jsx`

#### Resource Sharing

- `FRONTEND/src/PAGES/ResourceLibrary.jsx`
- `FRONTEND/src/PAGES/ResourceDetail.jsx`
- `FRONTEND/src/PAGES/ResourceMyUploads.jsx`
- `FRONTEND/src/PAGES/ResourceSaved.jsx`
- `FRONTEND/src/PAGES/ResourceCollections.jsx`
- `FRONTEND/src/PAGES/ResourceCollectionDetail.jsx`
- `FRONTEND/src/PAGES/ResourceReviewsPage.jsx`
- `FRONTEND/src/PAGES/ResourceVerificationPage.jsx`
- `FRONTEND/src/components/resources/UploadResource.jsx`
- `FRONTEND/src/components/resources/UploadProgress.jsx`
- `FRONTEND/src/components/resources/ResourceCard.jsx`
- `FRONTEND/src/components/resources/ResourceFilters.jsx`
- `FRONTEND/src/components/resources/ResourceModuleNav.jsx`

#### DSA Practice

- `FRONTEND/src/PAGES/DsaPractice.jsx`
- `FRONTEND/src/PAGES/DsaProblemWorkbench.jsx`
- `FRONTEND/src/PAGES/DsaAttempts.jsx`

#### AI

- `FRONTEND/src/PAGES/AIHub.jsx`
- `FRONTEND/src/PAGES/AiQuizPage.jsx`
- `FRONTEND/src/PAGES/AiInterviewPage.jsx`
- `FRONTEND/src/PAGES/AiAssistantPage.jsx`

#### Social / Collaboration

- `FRONTEND/src/PAGES/SocialHub.jsx`
- `FRONTEND/src/PAGES/GroupsPage.jsx`
- `FRONTEND/src/PAGES/ForumsPage.jsx`
- `FRONTEND/src/PAGES/SocialChatPage.jsx`

#### Admin

- `FRONTEND/src/components/Admin/Pages/AdminDashboard.jsx`
- `FRONTEND/src/components/Admin/Pages/AdminUsers.jsx`
- `FRONTEND/src/components/Admin/Pages/AdminResources.jsx`
- `FRONTEND/src/components/Admin/Pages/AdminAnalytics.jsx`
- `FRONTEND/src/components/Admin/Pages/AdminSettings.jsx`
- `FRONTEND/src/components/Admin/context/AdminContext.jsx`

## Backend

### Entry + Wiring

- `BACKEND/server.js`
  Server bootstrap.
- `BACKEND/src/app.js`
  Express app, middleware, and route mounting.
- `BACKEND/src/db/db.js`
  MongoDB connection.

### Routes

- `BACKEND/src/routes/auth.routes.js`
- `BACKEND/src/routes/admin.routes.js`
- `BACKEND/src/routes/dsa.routes.js`
- `BACKEND/src/routes/ai.routes.js`
- `BACKEND/src/routes/social.routes.js`
- `BACKEND/src/routes/analytics.routes.js`
- `BACKEND/src/routes/gamification.routes.js`
- `BACKEND/src/routes/notification.routes.js`

### Controllers

- `BACKEND/src/controllers/auth.controller.js`
  Auth, profile update, current user, public profile summary.
- `BACKEND/src/controllers/admin.controller.js`
  Resource APIs, moderation, admin dashboards, collections, reviews, comments.
- `BACKEND/src/controllers/dsa.controller.js`
  DSA problems, attempts, execution, stats.
- `BACKEND/src/controllers/ai.controller.js`
  Quiz, interview, and assistant flows.
- `BACKEND/src/controllers/social.controller.js`
  Feed, follow, groups, forums, mentorship.

### Models by Module

#### Account / Core

- `BACKEND/src/models/user.model.js`
- `BACKEND/src/models/notification.model.js`

#### Resource Sharing

- `BACKEND/src/models/file.model.js`
- `BACKEND/src/models/admin.model.js`

#### DSA

- `BACKEND/src/models/dsa-problem.model.js`
- `BACKEND/src/models/dsa-attempt.model.js`

#### Social

- `BACKEND/src/models/community-group.model.js`
- `BACKEND/src/models/forum-thread.model.js`
- `BACKEND/src/models/mentorship-request.model.js`
- `BACKEND/src/models/direct-conversation.model.js`

#### AI / Other

- `BACKEND/src/models/ai-session.model.js`
- `BACKEND/src/models/badge.model.js`
- `BACKEND/src/models/audit-log.model.js`

### Services

- `BACKEND/src/services/activity.service.js`
- `BACKEND/src/services/analytics.service.js`
- `BACKEND/src/services/notification.service.js`
- `BACKEND/src/services/dsa.service.js`
- `BACKEND/src/services/dsa-judge.service.js`
- `BACKEND/src/services/ai-provider.service.js`
- `BACKEND/src/services/storage.service.js`

## Current Module Ownership

- `Auth + Profiles`
  `auth.controller.js`, `AuthContext.jsx`, `UserProfilePage.jsx`, `Settings.jsx`
- `Resources`
  `admin.controller.js`, `ResourceContext.jsx`, resource pages/components
- `DSA`
  `dsa.controller.js`, `dsa.service.js`, `DsaContext.jsx`, DSA pages
- `Social`
  `social.controller.js`, `Social.service.js`, social pages
- `AI`
  `ai.controller.js`, `AI.service.js`, AI pages
- `Gamification`
  `gamification.controller.js`, `GamificationContext.jsx`, `Leaderboard.jsx`
- `Notifications`
  `notification.controller.js`, `NotificationsContext.jsx`, `Notifications.jsx`

## Recommended Working Order

1. Stabilize routing and page-to-API wiring.
2. Keep each module using one context/service entrypoint.
3. Keep all page files in `FRONTEND/src/PAGES/`.
4. Keep reusable UI in `FRONTEND/src/components/`.
5. Keep backend business logic in controllers/services, not in routes.
