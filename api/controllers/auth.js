import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req,res) => {

    const q = "SELECT * FROM users WHERE email = ?";

    db.query(q,[req.body.email], (err,data) => {
        if(err) return res.status(500).json(err);

        // If user already exists
        if(data.length) return res.status(409).json("Email already exists.");

        // Create a new user
            // Hash the password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        const username = (req.body.firstName + req.body.lastName).toLowerCase();
        const mobileNumber = req.body.mobileNumber.toString();

        const q = "INSERT INTO users (`email`, `password`, `firstName`, `lastName`, `gender`, `birthday`, `username`, `mobileNumber`) VALUE (?)"

        const values = [req.body.email, hashedPassword, req.body.firstName, req.body.lastName, req.body.gender, req.body.birthday, username, mobileNumber];

        db.query(q,[values], (err,data) => {
            if(err) return res.status(500).json(err);

            return res.status(200).json("Registration Successful!");
        })
    });
}

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