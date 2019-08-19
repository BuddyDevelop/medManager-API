const { db } = require("../util/admin");

exports.addPrescription = (req, res) => {
    const userPesel = req.params.pesel;

    const prescription = {
        doctor: req.body.doctor,
        doctorName: req.body.doctorName,
        created: req.body.created,
        realizeTo: req.body.realizeTo,
        medications: req.body.medications
    };

    const ref = db
        .ref()
        .child(`prescriptions/${userPesel}`)
        .push();
    const key = ref.key;

    ref.set(prescription, err => {
        if (!err) return res.status(200).json({ success: "Data added successfully.", id: key });

        console.error(err);
        return res.status(500).json({ error: "Something went wrong, please try again. " });
    });
};

exports.getUserPrescriptions = (req, res) => {
    const userPesel = req.params.pesel;

    if (userPesel.trim() === "")
        return res.status(404).json({ user: "No user with such pesel, please try again" });

    db.ref()
        .child("prescriptions")
        .orderByKey()
        .equalTo(userPesel)
        .once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const userPrescriptions = snapshot.val();
                return res.status(200).send(userPrescriptions);
            } else
                return res
                    .status(404)
                    .json({ prescriptions: "User has no prescriptions prescribed" });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ error: "Something went wrong, please try again. " });
        });
};
