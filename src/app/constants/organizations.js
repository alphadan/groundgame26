const ORGANIZATIONS = [
  {
    code: "gop",
    name: "Chester County Republican Committee",
    county_code: "15",
    county_name: "Chester County",
    chair_uid: "abc123"
    vice_chair_uid: "def456"
    chair_email: "HQ@RepublicanCCC.com"
    social_facebook: "https://facebook.com/chestergop"
    social_x: "https://x.com/chesCoGOP"
    areas: {
    "15": {
      name: "Western Chester GOP Area",
      chair_uid: "jWdwWvmh7xmVAzYPEDRk",
      vice_chair_uid: "uvw012",
      chair_email: "henselsmowers@yahoo.com",
      social_facebook: "https://www.facebook.com/RCCCArea15",
      precincts: {
        "005": { name: "Atglen", committeemen: ["uid111", "uid112"] },
        "225": { name: "East Fallowfield-E", committeemen: ["uid222", "uid223"] },
        "230": { name: "East Fallowfield-W", committeemen: ["uid224", "uid225"] },
        "440": { name: "Parkesburg North", committeemen: ["uid222", "uid223"] },
        "445": { name: "Parkesburg South", committeemen: ["uid224", "uid225"] },
        "535": { name: "Sadsbury-North", committeemen: ["uid222", "uid223"] },
        "540": { name: "Sadsbury-South", committeemen: ["uid224", "uid225"] },
        "545": { name: "West Sadsbury", committeemen: ["uid222", "uid223"] },
        "235": { name: "West Fallowfield", committeemen: ["uid224", "uid225"] },
      }
    },
    },
    congressional_districts: {
      "6": {
        name: "PA-06",
        representative_uid: "rep_uid_006",
        precincts: {}
      }
    },
    state_senate_districts: {
      "STS19": {
        name: "PA Senate District 19",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STS44": {
        name: "PA Senate District 44",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STS09": {
        name: "PA Senate District 09",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
    },
    state_house_districts: {
      "STH013": {
        name: "PA House District 13",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH026": {
        name: "PA House District 26",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH074": {
        name: "PA House District 74",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH155": {
        name: "PA House District 155",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH156": {
        name: "PA House District 156",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH157": {
        name: "PA House District 157",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH158": {
        name: "PA House District 158",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH160": {
        name: "PA House District 160",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
      "STH167": {
        name: "PA House District 167",
        representative_uid: "rep_uid_006",
        precincts: {}
      },
    },
  },
];

export default ORGANIZATIONS;
