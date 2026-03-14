import { lazy, Suspense, useContext, useState } from 'react';

import { CitizenProvider, CitizenContext } from './pages/CitizenContext';
import styles                              from './App.module.css';

// ─────────────────────────────────────────────
// LAZY PAGE IMPORTS
//
// Every page component is code-split so the initial
// JS bundle only contains the landing screen and the
// AppShell chrome. React.lazy + Suspense handles the
// async boundary when a chunk is first requested.
//
// Pages that share a component (e.g. MapView used by
// both citizen 'map' and authority 'authmap') are
// imported once and referenced from multiple route keys.
//
// Authority/admin page stubs are commented out. Uncomment
// and point to the real component file as each is built.
// ─────────────────────────────────────────────

// ── Shell ────────────────────────────────────
const AppShell = lazy(() => import('./pages/layout/AppShell'));

// ── Citizen pages ────────────────────────────
const IssueFeed   = lazy(() => import('./pages/Dashboard/IssueFeed'));
const MapView     = lazy(() => import('./pages/Dashboard/MapView'));
const ReportIssue = lazy(() => import('./pages/Dashboard/ReportIssue'));
const MyIssues    = lazy(() => import('./pages/Dashboard/MyIssues'));

// ── Authority pages ───────────────────────────
// const TaskList    = lazy(() => import('./TaskList'));
// const UpdateIssue = lazy(() => import('./UpdateIssue'));

// ── Admin pages ───────────────────────────────
// const Dashboard   = lazy(() => import('./Dashboard'));
// const AllIssues   = lazy(() => import('./AllIssues'));
// const AssignIssues= lazy(() => import('./AssignIssues'));
// const Teams       = lazy(() => import('./Teams'));

// ── Shared pages ─────────────────────────────
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));

// ── Auth pages ───────────────────────────────
const Login    = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

// ─────────────────────────────────────────────
// ROUTE TABLE
//
// Maps every page key — matching the `page` field on
// PORTAL_CONFIG nav items in mockData.js and the
// `activePage` value in CitizenContext — to the React
// component that renders it.
//
// Adding a new page = one lazy import above + one entry
// here. Nothing else needs to change.
//
// Placeholder entries (null) render a <ComingSoon> tile
// so the app never white-screens on an unbuilt route.
// ─────────────────────────────────────────────

/** @type {Record<string, React.LazyExoticComponent | null>} */
const ROUTES = {
  // ── Citizen ──────────────────────────────
  feed:          IssueFeed,
  map:           MapView,
  report:        ReportIssue,
  myissues:      MyIssues,

  // ── Authority ────────────────────────────
  tasks:         null,          // → TaskList (coming soon)
  authmap:       MapView,       // reuses MapView; role prop gates pin colours
  update:        null,          // → UpdateIssue (coming soon)

  // ── Admin ────────────────────────────────
  dashboard:     null,          // → Dashboard (coming soon)
  allissues:     null,          // → AllIssues (coming soon)
  assign:        null,          // → AssignIssues (coming soon)
  teams:         null,          // → Teams (coming soon)

  // ── Shared ───────────────────────────────
  notifications: Notifications,
};

// ─────────────────────────────────────────────
// PORTAL CARD DATA
//
// Drives the landing-screen portal-selector card(s).
//   .portal-card.citizen   → 🏘️  Citizen Portal
// ─────────────────────────────────────────────

const PORTAL_CARDS = [
  {
    role:       'citizen',
    icon:       '🏘️',
    title:      'Citizen Portal',
    desc:       'Report issues, track progress and vote on community problems',
    colorVar:   'var(--citizen)',
    glowColor:  'rgba(139,92,246,.2)',
  },
];

// ─────────────────────────────────────────────
// LANDING SCREEN
//
// Rendered when no portal is active (user === null).
// Exactly mirrors the HTML #landing section:
//   - 48 px grid background
//   - Three radial glow orbs
//   - Pulsing "Smart Civic Platform" badge
//   - Hero headline  "Report. Track. Resolve."
//   - Subtext paragraph
//   - Portal-selector card (Citizen Portal)
//
// Calls ctx.login(role) on card click which writes the
// mock user into CitizenContext, causing AppContent to
// switch to the AppShell view.
// ─────────────────────────────────────────────

