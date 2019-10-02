const functions = require("firebase-functions");

const { admin, db } = require("./util/admin");

//cors is needed bc of CORS policy
const cors = require("cors");

//initialzie express
const app = require("express")();
app.use(cors());

const { signup, login, getAllUsers, getDoctorData } = require("./handlers/users");
const {
    getUserMedications,
    addMedication,
    deleteUserMedication,
    updateMedication
} = require("./handlers/medications");
const { addPrescription, getUserPrescriptions } = require("./handlers/prescriptions");
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
app.delete("/medications/:pesel", firebaseAuth, deleteUserMedication);
app.patch("/medications/:pesel", firebaseAuth, updateMedication);
app.get("/prescriptions/:pesel", firebaseAuth, getUserPrescriptions);
app.post("/prescriptions/:pesel", firebaseAuth, addPrescription);

//push notification to user device on new medication added
exports.sendMedicationNotification = functions
    .region("europe-west2")
    .database.ref("/medications/{userPesel}/{medId}")
    .onCreate((event, context) => {
        // .onWrite((event, context) => {
        const userPesel = context.params.userPesel;

        return db
            .ref("Users")
            .orderByChild("pesel")
            .equalTo(userPesel)
            .once("value")
            .then(snapshot => {
                if (!snapshot.exists()) return;

                var userTokens = [];

                snapshot.forEach(childSnapshot => {
                    userTokens.push(childSnapshot.val().token);
                });

                if (userTokens.length === 0) return;

                // console.log(`Token is as follow: ${userTokens[0]}`);

                const payload = {
                    data: {
                        title: "New medication!",
                        message: `${event._data.name}, ${event._data.doseUnit}, ${event._data.dose}`
                    }
                };

                return admin.messaging().sendToDevice(userTokens, payload);
            });
    });

//push notification to user device on new prescription added
exports.sendPrescriptionNotification = functions
    .region("europe-west2")
    .database.ref("/prescriptions/{userPesel}/{medId}")
    .onCreate((event, context) => {
        // .onWrite((event, context) => {
        const userPesel = context.params.userPesel;

        return db
            .ref("Users")
            .orderByChild("pesel")
            .equalTo(userPesel)
            .once("value")
            .then(snapshot => {
                if (!snapshot.exists()) return;

                var userTokens = [];

                snapshot.forEach(childSnapshot => {
                    userTokens.push(childSnapshot.val().token);
                });

                if (userTokens.length === 0) return;

                const payload = {
                    data: {
                        title: "New prescription!",
                        createdAt: event._data.created,
                        createdBy: event._data.doctorName,
                        realizeTo: event._data.realizeTo
                    }
                };

                return admin.messaging().sendToDevice(userTokens, payload);
            });
    });

exports.api = functions.region("europe-west2").https.onRequest(app);
