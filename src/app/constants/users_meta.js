const users_meta = [
  {
    UID: "jWdwWvmh7xmVAzYPEDRk",
    display_name: "Dale Hensel",
    email: "henselsmowers@yahoo.com",
    phone: "+16108573816",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "chairman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["225"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: true,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Art Wright",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "chairman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["225"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: true,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["225"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Carol Kulp",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["225"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Robert Kulp",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["225"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Robert Knecht",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["230"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Nina Petro",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["230"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Dana Young",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["290"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Joshua Wall",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["290"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Sharon Wolf",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["440"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Nick Ohar",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["445"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Brendan Murphy",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["535"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Tricia Daller",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["535"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Richard Felice",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["545"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Joseph Felice",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["545"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Herb Myers",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["235"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Joseph Piazza",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["235"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
  {
    UID: "",
    display_name: "Herb Phillips",
    email: "",
    phone: "",
    photo_url: "",

    // ORGANIZATION & ROLE
    affiliation: "gop",
    role: "committeeman",

    // LOCATION
    county_code: "15",
    county_name: "Chester County",
    area_district: "15",
    precincts: ["235"],

    // PERMISSIONS (for UI)
    can_export_csv: true,
    can_view_phone: true,
    can_view_full_address: true,
    can_manage_team: false,

    // METADATA
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
    last_login: firebase.firestore.FieldValue.serverTimestamp(),
  },
];

export default users_meta;
