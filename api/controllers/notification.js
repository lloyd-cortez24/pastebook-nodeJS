import moment from "moment";
import { db } from "../connect.js"
import jwt from "jsonwebtoken";

export const getNotifications = (req, res) => {
    const q = "SELECT notifierUserId FROM notifications WHERE notifiedUserId = ?";

    db.query(q, [req.query.notifiedUserId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(notification => notification.notifiedUserId));
    });
}

export const addNotification = (req,res) => {
    const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Check if notifierUserId is different from notifiedUserId
    if (userInfo.id !== req.body.userId) {
      const q =
        "INSERT INTO notifications (`notifierUserId` , `notifiedUserId`, `postId`, `type`, `createdAt`) VALUES (?)";
      const values = [
        userInfo.id,
        req.body.userId,
        req.body.postId,
        req.body.type,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      ];

      db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Notification added successfully!");
      });
    } else {
      return res.status(400).json("Cannot create notification for self-action!");
    }
  });
}

export const deleteNotification = (req,res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM notifications WHERE `notifierUserId` = ? AND `notifiedUserId` = ? AND `postId` = ? AND `type` = ?";
    const values = [
      userInfo.id,
      req.body.userId,
      req.body.postId,
      req.body.type,
    ];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Notification deleted successfully");
    });
  });
}