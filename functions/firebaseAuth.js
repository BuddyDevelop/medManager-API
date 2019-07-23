const { admin, db } = require("./admin");

// verify if doctor is logged in to do actions like add medications/receipts to users

module.exports = (req, res, next) => {
    let idToken;
    //if header does not contains Bearer that means it has not token either
    if (!(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")))
        return res.status(403).json({ errors: "Unauthorized" });

    idToken = req.headers.authorization.split("Bearer ")[1];

    admin
        .auth()
        .verifyIdToken(idToken)
        .then(decodedToken => {
            req.doctor = decodedToken;

            return db
                .ref("/doctors")
                .orderByKey()
                .equalTo(req.doctor.uid)
                .once("value");
        })
        .then(snapshot => {
            // return res.status(501).json(req.doctor.uid);
            if (!snapshot.exists()) return res.status(500).json({ error: "You are unauthorized." });

            req.doctorId = snapshot.val()[req.doctor.uid];
            req.doctorEmail = req.doctor.email;

            return next();
        })
        .catch(err => {
            console.error("Error while verifying token", err);
            return res.status(403).json(err);
        });
};
