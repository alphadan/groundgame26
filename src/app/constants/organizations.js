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
    }
  }
  },
];

export default ORGANIZATIONS;
