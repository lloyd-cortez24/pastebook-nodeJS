import { db } from "../connect.js"
import jwt from "jsonwebtoken";

export const getUser = (req,res) => {
    const userId = req.params.userId;
    const q = "SELECT * FROM users WHERE id = ?";

    db.query(q, [userId], (err,data) => {
        if(err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found");
        const {password, ...info} = data[0];
        return res.json(info);
    })
}

export const updateUser = (req,res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q =
        "UPDATE users SET `firstName`=?,`lastName`=?,`gender`=?,`birthday`=?,`mobileNumber`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=?, `bio`=? WHERE id=? ";

        db.query(
        q,
        [
            req.body.firstName,
            req.body.lastName,
            req.body.gender,
            req.body.birthday,
            req.body.mobileNumber,
            req.body.city,
            req.body.website,
            req.body.profilePic,
            req.body.coverPic,
            req.body.bio,
            userInfo.id,
        ],
        (err, data) => {
            if (err) res.status(500).json(err);
            if (data.affectedRows > 0) return res.json("Updated!");
            return res.status(403).json("You can update only your profile!");
        }
        );
    });
}

export const updateEmail = (req, res) => {
    const { newEmail, currentPassword, userId } = req.body;

    const getUserQuery = "SELECT * FROM users WHERE id = ?";
    db.query(getUserQuery, [userId], (err, userData) => {
        if (err) return res.status(500).json(err);

        if (userData.length === 0) {
            return res.status(404).json("User not found!");
        }

        const user = userData[0];

        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json("Incorrect password!");
        }

        // Check if the new email is already associated with another user
        const checkEmailQuery = "SELECT * FROM users WHERE email = ? AND id != ?";
        db.query(checkEmailQuery, [newEmail, userId], (emailErr, emailData) => {
            if (emailErr) return res.status(500).json(emailErr);

            if (emailData.length > 0) {
                return res.status(400).json("Email already in use!");
            }

            const updateQuery = "UPDATE users SET email = ? WHERE id = ?";
            db.query(updateQuery, [newEmail, userId], (updateErr, updateData) => {
                if (updateErr) return res.status(500).json(updateErr);

                return res.status(200).json("Email updated successfully!");
            });
        });
    });
};

export const updatePassword = (req,res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q =
        "UPDATE users SET `password` = ? WHERE id=? ";

        db.query(
        q,
        [
            req.body.password,
            userInfo.id,
        ],
        (err, data) => {
            if (err) res.status(500).json(err);
            if (data.affectedRows > 0) return res.json("Updated!");
            return res.status(403).json("You can update only your profile!");
        }
        );
    });
}

export const searchUsers = (req, res) => {
    const searchTerm = req.query.q;
    const q = "SELECT id, firstName, lastName, profilePic FROM users WHERE firstName LIKE ? OR lastName LIKE ?";
    
    db.query(q, [`%${searchTerm}%`, `%${searchTerm}%`], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
};