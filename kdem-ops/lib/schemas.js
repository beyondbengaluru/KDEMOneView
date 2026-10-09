// ============================================================
// KDEM OneView — the control panel.
// Datasets have ONE home vertical; tabs are queries (sources +
// filter), so one entry mirrors everywhere it belongs.
// ============================================================

export const CLUSTERS = ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi-Dharwad-Belagavi", "Kalaburagi", "Tumakuru", "Davanagere", "Cluster TBD"];
// Everything outside Bengaluru counts toward Beyond Bengaluru. "Cluster TBD"
// holds BB leads whose cluster isn't decided yet — they count, but get no tab.
export const BB_CLUSTERS = ["Mysuru", "Mangaluru", "Hubballi-Dharwad-Belagavi", "Kalaburagi", "Tumakuru", "Davanagere", "Cluster TBD"];
export const CLUSTER_TABS = BB_CLUSTERS.filter((c) => c !== "Cluster TBD");
export const HEAD_CLUSTERS = ["Mysuru", "Mangaluru", "Hubballi-Dharwad-Belagavi", "Kalaburagi"];
export const SHORT_CLUSTER = { "Hubballi-Dharwad-Belagavi": "HDB" };
export const cShort = (c) => SHORT_CLUSTER[c] || c;

export const FYS = ["2025-26", "2026-27"];
export const DEFAULT_FY = "2026-27";

export const POLICIES = ["IT Policy", "GCC Policy", "ESDM Policy", "Startup Policy"];
export const POLICY_HOME = { "IT Policy": "itgcc", "GCC Policy": "itgcc", "ESDM Policy": "esdm", "Startup Policy": "sni" };

const STAGES = ["Prospect", "Engaged", "Committed", "Grounded", "Dropped"];
const STATUS = ["Not started", "In progress", "Done", "On hold"];
export const LANDED = ["Grounded", "Operational", "Closed"];
const inBB = (d) => BB_CLUSTERS.includes(d.cluster);

export const CONTACT_COLS = [
  { key: "contact_name", label: "Contact person", type: "text", hide: true },
  { key: "contact_designation", label: "Designation", type: "text", hide: true },
  { key: "contact_phone", label: "Phone", type: "text", hide: true },
  { key: "contact_email", label: "Email", type: "text", hide: true },
  { key: "contact_linkedin", label: "LinkedIn URL", type: "text", hide: true },
];

// ---------- SHARED DATASETS ----------

