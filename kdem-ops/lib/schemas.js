// ============================================================
// KDEM OneView — the control panel.
// Datasets have ONE home vertical; tabs are queries (sources +
// filter), so one entry mirrors everywhere it belongs.
// ============================================================

export const CLUSTERS = ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi-Dharwad-Belagavi", "Kalaburagi", "Tumakuru", "Shivamogga"];
// All non-Bengaluru clusters count toward BB (Tumakuru & Shivamogga have
// no cluster head yet, but leads still flow and count to BB numbers)
export const BB_CLUSTERS = ["Mysuru", "Mangaluru", "Hubballi-Dharwad-Belagavi", "Kalaburagi", "Tumakuru", "Shivamogga"];
export const HEAD_CLUSTERS = ["Mysuru", "Mangaluru", "Hubballi-Dharwad-Belagavi", "Kalaburagi"];

export const FYS = ["2025-26", "2026-27"];
export const DEFAULT_FY = "2026-27";

export const POLICIES = ["IT Policy", "GCC Policy", "ESDM Policy", "Startup Policy"];
export const POLICY_HOME = { "IT Policy": "itgcc", "GCC Policy": "itgcc", "ESDM Policy": "esdm", "Startup Policy": "sni" };

const STAGES = ["Prospect", "Engaged", "Committed", "Grounded", "Dropped"];
const STATUS = ["Not started", "In progress", "Done", "On hold"];

export const CONTACT_COLS = [
  { key: "contact_name", label: "Contact person", type: "text", hide: true },
  { key: "contact_designation", label: "Designation", type: "text", hide: true },
  { key: "contact_phone", label: "Phone", type: "text", hide: true },
  { key: "contact_email", label: "Email", type: "text", hide: true },
  { key: "contact_linkedin", label: "LinkedIn URL", type: "text", hide: true },
];

// ---------- SHARED DATASETS ----------

