const { db } = require("../util/admin");

// const config = require("../util/config");

exports.getUserMedications = (req, res) => {
    const userPesel = req.params.pesel;

    if (userPesel.trim() === "")
        return res.status(400).json({ user: "No user with such pesel, please try again" });

    db.ref()
        .child("medications")
        .orderByKey()
        .equalTo(userPesel)
        .once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const userMedications = snapshot.val();
                return res.status(200).send(userMedications);
            } else
                return res.status(404).json({ medications: "User has no medications prescribed" });
        })
        .catch(err => {
            res.status(500).send({ error: "Something went wrong, please try again" });
            console.error(err);
        });
};

exports.addMedication = (req, res) => {
    const userPesel = req.params.pesel;
    // if (!req.doctorEmail)
    //     return res.status(500).json({ error: "Cannot read doctor credentials, please try again." });

    db.ref()
        .child(`medications/${userPesel}`)
        .push()
        .set(
            {
                name: req.body.name,
                dose: req.body.dose,
                doseUnit: req.body.doseUnit,
                start: req.body.start,
                ends: req.body.ends,
                doctor: req.body.doctor
            },
            err => {
                if (!err) return res.status(200).json({ success: "Data added successfully." });

                console.error(err);
                return res.status(500).json({ error: "Something went wrong, please try again." });
            }
        );
};
