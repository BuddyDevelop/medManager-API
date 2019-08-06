const { db } = require("../util/admin");

exports.addReceipt = (req, res) => {
    const userPesel = req.params.pesel;

    const receipt = {
        doctor: req.body.doctor,
        doctorName: req.body.doctorName,
        created: req.body.created,
        realizeTo: req.body.realizeTo,
        medications: req.body.medications
    };

    const ref = db
        .ref()
        .child(`receipts/${userPesel}`)
        .push();
    const key = ref.key;

    ref.set(receipt, err => {
        if (!err) return res.status(200).json({ success: "Data added successfully.", id: key });

        console.error(err);
        return res.status(500).json({ error: "Something went wrong, please try again. " });
    });
};

exports.getUserReceipts = (req, res) => {
    const userPesel = req.params.pesel;

    if (userPesel.trim() === "")
        return res.status(404).json({ user: "No user with such pesel, please try again" });

    db.ref()
        .child("receipts")
        .orderByKey()
        .equalTo(userPesel)
        .once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const userReceipts = snapshot.val();
                return res.status(200).send(userReceipts);
            } else return res.status(404).json({ receipts: "User has no receipts prescribed" });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ error: "Something went wrong, please try again. " });
        });
};