// GCCs + IT companies: ONE dataset (home itgcc), two tab views
const GCC_TYPES = ["GCC — New", "GCC — Expansion", "Nano GCC"];
const IT_TYPES = ["IT/ITeS", "AVGC / Gaming", "Support Centre", "Other"];
const COMPANY_COLS = [
  { key: "name", label: "Company", type: "text" },
  { key: "type", label: "Type", type: "select", options: [...GCC_TYPES, ...IT_TYPES] },
  { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
  { key: "stage", label: "Stage", type: "select", options: STAGES },
  { key: "jobs", label: "Jobs / HC", type: "number" },
  ...CONTACT_COLS,
  { key: "notes", label: "Notes", type: "textarea" },
];
const GCCS = {
  key: "gccs", label: "GCCs", home: "itgcc", hasContact: true, columns: COMPANY_COLS,
  filter: (d) => !d.type || GCC_TYPES.includes(d.type),
  sub: "New, expansion & nano GCCs — shared with Beyond Bengaluru by cluster",
};
const ITCOS = {
  key: "gccs", viewKey: "itcos", label: "IT / ITeS Companies", home: "itgcc", hasContact: true, columns: COMPANY_COLS,
  filter: (d) => IT_TYPES.includes(d.type),
  sub: "IT/ITeS, AVGC and support-centre pipeline",
};
const ALL_COMPANIES = { key: "gccs", viewKey: "allcos", label: "GCCs & Companies", home: "itgcc", hasContact: true, columns: COMPANY_COLS };

const DATACENTRES = {
  key: "datacentres", label: "Data Centres", home: "itgcc", hasContact: true,
  sub: "Live pipeline — operational DCs belong in the Database",
  columns: [
    { key: "name", label: "Data Centre", type: "text" },
    { key: "stage", label: "Stage", type: "select", options: ["Pipeline", "MoU", "Grounded", "Operational"] },
    { key: "capacity", label: "Capacity (MW)", type: "text" },
    { key: "land", label: "Land", type: "text" },
    { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
    { key: "location", label: "Location", type: "text" },
    ...CONTACT_COLS,
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

// Policy hub — three shared sub-datasets across itgcc/esdm/sni/bb
const POLICY_SOURCES = (tab) => ["itgcc", "esdm", "sni", "bb"].map((v) => ({ vertical: v, tab }));
const POLICYREG_BASE = {
  key: "policyreg", label: "Registrations", hasContact: true,
  homeByField: { field: "policy", map: POLICY_HOME },
  sources: POLICY_SOURCES("policyreg").slice(0, 3),
  columns: [
    { key: "name", label: "Company", type: "text" },
    { key: "policy", label: "Policy", type: "select", options: POLICIES },
    { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
    { key: "stage", label: "Stage", type: "select",
      options: ["Pipeline", "Outreach", "Applied", "Under review", "Registered", "Rejected"] },
    ...CONTACT_COLS,
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};
const AWARENESS = {
  key: "awareness", label: "Incentives Awareness Drive", hasDocs: true,
  sources: POLICY_SOURCES("awareness"),
  sub: "Sessions conducted — attach photos & attendance",
  columns: [
    { key: "name", label: "Session", type: "text" },
    { key: "date", label: "Date", type: "date" },
    { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
    { key: "venue", label: "Venue / mode", type: "text" },
    { key: "companies", label: "Companies reached", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};
const POLICY_STRATEGY = {
  key: "polstrategy", label: "Strategy", hasContact: true,
  sources: POLICY_SOURCES("polstrategy"),
  sub: "Get companies to apply — blockers and next actions",
  columns: [
    { key: "name", label: "Company", type: "text" },
    { key: "policy", label: "Policy", type: "select", options: POLICIES },
    { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
    { key: "blocker", label: "Blocker / status quo", type: "text" },
    { key: "next_action", label: "Next action", type: "text" },
    { key: "owner", label: "Owner", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Open", "In progress", "Applied", "Dropped"] },
    ...CONTACT_COLS,
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};
const policyHub = (policies) => ({
  key: "policies", label: "Policies", isPolicyHub: true,
  registrations: { ...POLICYREG_BASE, filter: policies ? (d) => policies.includes(d.policy) : undefined },
  awareness: AWARENESS,
  strategy: { ...POLICY_STRATEGY, filter: policies ? (d) => !d.policy || policies.includes(d.policy) : undefined },
});

const roadshows = (home) => ({
  key: "roadshows", label: "Roadshows", home,
  columns: [
    { key: "name", label: "Roadshow", type: "text" },
    { key: "geography", label: "Country / State", type: "text" },
    { key: "date", label: "Date", type: "date" },
    { key: "stakeholders", label: "Planned external stakeholders", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["Planned", "Confirmed", "Done", "Dropped"] },
    { key: "leads", label: "Leads generated", type: "number" },
    { key: "notes", label: "Notes / outcomes", type: "textarea" },
  ],
});

export const PROPOSAL_STATUSES = ["Drafting", "Submitted to KITS", "Under review", "Approved", "In execution", "Delivered", "On hold"];
export const PROPOSAL_TARGETS = ["KITS", "ITBT Department", "GoK", "KDEM Internal", "Other"];
export const PROPOSAL_CATEGORIES = ["Report", "CoE", "Infrastructure", "Policy", "Program", "Event", "Other"];
const PROPOSALS = { key: "proposals", label: "Proposals & Initiatives", isProposals: true };

// Each vertical carries its own permanent Database (companies + people),
// visible & editable only inside that vertical. Never FY-scoped.
export const dbTabs = (home) => [
  { key: "db_companies", label: "Companies", home, noFy: true, hasContact: true,
    sub: "This vertical's permanent directory — active, past & prospect companies",
    columns: [
      { key: "name", label: "Company", type: "text" },
      { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
      { key: "status", label: "Status", type: "select", options: ["Active in Karnataka", "Pipeline", "Past engagement", "Prospect"] },
      { key: "sector", label: "Sector", type: "text" },
      ...CONTACT_COLS,
      { key: "notes", label: "Notes", type: "textarea" },
    ]},
  { key: "db_people", label: "People", home, noFy: true, hasContact: true,
    sub: "Everyone we meet — multiple people per company, at every level",
    columns: [
      { key: "name", label: "Name", type: "text" },
      { key: "company", label: "Company / Org", type: "text" },
      { key: "designation", label: "Designation", type: "text" },
      { key: "cluster", label: "Cluster / City", type: "text" },
      { key: "context", label: "Met at / context", type: "text" },
      ...CONTACT_COLS,
      { key: "notes", label: "Notes", type: "textarea" },
    ]},
];
const DATABASE_TAB = { key: "database", label: "Database", isDatabase: true };

// ---------- VERTICALS ----------

export const VERTICALS = {
  itgcc: {
    name: "IT / ITeS / GCC", short: "IT & GCC", color: "#3457E0",
    tabs: [GCCS, ITCOS, DATACENTRES, policyHub(["IT Policy", "GCC Policy"]), roadshows("itgcc"), DATABASE_TAB, PROPOSALS],
  },
  esdm: {
    name: "ESDM", short: "ESDM", color: "#0E8F86",
    tabs: [
      { key: "investments", label: "Investments", home: "esdm", hasContact: true,
        columns: [
          { key: "name", label: "Company", type: "text" },
          { key: "segment", label: "Segment", type: "select",
            options: ["OSAT", "PCB / HDI", "Fabless", "EMS", "Laminates", "Components", "Battery", "EV", "Drones", "Semiconductor Equipment", "Other"] },
          { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
          { key: "stage", label: "Stage", type: "select", options: ["Pipeline", "Warm", "Hot", "Closed", "Dropped"] },
          { key: "value", label: "Investment (₹Cr)", type: "number" },
          { key: "jobs", label: "Jobs", type: "number" },
          ...CONTACT_COLS,
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      roadshows("esdm"),
      { key: "skilling", label: "Skilling", home: "esdm",
        columns: [
          { key: "program", label: "Program", type: "text" },
          { key: "partner", label: "Partner", type: "text" },
          { key: "trained", label: "Trained", type: "number" },
          { key: "status", label: "Status", type: "select", options: STATUS },
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      policyHub(["ESDM Policy"]),
      DATABASE_TAB,
      PROPOSALS,
    ],
  },
  sni: {
    name: "Startups & Innovation", short: "Startups", color: "#7A5AF8",
    tabs: [
      { key: "startups", label: "Startups", home: "sni", hasContact: true,
        columns: [
          { key: "name", label: "Startup", type: "text" },
          { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
          { key: "sector", label: "Sector", type: "text" },
          { key: "incentive", label: "Incentive applied", type: "select", options: ["Yes", "No"] },
          ...CONTACT_COLS,
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      { key: "seedfund", label: "Seed Fund", home: "sni",
        columns: [
          { key: "name", label: "Startup / LOI", type: "text" },
          { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
          { key: "amount", label: "Amount (₹L)", type: "number" },
          { key: "status", label: "Status", type: "select", options: ["LOI Received", "Approved", "Disbursed", "Rejected"] },
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      { key: "programs", label: "Programs", home: "sni",
        columns: [
          { key: "name", label: "Startup", type: "text" },
          { key: "program", label: "Program", type: "select", options: ["KAN", "ELEVATE", "BLUE", "K-Combinator", "Other"] },
          { key: "cohort", label: "Cohort", type: "text" },
          { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
          { key: "status", label: "Status", type: "select", options: ["Applied", "Selected", "Active", "Graduated"] },
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      policyHub(["Startup Policy"]),
      DATABASE_TAB,
      PROPOSALS,
    ],
  },
  bb: {
    name: "Beyond Bengaluru", short: "Beyond Bengaluru", color: "#B07A1E",
    isBB: true,
    tabs: [policyHub(null), DATABASE_TAB, PROPOSALS],
  },
  talent: {
    name: "Talent Accelerator", short: "Talent", color: "#2E9E44",
    tabs: [
      { key: "programs", label: "Programs", home: "talent",
        columns: [
          { key: "name", label: "Program / Batch", type: "text" },
          { key: "scheme", label: "Scheme", type: "select", options: ["NIPUNA", "Super 100 / IAAP", "Women@Work", "K-VLSI", "Regional", "Other"] },
          { key: "trained", label: "Trained", type: "number" },
          { key: "placed", label: "Placed", type: "number" },
          { key: "status", label: "Status", type: "select", options: STATUS },
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      { key: "partnerships", label: "Partnerships", home: "talent", hasContact: true,
        columns: [
          { key: "name", label: "Partner", type: "text" },
          { key: "kind", label: "Type", type: "select", options: ["Industry", "Academia", "Government", "Other"] },
          { key: "status", label: "Status", type: "select", options: STATUS },
          ...CONTACT_COLS,
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      DATABASE_TAB,
      PROPOSALS,
    ],
  },
  mkt: {
    name: "Marketing & Events", short: "Marketing", color: "#E06B2D",
    tabs: [
      { key: "events", label: "Events", isEvents: true },
      { key: "digital", label: "Digital", home: "mkt",
        sub: "Followers & reach across our channels",
        columns: [
          { key: "platform", label: "Platform", type: "select",
            options: ["LinkedIn", "X (Twitter)", "Instagram", "YouTube", "Website", "Newsletter", "Other"] },
          { key: "metric", label: "Metric", type: "select",
            options: ["Followers", "Subscribers", "Impressions", "Engagement", "Visits"] },
          { key: "value", label: "Value", type: "number" },
          { key: "as_of", label: "As of", type: "date" },
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      { key: "media", label: "Media & PR", home: "mkt",
        columns: [
          { key: "item", label: "Item", type: "text" },
          { key: "kind", label: "Type", type: "select", options: ["Interview", "Press release", "Op-ed", "Coverage", "Other"] },
          { key: "outlet", label: "Outlet", type: "text" },
          { key: "date", label: "Date", type: "date" },
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      DATABASE_TAB,
      PROPOSALS,
    ],
  },
};

// BB cluster sections mirror these
export const BB_SECTIONS = [
  { label: "GCCs & Companies", tabDef: ALL_COMPANIES, jobsKey: "jobs" },
  { label: "ESDM investments", tabDef: VERTICALS.esdm.tabs[0], jobsKey: "jobs" },
  { label: "Data Centres", tabDef: DATACENTRES },
  { label: "Startups", tabDef: VERTICALS.sni.tabs[0] },
];

export const VERTICAL_KEYS = Object.keys(VERTICALS);

// Scopes for tasks / meetings / events: verticals + CEO Office
export const SCOPES = ["ceo", ...VERTICAL_KEYS];
const SCOPE_META = { ceo: { short: "CEO Office", color: "#B03050" } };
export const vName = (k) => SCOPE_META[k]?.short || VERTICALS[k]?.short || k;
export const vColor = (k) => SCOPE_META[k]?.color || VERTICALS[k]?.color || "#5B6963";

export const EVENT_TYPES = ["Pre-BTS Cluster", "Summit", "International", "Domestic", "Other"];

// Designations
export const ROLE_LABELS = { master: "Master", ceo: "CEO Office", lead: "Lead", member: "Member", cluster_head: "Cluster Head" };
export const DESIGNATIONS = {
  ceo_office: ["CEO", "CAO", "HR", "Associate", "Fellow", "HR Admin"],
  vertical: ["VP", "Associate", "Fellow", "Intern"],
};
export const designationsFor = (role) =>
  role === "ceo" || role === "master" ? DESIGNATIONS.ceo_office : DESIGNATIONS.vertical;

export const PILL_COLORS = {
  Prospect: "#8B978F", Engaged: "#B07A1E", Committed: "#3457E0",
  Grounded: "#1F8A4C", Operational: "#1F8A4C", Dropped: "#C24040", Pipeline: "#8B978F",
  MoU: "#3457E0", Warm: "#B07A1E", Hot: "#E06B2D", Closed: "#1F8A4C",
  Outreach: "#B07A1E", Applied: "#3457E0", "Under review": "#B07A1E", Registered: "#1F8A4C",
  "Not started": "#8B978F", "In progress": "#3457E0", Done: "#1F8A4C", "On hold": "#C24040",
  "LOI Received": "#B07A1E", Approved: "#3457E0", Disbursed: "#1F8A4C", Rejected: "#C24040",
  Selected: "#3457E0", Active: "#1F8A4C", Graduated: "#7A5AF8",
  Planned: "#B07A1E", Confirmed: "#3457E0", Open: "#B07A1E",
  planned: "#B07A1E", confirmed: "#3457E0", done: "#1F8A4C", cancelled: "#C24040",
  todo: "#8B978F", inprogress: "#3457E0", high: "#C24040", medium: "#B07A1E", low: "#1F8A4C",
  Yes: "#1F8A4C", No: "#8B978F",
  Drafting: "#8B978F", "Submitted to KITS": "#3457E0", "In execution": "#7A5AF8", Delivered: "#1F8A4C",
  internal: "#3457E0", external: "#B07A1E", in_person: "#1F8A4C", online: "#3457E0",
  "Active in Karnataka": "#1F8A4C", "Past engagement": "#8B978F",
  master: "#B03050", ceo: "#B07A1E", lead: "#3457E0", member: "#8B978F", cluster_head: "#0E8F86",
};

export const THEMES = [
  ["emerald", "Emerald", "#0C6B53"],
  ["cobalt", "Cobalt", "#2653D9"],
  ["plum", "Plum", "#6C3FC5"],
  ["teal", "Teal", "#0E8F86"],
  ["rust", "Rust", "#C2571B"],
  ["graphite", "Graphite", "#3E5750"],
];
export function applyTheme(key) {
  document.documentElement.setAttribute("data-theme", key || "emerald");
}

// ---------- LIVE COUNTERS ----------
// Computed straight from the trackers — no manual "update value" anywhere.
// H = { count(v,tab,pred), sum(v,tab,field,pred), events(pred), latest(v,tab,field,pred) }
const LANDED = ["Grounded", "Operational", "Closed"];
const inBB = (d) => BB_CLUSTERS.includes(d.cluster);
export const COUNTERS = {
  itgcc: [
    { label: "Company pipeline", tab: "gccs", target: "Pipeline of 50+ via roadshows", calc: (H) => H.count("itgcc", "gccs", (d) => !LANDED.includes(d.stage) && d.stage !== "Dropped") },
    { label: "GCCs & companies landed", tab: "gccs", target: "40 new GCCs + 10 expansions", calc: (H) => H.count("itgcc", "gccs", (d) => LANDED.includes(d.stage)) },
    { label: "Data Centre pipeline", tab: "datacentres", target: "7 pipeline + 2 grounded", calc: (H) => H.count("itgcc", "datacentres", (d) => d.stage !== "Operational") },
    { label: "Roadshows", tab: "roadshows", target: "2 international + 4 domestic", calc: (H) => H.count("itgcc", "roadshows") },
    { label: "Policy registrations", tab: "policies", target: "10 GCCs via KITS", calc: (H) => H.count("itgcc", "policyreg", (d) => d.stage === "Registered") },
  ],
  esdm: [
    { label: "Funnel companies", tab: "investments", target: "₹6,000 Cr + 5,000 jobs", calc: (H) => H.count("esdm", "investments", (d) => d.stage !== "Dropped") },
    { label: "Pipeline value", unit: "₹Cr", tab: "investments", target: "₹8,000 Cr global pipeline", calc: (H) => H.sum("esdm", "investments", "value", (d) => !["Dropped", "Closed"].includes(d.stage)) },
    { label: "Closed", unit: "₹Cr", tab: "investments", target: "₹6,000 Cr", calc: (H) => H.sum("esdm", "investments", "value", (d) => d.stage === "Closed") },
    { label: "Jobs (closed)", tab: "investments", target: "5,000 jobs", calc: (H) => H.sum("esdm", "investments", "jobs", (d) => d.stage === "Closed") },
    { label: "Roadshows", tab: "roadshows", target: "3 global + 4 roundtables", calc: (H) => H.count("esdm", "roadshows") },
  ],
  sni: [
    { label: "Startups tracked", tab: "startups", target: "1,000 registrations", calc: (H) => H.count("sni", "startups") },
    { label: "Seed fund", unit: "₹L", tab: "seedfund", target: "₹15 Cr mobilised", calc: (H) => H.sum("sni", "seedfund", "amount") },
    { label: "In programs", tab: "programs", target: "KAN Cohort 3: 50–60", calc: (H) => H.count("sni", "programs") },
    { label: "Policy registrations", tab: "policies", target: "100 applications", calc: (H) => H.count("sni", "policyreg", (d) => d.stage === "Registered") },
  ],
  bb: [
    { label: "Company pipeline", jump: "all", target: "Pipeline of 100 companies", calc: (H) => H.count("itgcc", "gccs", inBB) + H.count("esdm", "investments", inBB) },
    { label: "Companies landed", jump: "all", target: "Onboard 30 new companies", calc: (H) => H.count("itgcc", "gccs", (d) => inBB(d) && LANDED.includes(d.stage)) + H.count("esdm", "investments", (d) => inBB(d) && d.stage === "Closed") },
    { label: "Jobs (landed)", jump: "all", target: "Create 750+ jobs", calc: (H) => H.sum("itgcc", "gccs", "jobs", (d) => inBB(d) && LANDED.includes(d.stage)) + H.sum("esdm", "investments", "jobs", (d) => inBB(d) && d.stage === "Closed") },
    { label: "DC pipeline", jump: "all", target: "Mirrored from IT/GCC", calc: (H) => H.count("itgcc", "datacentres", inBB) },
    { label: "Startups", jump: "all", target: "200 BB registrations", calc: (H) => H.count("sni", "startups", inBB) },
    { label: "Awareness sessions", jump: "policies", target: "40 sessions + 50 registrations", calc: (H) => ["itgcc", "esdm", "sni", "bb"].reduce((a, v) => a + H.count(v, "awareness", inBB), 0) },
  ],
  talent: [
    { label: "Trained", tab: "programs", target: "15,000 NIPUNA", calc: (H) => H.sum("talent", "programs", "trained") },
    { label: "Placed", tab: "programs", target: "6,000 jobs enabled", calc: (H) => H.sum("talent", "programs", "placed") },
    { label: "Partnerships", tab: "partnerships", target: "25 partnerships", calc: (H) => H.count("talent", "partnerships") },
  ],
  mkt: [
    { label: "LinkedIn followers", tab: "digital", target: "40,000", calc: (H) => H.latest("mkt", "digital", "value", (d) => d.platform === "LinkedIn" && d.metric === "Followers") },
    { label: "Pre-BTS events", tab: "events", target: "6 cluster events", calc: (H) => H.events((e) => e.type === "Pre-BTS Cluster").length },
    { label: "Other events", tab: "events", target: "BTS, BSS + dept events", calc: (H) => H.events((e) => e.type !== "Pre-BTS Cluster").length },
    { label: "Media items", tab: "media", target: "100+ leadership interactions", calc: (H) => H.count("mkt", "media") },
  ],
};

export function buildHelper(records, events) {
  const rows = (v, t, pred) => records.filter((r) => r.vertical === v && r.tab === t && (!pred || pred(r.data || {})));
  return {
    count: (v, t, pred) => rows(v, t, pred).length,
    sum: (v, t, f, pred) => rows(v, t, pred).reduce((a, r) => a + (Number(r.data?.[f]) || 0), 0),
    latest: (v, t, f, pred) => {
      const rs = rows(v, t, pred).sort((a, b) => (b.data?.as_of || b.updated_at || "").localeCompare(a.data?.as_of || a.updated_at || ""));
      return Number(rs[0]?.data?.[f]) || 0;
    },
    events: (pred) => (events || []).filter((e) => (pred ? pred(e) : true)),
  };
}

// Task visibility
export const TASK_VISIBILITIES = [
  ["private", "Only me"],
  ["vertical", "My vertical"],
  ["team", "Whole team (cross-vertical)"],
  ["ceo", "CEO Office (escalate)"],
];
