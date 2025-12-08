"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPACounties = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Full 67 PA counties — Chester active
const counties = [
    { code: "01", name: "Adams County", active: false },
    { code: "02", name: "Allegheny County", active: false },
    { code: "03", name: "Armstrong County", active: false },
    { code: "04", name: "Beaver County", active: false },
    { code: "05", name: "Bedford County", active: false },
    { code: "06", name: "Berks County", active: false },
    { code: "07", name: "Blair County", active: false },
    { code: "08", name: "Bradford County", active: false },
    { code: "09", name: "Bucks County", active: false },
    { code: "10", name: "Butler County", active: false },
    { code: "11", name: "Cambria County", active: false },
    { code: "12", name: "Cameron County", active: false },
    { code: "13", name: "Carbon County", active: false },
    { code: "14", name: "Centre County", active: false },
    { code: "15", name: "Chester County", active: true },
    { code: "16", name: "Clarion County", active: false },
    { code: "17", name: "Clearfield County", active: false },
    { code: "18", name: "Clinton County", active: false },
    { code: "19", name: "Columbia County", active: false },
    { code: "20", name: "Crawford County", active: false },
    { code: "21", name: "Cumberland County", active: false },
    { code: "22", name: "Dauphin County", active: false },
    { code: "23", name: "Delaware County", active: false },
    { code: "24", name: "Elk County", active: false },
    { code: "25", name: "Erie County", active: false },
    { code: "26", name: "Fayette County", active: false },
    { code: "27", name: "Forest County", active: false },
    { code: "28", name: "Franklin County", active: false },
    { code: "29", name: "Fulton County", active: false },
    { code: "30", name: "Greene County", active: false },
    { code: "31", name: "Huntingdon County", active: false },
    { code: "32", name: "Indiana County", active: false },
    { code: "33", name: "Jefferson County", active: false },
    { code: "34", name: "Juniata County", active: false },
    { code: "35", name: "Lackawanna County", active: false },
    { code: "36", name: "Lancaster County", active: false },
    { code: "37", name: "Lawrence County", active: false },
    { code: "38", name: "Lebanon County", active: false },
    { code: "39", name: "Lehigh County", active: false },
    { code: "40", name: "Luzerne County", active: false },
    { code: "41", name: "Lycoming County", active: false },
    { code: "42", name: "McKean County", active: false },
    { code: "43", name: "Mercer County", active: false },
    { code: "44", name: "Mifflin County", active: false },
    { code: "45", name: "Monroe County", active: false },
    { code: "46", name: "Montgomery County", active: false },
    { code: "47", name: "Montour County", active: false },
    { code: "48", name: "Northampton County", active: false },
    { code: "49", name: "Northumberland County", active: false },
    { code: "50", name: "Perry County", active: false },
    { code: "51", name: "Philadelphia County", active: false },
    { code: "52", name: "Pike County", active: false },
    { code: "53", name: "Potter County", active: false },
    { code: "54", name: "Schuylkill County", active: false },
    { code: "55", name: "Snyder County", active: false },
    { code: "56", name: "Somerset County", active: false },
    { code: "57", name: "Sullivan County", active: false },
    { code: "58", name: "Susquehanna County", active: false },
    { code: "59", name: "Tioga County", active: false },
    { code: "60", name: "Union County", active: false },
    { code: "61", name: "Venango County", active: false },
    { code: "62", name: "Warren County", active: false },
    { code: "63", name: "Washington County", active: false },
    { code: "64", name: "Wayne County", active: false },
    { code: "65", name: "Westmoreland County", active: false },
    { code: "66", name: "Wyoming County", active: false },
    { code: "67", name: "York County", active: false },
];
exports.seedPACounties = functions.https.onCall(async (_data, context) => {
    var _a, _b;
    if (!((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin)) {
        throw new functions.https.HttpsError("permission-denied", "Admin only");
    }
    const batch = admin.firestore().batch();
    counties.forEach((c) => {
        const ref = admin.firestore().collection("counties").doc(c.code);
        batch.set(ref, {
            code: c.code,
            name: c.name,
            active: c.active,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            total_voters: 0,
            chair_uid: null,
        }, { merge: true });
    });
    await batch.commit();
    return { success: true, message: "67 PA counties seeded" };
});
//# sourceMappingURL=index.js.map