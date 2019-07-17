const functions = require("firebase-functions");

//initialzie express
const app = require("express")();
// const app = express();

const { signup, login, getAllUsers, getDoctorData } = require("./handlers/users");
const { getUserMedications, addMedication } = require("./handlers/medications");
const firebaseAuth = require("./util/firebaseAuth");

/**
 **FUNCTIONS
 **/

app.post("/signup", signup);
app.post("/login", login);
app.get("/Users", firebaseAuth, getAllUsers);
app.get("/doctor", firebaseAuth, getDoctorData);
app.get("/medications/:pesel", firebaseAuth, getUserMedications);
app.post("/medications/:pesel", firebaseAuth, addMedication);

exports.api = functions.region("europe-west2").https.onRequest(app);
