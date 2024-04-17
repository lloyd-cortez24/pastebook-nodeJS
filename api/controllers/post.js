import { db } from "../connect.js"
import { useParams } from "react-router-dom";
import moment from "moment/moment.js";
import jwt from "jsonwebtoken";

export const getPosts = (req, res) => {
  const postedByUserId = req.query.postedByUserId;
  // const postedToUserId = req.query.postedToUserId;

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    let q;
    let values;

    if (postedByUserId === userInfo.id && postedToUserId === userInfo.id) {
      // Fetch posts for own profile only
      q = `SELECT DISTINCT p.*, u.id AS postedByUserId, firstName, lastName, username, profilePic 
        FROM posts AS p 
        JOIN users AS u ON (u.id = p.postedToUserId) 
        WHERE (p.postedByUserId = ? AND p.postedToUserId = ?) 
        ORDER BY p.createdAt DESC`;
      values = [userInfo.id, userInfo.id];
    } else if (postedByUserId && postedByUserId !== "undefined") {
      // Fetch posts for a specific user including posts by other users on their profile
      q = `SELECT DISTINCT p.*, u.id AS postedByUserId, firstName, lastName, username, profilePic 
        FROM posts AS p 
        JOIN users AS u ON (u.id = p.postedByUserId) 
        WHERE (p.postedByUserId = ? OR p.postedToUserId = ?) 
        ORDER BY p.createdAt DESC`;
      values = [postedByUserId, postedByUserId];
    } else {
      // Fetch posts for the current user and the users they follow
      q = `SELECT DISTINCT p.*, u.id AS postedByUserId, firstName, lastName, username, profilePic 
        FROM posts AS p 
        JOIN users AS u ON (u.id = p.postedByUserId AND u.id = p.postedToUserId) 
        LEFT JOIN relationships AS r ON (p.postedByUserId = r.followedUserId) 
        WHERE r.followerUserId = ? OR p.postedByUserId = ? 
        ORDER BY p.createdAt DESC`;
      values = [userInfo.id, userInfo.id];
    }

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const getSpecificPost = (req, res) => {
  const postId = req.params.id;

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `SELECT p.*, u.id AS postedByUserId, firstName, lastName, profilePic 
               FROM posts AS p 
               JOIN users AS u ON (u.id = p.postedByUserId) 
               WHERE p.id = ?`;
    const values = [postId];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(404).json("Post not found.");
      return res.status(200).json(data[0]);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO posts (`desc`, `postedByUserId`, `postedToUserId`, `img`, `createdAt`) VALUES (?)";
    const values = [
      req.body.desc,
      userInfo.id,
      userInfo.id,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ]

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};

export const addPostToOther = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { desc, img, targetUserId } = req.body;
    const postedToUserId = targetUserId;
    const q = "INSERT INTO posts (`desc`, `postedByUserId`, `postedToUserId`, `img`, `createdAt`) VALUES (?, ?, ?, ?, ?)";
    const values = [
      desc,
      userInfo.id,
      postedToUserId,
      img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};

export const updatePost = (req, res) => {
  const postId = req.params.id;

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { desc, img } = req.body;

    const q = "UPDATE posts SET `desc` = ?, `img` = ? WHERE `id` = ? AND `postedByUserId` = ?";
    const values = [desc, img, postId, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows === 0) return res.status(403).json("You can update only your post");
      return res.status(200).json("Post has been updated.");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM posts WHERE `id`= ? AND `postedByUserId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if(data.affectedRows > 0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post")
    });
  });
};