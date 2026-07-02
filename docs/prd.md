```markdown
# SLATracker PRD

### 1. Product Overview
SLATracker helps teams define, monitor, and enforce Service Level Agreements through real-time compliance tracking and incident management. Target users are DevOps/SRE teams and customer success managers. Key differentiator: one functional dashboard that turns static SLA policies into actionable, auditable compliance metrics with full CRUD lifecycle.

### 2. Core Functional Requirements
- Create and manage SLA policies with target uptime percentages, response time targets, and penalty definitions
- Track incidents through lifecycle states: Open → Investigating → Resolved → Closed with timestamp validation
- Calculate real-time SLA compliance percentages per policy based on resolved incident resolution times
- Bulk manage incidents via multi-select with status transitions and deletion
- Filter and search incidents by status, severity, SLA policy, and date ranges
- Export complete SLA/incident history as JSON and import from backup files
- Manage user profile with notification preferences that persist across sessions
- Reset all application data with confirmation safeguard

### 3. Data Model & Persistence
```typescript
interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  targetUptime: number; // Percentage (e.g., 99.9)
  responseTimeMinutes: number; // Target response time
  penalties: string; // Penalty description
  createdAt: number; // Unix timestamp
  updatedAt: number;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  severity: 'critical' | 'major' | 'minor';
  slaPolicyId: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  closedAt?: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  notificationsEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

