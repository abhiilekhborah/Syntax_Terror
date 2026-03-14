// ─────────────────────────────────────────────
// mockData.js
//
// Single source of truth for all static data used
// across the NagarSetu portal during development.
//
// In production each export would be replaced by an
// API call (e.g. GET /api/issues, GET /api/notifications).
// Components import only what they need so tree-shaking
// removes anything unused from the bundle.
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// TYPES  (JSDoc — no TypeScript required)
// ─────────────────────────────────────────────

/**
 * @typedef {'open' | 'progress' | 'resolved' | 'review'} IssueStatus
 * @typedef {'high' | 'med' | 'low'}                       IssuePriority
 *
 * @typedef {Object} Issue
 * @property {string}        id        — e.g. 'CVP-1042'
 * @property {string}        cat       — category label
 * @property {string}        icon      — emoji representative of the category
 * @property {string}        title     — short issue description
 * @property {string}        loc       — human-readable location string
 * @property {string}        date      — display date string e.g. 'Mar 10'
 * @property {IssueStatus}   status
 * @property {IssuePriority} priority
 * @property {number}        votes     — community upvote count
 * @property {string}        assigned  — assignee name or '—' if unassigned
 * @property {string}        color     — hex accent used for thumbnails / pins
 *
 * @typedef {Object} Notification
 * @property {string}  icon   — emoji icon
 * @property {string}  bg     — rgba background for the icon tile
 * @property {string}  title  — notification heading
 * @property {string}  desc   — notification body copy
 * @property {string}  time   — relative time string e.g. '2 hours ago'
 * @property {boolean} unread — whether the notification is unread
 *
 * @typedef {'active' | 'busy' | 'leave'} MemberStatus
 *
 * @typedef {Object} TeamMember
 * @property {string}       name      — full name
 * @property {string}       initials  — 2-character initials for avatar
 * @property {string}       role      — job title
 * @property {string}       zone      — assigned zone e.g. 'Zone A'
 * @property {number}       tasks     — count of active tasks
 * @property {number}       resolved  — lifetime resolved count
 * @property {number}       perf      — performance score 0-100
 * @property {MemberStatus} status
 *
 * @typedef {'citizen' | 'authority' | 'admin'} PortalRole
 *
 * @typedef {Object} NavItem
 * @property {string} page  — page key matching the router
 * @property {string} icon  — emoji
 * @property {string} label — display label
 * @property {string} badge — badge count string, '' if none
 *
 * @typedef {Object} PortalConfig
 * @property {string}    pill       — CSS class for the portal pill
 * @property {string}    pillText   — portal pill label
 * @property {string}    avatarBg   — rgba background for the top-bar avatar
 * @property {string}    avatarColor— CSS colour for avatar initials
 * @property {string}    initials   — 2-char initials shown in the avatar
 * @property {string}    navClass   — CSS class applied to the sidebar
 * @property {NavItem[]} nav        — ordered nav item list for this portal
 * @property {string}    defaultPage— page key to show on portal open
 */

// ─────────────────────────────────────────────
// ISSUES
// ─────────────────────────────────────────────

/** @type {Issue[]} */
export const issues = [
  {
    id: 'CVP-1042',
    cat: 'Potholes',
    icon: '🕳️',
    title: 'Deep pothole near bus stop',
    loc: 'Manik Nagar, Jorhat',
    date: 'Mar 10',
    status: 'progress',
    priority: 'high',
    votes: 34,
    assigned: 'Dept. of Roads',
    color: '#ef4444',
  },
  {
    id: 'CVP-1039',
    cat: 'Street Light',
    icon: '💡',
    title: 'Street light out for 2 weeks',
    loc: 'Mariani Junction',
    date: 'Mar 8',
    status: 'open',
    priority: 'med',
    votes: 21,
    assigned: '—',
    color: '#f59e0b',
  },
  {
    id: 'CVP-1037',
    cat: 'Garbage',
    icon: '🗑️',
    title: 'Illegal dumping near school',
    loc: 'Lachit Bazaar',
    date: 'Mar 7',
    status: 'open',
    priority: 'high',
    votes: 56,
    assigned: '—',
    color: '#8b5cf6',
  },
  {
    id: 'CVP-1031',
    cat: 'Water',
    icon: '💧',
    title: 'Burst pipe flooding street',
    loc: 'Lamphelpat Road',
    date: 'Mar 5',
    status: 'review',
    priority: 'high',
    votes: 41,
    assigned: 'Water Dept.',
    color: '#3b82f6',
  },
  {
    id: 'CVP-1028',
    cat: 'Potholes',
    icon: '🕳️',
    title: 'Multiple potholes in colony',
    loc: 'JEC Road, Garmur',
    date: 'Mar 3',
    status: 'resolved',
    priority: 'low',
    votes: 12,
    assigned: 'Dept. of Roads',
    color: '#10b981',
  },
  {
    id: 'CVP-1020',
    cat: 'Fallen Tree',
    icon: '🌳',
    title: 'Tree blocking footpath',
    loc: 'Lichubari',
    date: 'Feb 28',
    status: 'resolved',
    priority: 'med',
    votes: 8,
    assigned: 'Parks Dept.',
    color: '#10b981',
  },
];

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