function LandingScreen() {
  const { login } = useContext(CitizenContext);
  const [authView, setAuthView] = useState('landing');

  if (authView === 'login') {
    return (
      <Suspense fallback={<div className={styles.shellLoading} aria-busy="true" />}>
        <Login
          onLoginSuccess={(data) => login(data.role)}
          onNavigateRegister={() => setAuthView('register')}
        />
      </Suspense>
    );
  }

  if (authView === 'register') {
    return (
      <Suspense fallback={<div className={styles.shellLoading} aria-busy="true" />}>
        <Register
          onRegisterSuccess={(data) => login(data.role)}
          onNavigateLogin={() => setAuthView('login')}
        />
      </Suspense>
    );
  }

  return (
    <div className={styles.landing}>

      {/* ── Background decoration ── */}
      <div className={styles.gridBg}                           aria-hidden="true" />
      <div className={`${styles.glowOrb} ${styles.orb1}`}     aria-hidden="true" />
      <div className={`${styles.glowOrb} ${styles.orb2}`}     aria-hidden="true" />
      <div className={`${styles.glowOrb} ${styles.orb3}`}     aria-hidden="true" />

      <div className={styles.landingInner}>

        {/* ── Pulsing badge ── */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          Smart Civic Platform
        </div>

        {/* ── Hero headline ── */}
        <h1 className={styles.hero}>
          Report. Track.<br />
          <span className={styles.heroAccent}>Resolve.</span>
        </h1>

        {/* ── Subtext ── */}
        <p className={styles.sub}>
          NagarSetu connect citizens and local authorities to fix civic issues - from potholes to broken streetlights - faster than ever.
        </p>

        {/* ── Portal selector cards ── */}
        <div className={styles.portalCards} role="list">
          {PORTAL_CARDS.map((card) => (
            <button
              key={card.role}
              className={`${styles.portalCard} ${styles[card.role]}`}
              style={{
                '--card-color': card.colorVar,
                '--card-glow':  card.glowColor,
              }}
              onClick={() => setAuthView('login')}
              role="listitem"
              aria-label={`Open ${card.title}`}
            >
              {/* Coloured top stripe */}
              <div className={styles.cardStripe} aria-hidden="true" />

              {/* Icon tile */}
              <div className={styles.cardIconWrap} aria-hidden="true">
                {card.icon}
              </div>

              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p  className={styles.cardDesc}>{card.desc}</p>

              <span className={styles.cardArrow} aria-hidden="true">
                Enter portal →
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE SKELETON  (Suspense fallback)
//
// Three shimmer bars shown while a lazy page chunk
// is loading — approximates a page header + two cards
// so the layout doesn't jump on arrival.
// ─────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div
      className={styles.skeleton}
      aria-busy="true"
      aria-label="Loading page…"
      role="status"
    >
      <div className={`${styles.shimmer} ${styles.shimmerTitle}`} />
      <div className={`${styles.shimmer} ${styles.shimmerCard}`}  />
      <div className={`${styles.shimmer} ${styles.shimmerCard}`}  />
    </div>
  );
}

// ─────────────────────────────────────────────
// COMING SOON  (placeholder for unbuilt routes)
//
// Shown when ROUTES[activePage] === null.
// Prevents a white screen while components are
// being built out iteratively.
// ─────────────────────────────────────────────

function ComingSoon({ page }) {
  return (
    <div className={styles.comingSoon}>
      <span className={styles.comingSoonIcon} aria-hidden="true">🚧</span>
      <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
      <p  className={styles.comingSoonSub}>
        The <code>{page}</code> page is being built.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE ROUTER
//
// Reads `activePage` from CitizenContext and renders
// the matching component inside a Suspense boundary.
//
// Mirrors the HTML showPage() / .page.active pattern.
// The `key={activePage}` on the wrapper div forces a
// clean unmount + remount on every navigation, giving
// each page its own fresh mount cycle and animation.
// ─────────────────────────────────────────────

function PageRouter() {
  const { activePage, setActivePage } = useContext(CitizenContext);
  const PageComponent  = ROUTES[activePage];

  // Unknown route — should never happen in practice since
  // activePage is always set from PORTAL_CONFIG.nav items.
  if (!(activePage in ROUTES)) {
    return (
      <div className={styles.notFound}>
        <p>Unknown page: <code>{activePage}</code></p>
      </div>
    );
  }

  // Null route — component not yet built
  if (PageComponent === null) {
    return <ComingSoon page={activePage} />;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      {/*
        key forces remount on navigation, producing the
        CSS fadeIn animation on every page transition and
        resetting all component-local state cleanly.
      */}
      <div key={activePage} className={styles.pageWrapper}>
        <PageComponent onNavigate={setActivePage} />
      </div>
    </Suspense>
  );
}

// ─────────────────────────────────────────────
// APP CONTENT
//
// The live application core — sits inside CitizenProvider
// so it can safely call useContext(CitizenContext).
//
// Switches between:
//   LandingScreen  — user === null  (portal not yet chosen)
//   AppShell + PageRouter — user !== null  (portal active)
//
// AppShell receives PageRouter as `children` so it can
// render the top-bar + sidebar chrome independently of
// which page is currently active.
// ─────────────────────────────────────────────

function AppContent() {
  const { user, activePage, setActivePage, logout, unreadCount } = useContext(CitizenContext);

  if (!user) {
    return <LandingScreen />;
  }

  return (
    <Suspense fallback={<div className={styles.shellLoading} aria-busy="true" />}>
      <AppShell
        user={user}
        activePage={activePage}
        onNavigate={setActivePage}
        onSwitchPortal={logout}
        unreadCount={unreadCount}
      >
        <PageRouter />
      </AppShell>
    </Suspense>
  );
}

// ─────────────────────────────────────────────
// ROOT EXPORT
//
// App is the component mounted by main.jsx.
// It owns the CitizenProvider so every component
// in the tree — including LandingScreen, AppShell,
// and all page components — can call useAuth() or
// useContext(CitizenContext) without prop-drilling.
//
// Component tree:
//
//   App
//   └─ CitizenProvider        (context + state owner)
//        └─ AppContent        (reads context, switches views)
//             ├─ LandingScreen     (user === null)
//             └─ AppShell          (user !== null)
//                  └─ PageRouter   (renders active page)
//                       └─ <Page> (lazy, Suspense-wrapped)
// ─────────────────────────────────────────────

export default function App() {
  return (
    <CitizenProvider>
      <AppContent />
    </CitizenProvider>
  );
}