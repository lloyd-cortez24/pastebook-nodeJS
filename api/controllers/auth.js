import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "./mailer.js";

export const register = (req,res) => {
    const q = "SELECT * FROM users WHERE email = ?";
    const verificationToken = jwt.sign({ email: req.body.email }, "verificationSecret", { expiresIn: '1d' });

    db.query(q,[req.body.email], (err,data) => {
        if(err) return res.status(500).json(err);
        if(data.length) return res.status(409).json("Email already exists.");

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        const username = (req.body.firstName + req.body.lastName).toLowerCase();
        const mobileNumber = req.body.mobileNumber.toString();

        const q = "INSERT INTO users (`email`, `password`, `firstName`, `lastName`, `gender`, `birthday`, `username`, `mobileNumber`, `verificationToken`) VALUE (?)"

        const values = [req.body.email, hashedPassword, req.body.firstName, req.body.lastName, req.body.gender, req.body.birthday, username, mobileNumber, verificationToken];

        db.query(q,[values], (err,data) => {
            if(err) return res.status(500).json(err);
            sendVerificationEmail(req.body.email, verificationToken);

            return res.status(200).json("Registration Successful! Please verify your email.");
        })
    });
};

export const verifyEmail = (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json("Invalid token.");
    }

    jwt.verify(token, "verificationSecret", (err, decoded) => {
        if (err) {
            return res.status(400).json("Invalid or expired token.");
        }

        const email = decoded.email;

        // Update emailVerified to true in the database
        const q = "UPDATE users SET emailVerified = ? WHERE email = ?";
        db.query(q, [true, email], (err, data) => {
            if (err) return res.status(500).json(err);

            return res.redirect("http://localhost:3000/login"); // Redirect to login page after email verification
        });
    });
};

export const login = (req,res) => {

    const q = "SELECT * FROM users WHERE email = ?"

    db.query(q,[req.body.email], (err,data) => {
        if(err) return res.status(500).json(err);

        // If user does not exists
        if(data.length === 0) return res.status(404).json("User not found!");

        // If user exists, check password
        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);

        if (!checkPassword) return res.status(400).json("Invalid email or password.");

        const token  = jwt.sign({ id:data[0].id }, "secretkey");

        const { password, ...others } = data[0];

        res.cookie("accessToken", token, {
            httpOnly: true,
        })
        .status(200)
        .json(others);
    })

}

export const logout = (req,res) => {
    res.clearCookie("accessToken", {
        secure: true,
        sameSite: "none"
    }).status(200).json("Logout successful");
}