/** @type {Notification[]} */
export const notifications = [
  {
    icon: '✅',
    bg: 'rgba(16,185,129,.15)',
    title: 'Issue Resolved',
    desc: 'Your pothole report #CVP-1028 on JEC Road, Garmur has been resolved.',
    time: '2 hours ago',
    unread: true,
  },
  {
    icon: '⚙️',
    bg: 'rgba(59,130,246,.15)',
    title: 'Team Assigned',
    desc: 'A field team has been assigned to your water pipe report #CVP-1031.',
    time: '5 hours ago',
    unread: true,
  },
  {
    icon: '👍',
    bg: 'rgba(139,92,246,.15)',
    title: 'Community Upvote',
    desc: '12 citizens upvoted your garbage issue near Lachit Bazaar.',
    time: 'Yesterday',
    unread: false,
  },
  {
    icon: '📋',
    bg: 'rgba(249,115,22,.15)',
    title: 'Status Update',
    desc: 'Issue #CVP-1039 is now under review by the Electricity Department.',
    time: '2 days ago',
    unread: false,
  },
];

// ─────────────────────────────────────────────
// TEAM MEMBERS
// ─────────────────────────────────────────────

/** @type {TeamMember[]} */
export const teamMembers = [
  {
    name: 'Raj Kumar',
    initials: 'RK',
    role: 'Field Officer',
    zone: 'Zone A',
    tasks: 4,
    resolved: 28,
    perf: 92,
    status: 'active',
  },
  {
    name: 'Priya Devi',
    initials: 'PD',
    role: 'Field Supervisor',
    zone: 'Zone B',
    tasks: 2,
    resolved: 45,
    perf: 96,
    status: 'active',
  },
  {
    name: 'Mohen Singh',
    initials: 'MS',
    role: 'Technician',
    zone: 'Zone A',
    tasks: 6,
    resolved: 19,
    perf: 78,
    status: 'busy',
  },
  {
    name: 'Tomba Leishangthem',
    initials: 'TL',
    role: 'Field Officer',
    zone: 'Zone C',
    tasks: 1,
    resolved: 33,
    perf: 88,
    status: 'active',
  },
  {
    name: 'Sonia Aheibam',
    initials: 'SA',
    role: 'Inspector',
    zone: 'Zone B',
    tasks: 3,
    resolved: 52,
    perf: 94,
    status: 'leave',
  },
];

// ─────────────────────────────────────────────
// PORTAL CONFIG
//
// Drives the top-bar pill, sidebar nav items, avatar
// colours, and the default landing page for each role.
// Mirrors the `portals` object in the HTML prototype.
// ─────────────────────────────────────────────

/** @type {Record<PortalRole, PortalConfig>} */
export const PORTAL_CONFIG = {
  citizen: {
    pill: 'pill-citizen',
    pillText: 'Citizen Portal',
    avatarBg: 'rgba(139,92,246,.2)',
    avatarColor: 'var(--citizen)',
    initials: 'KM',
    navClass: 'citizen',
    nav: [
      { page: 'feed', icon: '📋', label: 'Community Feed', badge: '' },
      { page: 'map', icon: '🗺️', label: 'Issue Map', badge: '' },
      { page: 'report', icon: '➕', label: 'Report Issue', badge: '' },
      { page: 'myissues', icon: '📂', label: 'My Reports', badge: '3' },
      { page: 'notifications', icon: '🔔', label: 'Notifications', badge: '2' },
    ],
    defaultPage: 'feed',
  },

  authority: {
    pill: 'pill-authority',
    pillText: 'Authority Portal',
    avatarBg: 'rgba(59,130,246,.2)',
    avatarColor: 'var(--authority)',
    initials: 'RS',
    navClass: 'authority',
    nav: [
      { page: 'tasks', icon: '✅', label: 'My Tasks', badge: '8' },
      { page: 'authmap', icon: '🗺️', label: 'Field Map', badge: '' },
      { page: 'update', icon: '🔄', label: 'Update Issue', badge: '' },
      { page: 'notifications', icon: '🔔', label: 'Notifications', badge: '2' },
    ],
    defaultPage: 'tasks',
  },

  admin: {
    pill: 'pill-admin',
    pillText: 'Admin Portal',
    avatarBg: 'rgba(249,115,22,.2)',
    avatarColor: 'var(--admin)',
    initials: 'AD',
    navClass: 'admin',
    nav: [
      { page: 'dashboard', icon: '📊', label: 'Dashboard', badge: '' },
      { page: 'allissues', icon: '📋', label: 'All Issues', badge: '342' },
      { page: 'assign', icon: '📌', label: 'Assign Issues', badge: '18' },
      { page: 'teams', icon: '👥', label: 'Teams', badge: '' },
      { page: 'notifications', icon: '🔔', label: 'Alerts', badge: '5' },
    ],
    defaultPage: 'dashboard',
  },
};

// ─────────────────────────────────────────────
// MOCK USERS
//
// One stub user per role. useAuth.js reads from
// this array to simulate login without a backend.
// ─────────────────────────────────────────────

/**
 * @typedef {Object} User
 * @property {string}     id
 * @property {string}     name
 * @property {string}     initials
 * @property {string}     zone
 * @property {PortalRole} role
 * @property {string}     email
 */

/** @type {User[]} */
export const MOCK_USERS = [
  {
    id: 'usr-001',
    name: 'Jack Daniel',
    initials: 'JD',
    zone: 'Garmur, Jorhat',
    role: 'citizen',
    email: 'k.mani@nagarsetu.in',
  },
  {
    id: 'usr-002',
    name: 'Raj Singh',
    initials: 'RS',
    zone: 'Zone A',
    role: 'authority',
    email: 'r.singh@nagarsetu.in',
  },
  {
    id: 'usr-003',
    name: 'Admin',
    initials: 'AD',
    zone: 'City HQ, Imphal',
    role: 'admin',
    email: 'admin@nagarsetu.in',
  },
];