interface AppState {
  slapolicies: SLAPolicy[];
  incidents: Incident[];
  userProfile: UserProfile;
  lastSeeded?: number;
}
```
Persistence: localStorage with keys `app_slapolicies`, `app_incidents`, `app_userprofile`, `app_metadata`.

### 4. Pages, Routes & FUNCTIONALITY

- **Landing page (/)**: Decide/Learn surface. Marketing page with hero, 6+ feature cards, 3-tier pricing table, 6+ FAQ accordions, social proof badges, primary CTA, footer with links. No data persistence.

- **Dashboard (/dashboard)**: Monitor surface. Displays computed stats from localStorage: Total incidents (with 30-day trend), Active incidents by status, Average resolution time, Compliance rate per policy. Charts show incident severity distribution and SLA breach frequency. Activity feed shows last 10 mutations.

- **SLA Policies (/dashboard/slapolicies)**: Operate surface. CRUD table with: Create button (modal form), Edit button (pre-filled modal), Delete button (confirmation dialog), Status filter dropdown, Search by name/description, Sort by name/compliance/target uptime. Table shows: Policy name, target uptime, response time, compliance %, incident count, actions.

- **Incidents (/dashboard/incidents)**: Operate surface. Full CRUD table with: Create button (modal form), Edit button (pre-filled modal), Delete button (confirmation dialog), Bulk select checkboxes, Bulk actions dropdown (Set Status, Delete), Filters for status/severity/SLA policy, Search by title/description, Sort by date/severity/status. Status badges with color coding.

- **Incident Detail (/dashboard/incidents/[id])**: Operate surface. View all fields, Edit form with validation, Status transition buttons with state machine validation (open→investigating→resolved→closed), Activity log showing all status changes with timestamps.

- **Settings (/dashboard/settings)**: Configure surface. Profile form with name/email validation and save, Notification toggle with persistence, Data export button (downloads JSON), Data import button (file picker + validation), Reset data button with confirmation modal.

### 5. Component Specification per Page

- **Dashboard**: Sidebar(240px, nav links to all pages), StatCards(4 cards: Total Incidents, Active Incidents, Avg Resolution Time, Compliance %), SeverityPieChart(SVG from incident data), ComplianceBarChart(SVG from policy compliance), RecentActivityFeed(last 10 CRUD operations), QuickActions(create incident/policy buttons).

- **SLA Policies**: DataTable(columns: Name, Target Uptime, Response Time, Compliance %, Incident Count, Actions), CreateEditModal(form with validation), DeleteConfirmationModal, StatusFilterDropdown, SearchInput, SortableHeaders, BulkSelectCheckbox, BulkActionsDropdown.

- **Incidents**: DataTable(columns: Title, Status, Severity, SLA Policy, Created, Resolved, Actions), CreateEditModal(form with SLA policy dropdown), DeleteConfirmationModal, BulkSelectAll/IndividualCheckboxes, BulkStatusModal, FiltersPanel(status/severity/policy dropdowns), SearchInput, SortableHeaders.

- **Settings**: ProfileForm(name, email inputs with validation), NotificationToggle(checkbox), ExportButton(triggers JSON download), ImportButton(file input + merge logic), ResetButton(confirmation modal).

### 6. User Flows

1. **Create SLA Policy**: User clicks Create → Modal form opens → Fills name, uptime target, response time, penalties → Validation (required fields, numeric ranges) → Save to localStorage `app_slapolicies` → Modal closes → Table refreshes → Success toast shows.

2. **Bulk Update Incidents**: User selects 3 incidents via checkboxes → Clicks Bulk Actions → Selects "Set to Resolved" → Confirmation modal → Updates all 3 in localStorage `app_incidents` → Sets resolvedAt timestamp → Table refreshes → Success toast shows.

3. **Export/Import Data**: User goes to Settings → Clicks Export → Browser downloads JSON with all data → User clears app data → Clicks Import → Selects previously exported JSON → File validated → Data merged into localStorage → All pages refresh → Success toast shows.

### 7. Mock Data (seed on first load)

**Trigger**: On first app load (check if `app_metadata` key missing in localStorage).

**Seed data**:
- 6 SLA policies: "Web Application Uptime" (99.9%, 1hr), "API Response Time" (99.5%, 15min), "Database Availability" (99.95%, 30min), "Payment Processing" (99.99%, 5min), "Mobile App Performance" (99%, 2hr), "Email Delivery" (99.5%, 1hr)
- 10 incidents: Mix of statuses (2 open, 3 investigating, 3 resolved, 2 closed) and severities, linked to policies, with realistic titles and timestamps spread over last 30 days
- 1 user profile: Default admin user with notifications enabled

### 8. File Manifest
```json
[
  {"path": "src/app/layout.tsx", "purpose": "Root layout: Inter font, dark theme, metadata, GlobalProvider wrapper", "dependencies": []},
  {"path": "src/app/globals.css", "purpose": "Tailwind directives + CSS custom properties + animations", "dependencies": []},
  {"path": "src/app/page.tsx", "purpose": "Landing page — Decide/Learn surface: hero, features, pricing, FAQ, social proof, CTA", "dependencies": []},
  {"path": "src/app/dashboard/layout.tsx", "purpose": "Dashboard layout: sidebar nav + topbar + main content area. Wraps all dashboard pages with StoreProvider.", "dependencies": []},
  {"path": "src/app/dashboard/page.tsx", "purpose": "Dashboard home — Monitor surface: computed stat cards, charts from real data, recent activity feed", "dependencies": []},
  {"path": "src/app/dashboard/slapolicies/page.tsx", "purpose": "SLA policies CRUD list — Operate surface: data table, create/edit/delete, search, sort, filter", "dependencies": []},
  {"path": "src/app/dashboard/incidents/page.tsx", "purpose": "Incidents CRUD list — Operate surface: data table, create/edit/delete, bulk actions, search, sort, filter", "dependencies": []},
  {"path": "src/app/dashboard/incidents/[id]/page.tsx", "purpose": "Incident detail — Operate surface: view/edit form, status transitions with validation, activity log", "dependencies": []},
  {"path": "src/app/dashboard/settings/page.tsx", "purpose": "Settings — Configure surface: profile form, notification toggles, data export/import/reset", "dependencies": []},
  {"path": "src/lib/store.tsx", "purpose": "React Context + useReducer global state: all entity CRUD, seed data, localStorage sync, toast notifications", "dependencies": []},
  {"path": "src/lib/types.ts", "purpose": "TypeScript interfaces for SLAPolicy, Incident, UserProfile, AppState, Toast", "dependencies": []},
  {"path": "src/lib/utils.ts", "purpose": "Utilities: generateId, formatDate, formatNumber, classNames, exportToJSON, importFromJSON", "dependencies": []}
]
```