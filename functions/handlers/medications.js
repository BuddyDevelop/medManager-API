const { db } = require("../util/admin");

const { validateMedicationData, objectHasEmptyValues } = require("../util/validators");

exports.getUserMedications = (req, res) => {
    const userPesel = req.params.pesel;

    if (userPesel.trim() === "")
        return res.status(404).json({ user: "No user with such pesel, please try again" });

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
            console.error(err);
            return res.status(500).send({ error: "Something went wrong, please try again. " });
        });
};

exports.addMedication = (req, res) => {
    const userPesel = req.params.pesel;

    const medication = {
        name: req.body.name,
        dose: req.body.dose,
        doseUnit: req.body.doseUnit,
        start: req.body.start,
        ends: req.body.ends,
        doctor: req.body.doctor
    };

    const { valid, validateErrors } = validateMedicationData(medication);

    if (!valid) return res.status(400).json(validateErrors);

    db.ref()
        .child(`medications/${userPesel}`)
        .push()
        .set(medication, err => {
            if (!err) return res.status(200).json({ success: "Data added successfully." });

            console.error(err);
            return res.status(500).json({ error: "Something went wrong, please try again. " });
        });
};

exports.deleteUserMedication = (req, res) => {
    const userPesel = req.params.pesel;
    const medId = req.body.id;
    const medCreatorEmail = req.body.email;

    const recordRef = db.ref(`medications/${userPesel}/${medId}`);
    //check if same doctor created med which is supossed to be deleted
    recordRef
        .once("value")
        .then(snapshot => {
            if (!snapshot.exists())
                return res
                    .status(404)
                    .json({ error: "Medication not found, please refresh page and try again." });

            if (snapshot.val().doctor !== medCreatorEmail)
                return res
                    .status(403)
                    .json({ error: "You can only delete medications added by you." });
            else
                recordRef.remove().then(() => {
                    return res.status(200).json({ success: "Data removed successfully" });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: "Something went wrong, please try again. " });
        });
};

exports.updateMedication = (req, res) => {
    if (!req.doctorEmail) return res.status(403).json({ error: "You are unauthorized." });

    const userPesel = req.params.pesel;
    const medicationId = req.body.id;
    const medicationData = req.body.data;

    const { valid, validateErrors } = objectHasEmptyValues(medicationData);

    if (!valid) return res.status(400).json(validateErrors);

    const recordRef = db.ref(`medications/${userPesel}/${medicationId}`);

    recordRef
        .once("value")
        .then(snapshot => {
            if (!snapshot.exists())
                return res
                    .status(404)
                    .json({ error: "Medication not found, please refresh page and try again." });

            if (snapshot.val().doctor !== req.doctorEmail)
                return res
                    .status(403)
                    .json({ error: "You can only edit medications added by you." });

            recordRef.update(medicationData, err => {
                if (!err) return res.status(200).json({ success: "Data updated successfully." });

                console.error(err);
                return res.status(500).json({ error: "Something went wrong, please try again. " });
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: "Something went wrong, please try again. " });
        });
};