// GCCs + companies: ONE dataset (home itgcc). `type` says what the company
// is; `kind` says whether it's a new set-up or an expansion; `stage` says
// whether it has landed. Views and counters are just filters over these.
const GCC_TYPES = ["GCC", "Nano GCC"];
const IT_TYPES = ["IT/ITeS", "ESDM / Manufacturing", "AVGC / Gaming", "Data Centre", "Support Centre", "Other"];
export const isGcc = (d) => GCC_TYPES.includes(d.type);
export const isExpansion = (d) => d.kind === "Expansion";
export const isLanded = (d) => LANDED.includes(d.stage);
export const isPipeline = (d) => !isLanded(d) && d.stage !== "Dropped";
const COMPANY_COLS = [
  { key: "name", label: "Company", type: "text" },
  { key: "type", label: "Type", type: "select", options: [...GCC_TYPES, ...IT_TYPES] },
  { key: "kind", label: "New / Expansion", type: "select", options: ["New", "Expansion"] },
  { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
  { key: "stage", label: "Stage", type: "select", options: STAGES },
  { key: "jobs", label: "Jobs / HC", type: "number" },
  ...CONTACT_COLS,
  { key: "notes", label: "Notes", type: "textarea" },
];
const COMPANIES = { key: "gccs", label: "Companies", home: "itgcc", hasContact: true, columns: COMPANY_COLS };
const GCCS = { ...COMPANIES, label: "GCCs", filter: (d) => !d.type || isGcc(d) };
const ITCOS = { ...COMPANIES, viewKey: "itcos", label: "IT / ITeS Companies", filter: (d) => d.type && !isGcc(d) };

const DATACENTRES = {
  key: "datacentres", label: "Data Centres", home: "itgcc", hasContact: true,
  columns: [
    { key: "name", label: "Data Centre", type: "text" },
    { key: "stage", label: "Stage", type: "select", options: ["Pipeline", "MoU", "Grounded", "Operational", "Cable landing station"] },
    { key: "cls", label: "Cable landing station", type: "select", options: ["Yes", "No"] },
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
  key: "awareness", label: "Awareness sessions", hasDocs: true,
  sources: POLICY_SOURCES("awareness"),
  sub: "Attach photos and attendance to each session",
  columns: [
    { key: "name", label: "Session", type: "text" },
    { key: "date", label: "Date", type: "date" },
    { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
    { key: "venue", label: "Venue / mode", type: "text" },
    { key: "companies", label: "Attendees", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};
const POLICY_STRATEGY = {
  key: "polstrategy", label: "Strategy", hasContact: true,
  sources: POLICY_SOURCES("polstrategy"),
  sub: "Blockers and the next action for each company",
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
    { key: "kind", label: "Kind", type: "select", options: ["International", "Domestic", "Industry roundtable"] },
    { key: "geography", label: "Country / State", type: "text" },
    { key: "date", label: "Date", type: "date" },
    { key: "stakeholders", label: "Planned external stakeholders", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["Planned", "Confirmed", "Done", "Dropped"] },
    { key: "leads", label: "Leads generated", type: "number" },
    { key: "notes", label: "Notes / outcomes", type: "textarea" },
  ],
});

// Headline numbers that the reports give only as totals (media coverage,
// startups registered…). One row per update, so the history stays; the
// dashboards read the latest value of each metric.
export const METRICS = {
  itgcc: ["GCC pipeline", "GCC partners onboarded", "Reports ready for publication", "Reports released"],
  esdm: ["Companies lined up for disbursement", "Companies in disbursement", "Disbursement value (₹ Cr)"],
  bb: ["Applications under processing with KITS", "Site visits in progress", "Applications in pipeline"],
  talent: ["Women connected (Women@Work)", "AI Industry-Academia EOIs", "GEC pitch decks"],
  sni: ["Startups engaged by KDEM", "Startups registered on Startup Karnataka", "Registrations verified by KITS",
    "Beyond Bengaluru startups registered", "Startups applied for incentives", "Startup database",
    "Survey responses", "Founders engaged", "KAN Cohort 2 startups", "KAN Cohort 3 applications",
    "Seed fund applications", "ELEVATE jury nominations", "BLUE applications", "BLUE VCs engaged",
    "BLUE startups pitched", "BLUE startups recognised"],
  mkt: ["Media coverage", "Strategic media interactions", "Hosted events", "Partnered events", "Industry stories",
    "Press releases", "Monthly newsletters", "CSR committed (₹ Cr)", "Fintech company leads",
    "Fintech company pipeline", "Fintech angel investors"],
};
export const METRIC_TAB = "metrics";
export const metricsTab = (home) => ({
  key: "metrics", label: "Numbers", home,
  sub: "Totals that aren't tracked row by row. Add a new row to update — the latest date wins.",
  columns: [
    { key: "metric", label: "Metric", type: "combo", options: METRICS[home] || [] },
    { key: "value", label: "Value", type: "number" },
    { key: "as_of", label: "As of", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
});

export const PROPOSAL_STATUSES = ["Drafting", "Submitted to KITS", "Under review", "Approved", "In execution", "Delivered", "On hold"];
export const PROPOSAL_TARGETS = ["KITS", "ITBT Department", "GoK", "KDEM Internal", "Other"];
export const PROPOSAL_CATEGORIES = ["Report", "CoE", "Infrastructure", "Policy", "Program", "Event", "Other"];
const PROPOSALS = { key: "proposals", label: "Proposals", isProposals: true };

// Manual entries of each vertical's Database. The Database tab also pulls
// in every company and contact already entered anywhere in the vertical.
export const dbTabs = (home) => [
  { key: "db_companies", label: "Company", home, noFy: true, hasContact: true,
    columns: [
      { key: "name", label: "Company", type: "text" },
      { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
      { key: "status", label: "Status", type: "select", options: ["Active in Karnataka", "Pipeline", "Past engagement", "Prospect"] },
      { key: "sector", label: "Sector", type: "text" },
      ...CONTACT_COLS,
      { key: "notes", label: "Notes", type: "textarea" },
    ]},
  { key: "db_people", label: "Contact", home, noFy: true,
    columns: [
      { key: "name", label: "Name", type: "text" },
      { key: "company", label: "Company / Org", type: "text" },
      { key: "designation", label: "Designation", type: "text" },
      { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
      { key: "contact_phone", label: "Phone", type: "text" },
      { key: "contact_email", label: "Email", type: "text" },
      { key: "contact_linkedin", label: "LinkedIn URL", type: "text" },
      { key: "context", label: "Met at / context", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ]},
];
const DATABASE_TAB = { key: "database", label: "Database", isDatabase: true };

// ---------- VERTICALS ----------

const JOBS = {
  key: "jobs", label: "Jobs", home: "bb",
  sub: "Jobs created — log by company where known, or as a cluster total",
  columns: [
    { key: "name", label: "Company / source", type: "text" },
    { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
    { key: "jobs", label: "Jobs", type: "number" },
    { key: "period", label: "Period", type: "select", options: ["Q1", "Q2", "Q3", "Q4", "H1", "H2"] },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};


// External agencies (role 'external', vertical = desk key) see only their desk.
export const DESKS = { pr_desk: "PR agency", digital_desk: "Digital media agency" };
const deskTab = (key, label, kinds) => ({
  key, label, home: "mkt", hasDocs: true,
  sub: "Shared with the agency — briefs, drafts and sign-off. Attach files to any item.",
  columns: [
    { key: "name", label: "Item", type: "text" },
    { key: "kind", label: "Type", type: "select", options: kinds },
    { key: "status", label: "Status", type: "select", options: ["Requested", "In progress", "For review", "Approved", "Published", "On hold"] },
    { key: "due", label: "Due", type: "date" },
    { key: "owner", label: "Owner", type: "text" },
    { key: "link", label: "Link", type: "text" },
    { key: "notes", label: "Notes / feedback", type: "textarea" },
  ],
});
export const DESK_TABS = {
  pr_desk: deskTab("pr_desk", "PR agency", ["Press release", "Media interview", "Op-ed", "Coverage report", "Media list", "Event PR", "Other"]),
  digital_desk: deskTab("digital_desk", "Digital media agency", ["Post", "Reel / video", "Carousel", "Campaign", "Newsletter", "Analytics report", "Other"]),
};

const STARTUPS = {
  key: "startups", label: "Startups", home: "sni", hasContact: true,
  columns: [
    { key: "name", label: "Startup", type: "text" },
    { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
    { key: "sector", label: "Sector", type: "text" },
    { key: "incentive", label: "Incentive applied", type: "select", options: ["Yes", "No"] },
    ...CONTACT_COLS,
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

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
          { key: "stage", label: "Stage", type: "select", options: ["Prospect", "Pipeline", "Warm", "Hot", "Closed", "Dropped"] },
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
      STARTUPS,
      { key: "seedfund", label: "Seed Fund", home: "sni",
        columns: [
          { key: "name", label: "Source / LOI", type: "text" },
          { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
          { key: "amount", label: "Amount (₹L)", type: "number" },
          { key: "status", label: "Status", type: "select", options: ["LOI Received", "Approved", "Disbursed", "Rejected", "KITS allocation"] },
          { key: "notes", label: "Notes", type: "textarea" },
        ]},
      { key: "programs", label: "Programs", home: "sni",
        columns: [
          { key: "name", label: "Startup / batch", type: "text" },
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
          { key: "name", label: "Program / batch", type: "text" },
          { key: "scheme", label: "Scheme", type: "select", options: ["NIPUNA", "Super 100 / IAAP", "Women@Work", "K-VLSI", "CHRO Roundtable", "Regional", "Other"] },
          { key: "trained", label: "Students / people", type: "number" },
          { key: "placed", label: "Placed (jobs / internships)", type: "number" },
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
        columns: [
          { key: "platform", label: "Platform", type: "select",
            options: ["LinkedIn", "X (Twitter)", "Instagram", "YouTube", "Facebook", "WhatsApp", "Website", "Newsletter", "Other"] },
          { key: "metric", label: "Metric", type: "select",
            options: ["Followers", "Subscribers", "Members", "Impressions", "Engagement", "Visits"] },
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
      DESK_TABS.pr_desk,
      DESK_TABS.digital_desk,
      DATABASE_TAB,
      PROPOSALS,
    ],
  },
};

// ---------- BEYOND BENGALURU SECTIONS ----------
// Each section is a view over a shared dataset. A pipeline company moved to
// "Grounded" moves itself from Pipeline to New companies / Expansions.
const sec = (key, label, tabDef, extra = {}) => ({ key, label, tabDef: { ...tabDef, viewKey: `bb-${key}`, label, sub: undefined, ...extra.tab }, ...extra });
export const BB_SECTIONS = [
  sec("new", "New companies", COMPANIES, {
    tab: { filter: (d) => isLanded(d) && !isExpansion(d) },
    defaults: { kind: "New", stage: "Grounded", type: "IT/ITeS" } }),
  sec("expansions", "Expansions", COMPANIES, {
    tab: { filter: (d) => isLanded(d) && isExpansion(d) },
    defaults: { kind: "Expansion", stage: "Grounded", type: "IT/ITeS" } }),
  sec("jobs", "Jobs", JOBS),
  sec("pipeline", "Pipeline", COMPANIES, {
    tab: { filter: isPipeline },
    defaults: { kind: "New", stage: "Engaged" } }),
  sec("dcs", "Data centres", DATACENTRES),
  sec("awareness", "Awareness sessions", { ...AWARENESS, sources: [{ vertical: "bb", tab: "awareness" }], home: "bb" }),
  sec("startups", "Startups", STARTUPS),
  sec("policyreg", "Policy registrations", POLICYREG_BASE),
];

// Custom BB sections are stored as records (vertical bb, tab bb_sections);
// their entries live under tab "cs_<slug>".
export const CUSTOM_COL_TYPES = [["text", "Text"], ["number", "Number"], ["date", "Date"], ["select", "Dropdown"], ["textarea", "Long text"]];
export const customSection = (row) => {
  const d = row.data || {};
  const cols = (d.columns || []).filter((c) => c.key && c.label).map((c) => ({
    key: c.key, label: c.label, type: c.type || "text",
    ...(c.type === "select" ? { options: (c.options || []).filter(Boolean) } : {}),
  }));
  return {
    key: d.key, label: d.name, custom: true, defId: row.id, def: d,
    tabDef: {
      key: d.key, viewKey: `bb-${d.key}`, label: d.name, home: "bb", hasContact: !!d.hasContact,
      columns: [
        ...(cols.length ? cols : [{ key: "name", label: "Name", type: "text" }]),
        { key: "cluster", label: "Cluster", type: "select", options: CLUSTERS },
        ...(d.hasContact ? CONTACT_COLS : []),
      ],
    },
  };
};

export const VERTICAL_KEYS = Object.keys(VERTICALS);

// Scopes for tasks / meetings / events: verticals + CEO Office
export const SCOPES = ["ceo", ...VERTICAL_KEYS];
const SCOPE_META = { ceo: { short: "CEO Office", color: "#B03050" } };
export const vName = (k) => SCOPE_META[k]?.short || VERTICALS[k]?.short || k;
export const vColor = (k) => SCOPE_META[k]?.color || VERTICALS[k]?.color || "#5B6963";

export const EVENT_TYPES = ["Pre-BTS Cluster", "Summit", "International", "Domestic", "Other"];

// Designations
export const ROLE_LABELS = { master: "Master", ceo: "CEO Office", lead: "Lead", member: "Member", cluster_head: "Cluster Head", external: "External agency" };
export const DESIGNATIONS = {
  ceo_office: ["CEO", "CAO", "HR", "Associate", "Fellow", "HR Admin"],
  vertical: ["VP", "Associate", "Fellow", "Intern"],
};
export const designationsFor = (role) =>
  role === "ceo" || role === "master" ? DESIGNATIONS.ceo_office
    : role === "external" ? ["Account lead", "Manager", "Executive", "Designer", "Writer"] : DESIGNATIONS.vertical;

export const PILL_COLORS = {
  Prospect: "#8B978F", Engaged: "#B07A1E", Committed: "#3457E0",
  Grounded: "#1F8A4C", Operational: "#1F8A4C", Dropped: "#C24040", Pipeline: "#8B978F",
  MoU: "#3457E0", Warm: "#B07A1E", Hot: "#E06B2D", Closed: "#1F8A4C", "Cable landing station": "#0E8F86",
  Outreach: "#B07A1E", Applied: "#3457E0", "Under review": "#B07A1E", Registered: "#1F8A4C",
  "Not started": "#8B978F", "In progress": "#3457E0", Done: "#1F8A4C", "On hold": "#C24040",
  "LOI Received": "#B07A1E", Approved: "#3457E0", Disbursed: "#1F8A4C", Rejected: "#C24040", "KITS allocation": "#7A5AF8",
  Selected: "#3457E0", Active: "#1F8A4C", Graduated: "#7A5AF8",
  Requested: "#B07A1E", "For review": "#7A5AF8", Published: "#1F8A4C",
  Planned: "#B07A1E", Confirmed: "#3457E0", Open: "#B07A1E",
  planned: "#B07A1E", confirmed: "#3457E0", done: "#1F8A4C", cancelled: "#C24040",
  todo: "#8B978F", inprogress: "#3457E0", high: "#C24040", medium: "#B07A1E", low: "#1F8A4C",
  Yes: "#1F8A4C", No: "#8B978F", New: "#3457E0", Expansion: "#7A5AF8",
  GCC: "#3457E0", "Nano GCC": "#0E8F86",
  Drafting: "#8B978F", "Submitted to KITS": "#3457E0", "In execution": "#7A5AF8", Delivered: "#1F8A4C",
  internal: "#3457E0", external: "#B07A1E", in_person: "#1F8A4C", online: "#3457E0",
  "Active in Karnataka": "#1F8A4C", "Past engagement": "#8B978F",
  master: "#B03050", ceo: "#B07A1E", lead: "#3457E0", member: "#8B978F", cluster_head: "#0E8F86", external: "#E06B2D",
};

// [key, label, hex] — the Master picks the team default; anyone can pick
// their own from the avatar menu. Any hex also works ("custom").
export const THEMES = [
  ["emerald", "Emerald", "#0C6B53"],
  ["forest", "Forest", "#2F7D32"],
  ["teal", "Teal", "#0E8F86"],
  ["ocean", "Ocean", "#0369A1"],
  ["sky", "Sky", "#0284C7"],
  ["cobalt", "Cobalt", "#2653D9"],
  ["indigo", "Indigo", "#4338CA"],
  ["plum", "Plum", "#6C3FC5"],
  ["magenta", "Magenta", "#A21CAF"],
  ["rose", "Rose", "#C2416E"],
  ["crimson", "Crimson", "#B4233C"],
  ["rust", "Rust", "#C2571B"],
  ["saffron", "Saffron", "#D97706"],
  ["olive", "Olive", "#6B7A1E"],
  ["chocolate", "Chocolate", "#7C4A2D"],
  ["graphite", "Graphite", "#3E5750"],
  ["slate", "Slate", "#475569"],
  ["midnight", "Midnight", "#1E293B"],
];
export const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v || "");
export function applyTheme(key) {
  const root = document.documentElement;
  const preset = THEMES.find((t) => t[0] === key);
  const hex = preset ? preset[2] : isHex(key) ? key : null;
  if (!hex || key === "emerald") {
    root.setAttribute("data-theme", "emerald");
    root.style.removeProperty("--brand-base");
    return;
  }
  root.setAttribute("data-theme", preset ? key : "custom");
  root.style.setProperty("--brand-base", hex);
}

// ---------- LIVE COUNTERS & GOALS ----------
// Computed straight from the trackers. The FIRST THREE of each vertical are
// its headline goals — they show on the All Verticals home page.
// H = { count(v,tab,pred), sum(v,tab,field,pred), events(pred), latest(v,tab,field,pred), metric(v,name) }
// tab → which vertical tab to open; sec → which Beyond Bengaluru section.
const gccs = (pred) => (H) => H.count("itgcc", "gccs", pred);
export const COUNTERS = {
  itgcc: [
    { label: "New GCCs", tab: "gccs", goal: 40,
      calc: gccs((d) => d.type === "GCC" && !isExpansion(d) && isLanded(d)),
      extra: (H) => { const n = H.count("itgcc", "gccs", (d) => d.type === "Nano GCC" && isLanded(d)); return n ? `+ ${n} Nano GCC` : ""; } },
    { label: "GCC expansions", tab: "gccs", goal: 10, calc: gccs((d) => isGcc(d) && isExpansion(d) && isLanded(d)) },
    { label: "Data centre pipeline", tab: "datacentres", goal: 7,
      calc: (H) => H.count("itgcc", "datacentres", (d) => ["Pipeline", "MoU", "Grounded"].includes(d.stage)),
      extra: (H) => { const n = H.count("itgcc", "datacentres", (d) => d.cls === "Yes"); return n ? `+ ${n} cable landing stations` : ""; } },
    { label: "Roadshows done", tab: "roadshows", goal: 6, calc: (H) => H.count("itgcc", "roadshows", (d) => d.status === "Done") },
    { label: "GCC pipeline", metric: "GCC pipeline", calc: (H) => H.metric("itgcc", "GCC pipeline") },
    { label: "GCC partners onboarded", metric: "GCC partners onboarded", calc: (H) => H.metric("itgcc", "GCC partners onboarded") },
  ],
  esdm: [
    { label: "Investment closed", unit: "₹Cr", tab: "investments", goal: 6000, calc: (H) => H.sum("esdm", "investments", "value", (d) => d.stage === "Closed") },
    { label: "Jobs from closed deals", tab: "investments", goal: 5000, calc: (H) => H.sum("esdm", "investments", "jobs", (d) => d.stage === "Closed") },
    { label: "Live pipeline", unit: "₹Cr", tab: "investments", goal: 8000, calc: (H) => H.sum("esdm", "investments", "value", (d) => !["Dropped", "Closed"].includes(d.stage)) },
    { label: "Global roadshows", tab: "roadshows", goal: 3, calc: (H) => H.count("esdm", "roadshows", (d) => d.kind === "International" && d.status === "Done") },
    { label: "Industry roundtables", tab: "roadshows", goal: 4, calc: (H) => H.count("esdm", "roadshows", (d) => d.kind === "Industry roundtable" && d.status === "Done") },
    { label: "Companies in disbursement", metric: "Companies in disbursement", calc: (H) => H.metric("esdm", "Companies in disbursement") },
  ],
  bb: [
    { label: "New companies", sec: "new", goal: 30,
      calc: gccs((d) => inBB(d) && isLanded(d) && !isExpansion(d) && !isGcc(d)),
      extra: (H) => { const n = H.count("itgcc", "gccs", (d) => inBB(d) && isLanded(d) && !isExpansion(d) && isGcc(d)); return n ? `+ ${n} GCC` : ""; } },
    { label: "Expansions", sec: "expansions", calc: gccs((d) => inBB(d) && isLanded(d) && isExpansion(d)) },
    { label: "Jobs created", sec: "jobs", goal: 750, calc: (H) => H.sum("bb", "jobs", "jobs", inBB) },
    { label: "Pipeline", sec: "pipeline", goal: 100, calc: gccs((d) => inBB(d) && isPipeline(d)) },
    { label: "Data centres", sec: "dcs", calc: (H) => H.count("itgcc", "datacentres", inBB) },
    { label: "Awareness sessions", sec: "awareness", goal: 60, calc: (H) => H.count("bb", "awareness", inBB) },
  ],
  talent: [
    { label: "NIPUNA students covered", tab: "programs", goal: 15000, calc: (H) => H.sum("talent", "programs", "trained", (d) => d.scheme === "NIPUNA" && d.status === "Done") },
    { label: "Women connected", metric: "Women connected (Women@Work)", goal: 1000, calc: (H) => H.metric("talent", "Women connected (Women@Work)") },
    { label: "CHRO roundtables", tab: "programs", goal: 2, calc: (H) => H.count("talent", "programs", (d) => d.scheme === "CHRO Roundtable" && d.status === "Done") },
    { label: "NIPUNA approved pipeline", tab: "programs", calc: (H) => H.sum("talent", "programs", "trained", (d) => d.scheme === "NIPUNA" && d.status === "In progress") },
    { label: "Women@Work jobs & internships", tab: "programs", calc: (H) => H.sum("talent", "programs", "placed", (d) => d.scheme === "Women@Work") },
    { label: "Industry LOIs", tab: "partnerships", goal: 25, calc: (H) => H.count("talent", "partnerships") },
  ],
  sni: [
    { label: "Startups registered", metric: "Startups registered on Startup Karnataka", goal: 1000, calc: (H) => H.metric("sni", "Startups registered on Startup Karnataka") },
    { label: "Seed fund mobilised", unit: "₹Cr", tab: "seedfund", goal: 15,
      calc: (H) => Math.round(H.sum("sni", "seedfund", "amount", (d) => d.status !== "KITS allocation") / 10) / 10 },
    { label: "BLUE events held", tab: "programs", goal: 4, calc: (H) => H.count("sni", "programs", (d) => d.program === "BLUE" && d.status === "Graduated") },
    { label: "Startups engaged", metric: "Startups engaged by KDEM", calc: (H) => H.metric("sni", "Startups engaged by KDEM") },
    { label: "Applied for incentives", metric: "Startups applied for incentives", goal: 100, calc: (H) => H.metric("sni", "Startups applied for incentives") },
    { label: "KAN Cohort 3 applications", metric: "KAN Cohort 3 applications", calc: (H) => H.metric("sni", "KAN Cohort 3 applications") },
  ],
  mkt: [
    { label: "LinkedIn followers", tab: "digital", goal: 40000, calc: (H) => H.latest("mkt", "digital", "value", (d) => d.platform === "LinkedIn" && d.metric === "Followers") },
    { label: "Pre-BTS cluster events", tab: "events", goal: 6, calc: (H) => H.events((e) => e.type === "Pre-BTS Cluster" && e.status === "done").length },
    { label: "Strategic media interactions", metric: "Strategic media interactions", goal: 100, calc: (H) => H.metric("mkt", "Strategic media interactions") },
    { label: "Media coverage", metric: "Media coverage", calc: (H) => H.metric("mkt", "Media coverage") },
    { label: "Instagram followers", tab: "digital", goal: 1500, calc: (H) => H.latest("mkt", "digital", "value", (d) => d.platform === "Instagram") },
    { label: "YouTube subscribers", tab: "digital", goal: 1200, calc: (H) => H.latest("mkt", "digital", "value", (d) => d.platform === "YouTube") },
  ],
};
// Short labels keep the home-page goal cards on one line each, so the
// progress bars line up across every vertical.
const SHORT_LABELS = {
  "GCC expansions": "Expansions", "Data centre pipeline": "DC pipeline", "Investment closed": "Invested",
  "Jobs from closed deals": "Jobs", "Live pipeline": "Pipeline", "Jobs created": "Jobs",
  "NIPUNA students covered": "NIPUNA trained", "Women connected": "Women@Work", "CHRO roundtables": "CHRO tables",
  "Startups registered": "Registered", "Seed fund mobilised": "Seed fund", "BLUE events held": "BLUE events",
  "LinkedIn followers": "LinkedIn", "Pre-BTS cluster events": "Pre-BTS", "Strategic media interactions": "Media",
  "New companies": "New cos",
};
Object.values(COUNTERS).flat().forEach((c) => { c.short = SHORT_LABELS[c.label] || c.label; });

// The Word report reads `target` as text
Object.values(COUNTERS).flat().forEach((c) => { c.target = c.goal ? `${c.unit === "₹Cr" ? "₹" : ""}${Number(c.goal).toLocaleString("en-IN")}${c.unit === "₹Cr" ? " Cr" : ""}` : "—"; });

export function buildHelper(records, events) {
  const rows = (v, t, pred) => records.filter((r) => r.vertical === v && r.tab === t && (!pred || pred(r.data || {})));
  const newest = (rs, key) => rs.sort((a, b) => (b.data?.[key] || b.updated_at || "").localeCompare(a.data?.[key] || a.updated_at || ""));
  return {
    count: (v, t, pred) => rows(v, t, pred).length,
    sum: (v, t, f, pred) => rows(v, t, pred).reduce((a, r) => a + (Number(r.data?.[f]) || 0), 0),
    latest: (v, t, f, pred) => Number(newest(rows(v, t, pred), "as_of")[0]?.data?.[f]) || 0,
    metric: (v, name) => Number(newest(rows(v, "metrics", (d) => d.metric === name), "as_of")[0]?.data?.value) || 0,
    metricDate: (v, name) => newest(rows(v, "metrics", (d) => d.metric === name), "as_of")[0]?.data?.as_of || "",
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
