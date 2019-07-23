const { db } = require("../util/admin");

const config = require("../util/config");

//initialize firebase
const firebase = require("firebase");
firebase.initializeApp(config);

const { validateSignupData, validateLoginData } = require("../util/validators");

//signup doctor

exports.signup = (req, res) => {
    const newDoctor = {
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        licenseId: req.body.licenseId,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    };

    const { valid, validateErrors } = validateSignupData(newDoctor);

    if (!valid) return res.status(400).json(validateErrors);

    //registration
    let doctorId, token;
    db.ref()
        .child("doctors")
        .orderByChild("licenseId")
        .equalTo(newDoctor.licenseId)
        .once("value")
        .then(snapshot => {
            //check if doctor with such license id exist
            if (snapshot.exists()) {
                const doctorData = snapshot.val();
                return res.status(400).json({ licenseId: "This license is already taken." });
                //register acc
            } else {
                // console.log(`Doctor ${data.user.uid} signed up successfully`);
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newDoctor.email, newDoctor.password);
            }
        })
        .then(data => {
            doctorId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(tokenId => {
            //put data to database
            token = tokenId;

            const doctorCredentials = {
                name: req.body.name,
                surname: req.body.surname,
                email: newDoctor.email,
                licenseId: newDoctor.licenseId,
                createdAt: new Date().toISOString()
            };
            return db.ref(`/doctors/${doctorId}`).set(doctorCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === "auth/email-already-in-use")
                return res.status(400).send({ email: "Email is already in use." });
            else
                return res.status(500).send({ general: "Something went wrong, please try again." });
        });
};

//login

exports.login = (req, res) => {
    const doctor = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, validateErrors } = validateLoginData(doctor);

    if (!valid) return res.status(400).json(validateErrors);

    firebase
        .auth()
        .signInWithEmailAndPassword(doctor.email, doctor.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found")
                return res
                    .status(403)
                    .json({ general: "Wrong email or password, please try again" });
            else return res.status(500).json({ error: err.code });
        });
};

//get all users

exports.getAllUsers = (req, res) => {
    db.ref("/Users")
        .once("value")
        .then(snapshot => {
            var users = snapshot.val();
            // res.status(200).send(users);
            return res.json(users);
        })
        .catch(err => {
            console.error(err);
            return res
                .status(500)
                .send({ error: "Something went wrong, please try again. " + err.code });
        });
};

//get doctor data
exports.getDoctorData = (req, res) => {
    const userData = req.doctorId;
    if (!userData) {
        console.error("Error while obtaining data, please try again.");
        return res.status(400).json({ error: "Error while obtaining data, please try again." });
    }

    return res.json({ userData });
};
