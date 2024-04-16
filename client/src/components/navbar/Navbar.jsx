import "./navbar.scss";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await makeRequest("/notifications", {
          params: { notifiedUserId: currentUser.id },
        });
        setNotifications(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [currentUser.id]);

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "like":
        return (
          <React.Fragment>
            {notification.firstName} {notification.lastName} <span className="notifText">liked your post.</span>
          </React.Fragment>
        );
      case "comment":
        return (
          <React.Fragment>
            {notification.firstName} {notification.lastName} <span className="notifText">commented on your post.</span>
          </React.Fragment>
        );
      case "friend_request":
        return (
          <React.Fragment>
            {notification.firstName} {notification.lastName} <span className="notifText">sent you a friend request.</span>
          </React.Fragment>
        );
      default:
        return "Unknown notification";
    }
  };

  const handleSearch = async (term) => {
    const { data, error } = await makeRequest(`/users/search?q=${term}`);
    if (error) {
      console.error("Search error:", error);
    } else {
      setSearchResults(data);
    }
  };  

  const handleChange = async (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() !== "") {
      await handleSearch(newSearchTerm);
    } else {
      setSearchResults([]);
    }
  };

  const handleProfileClick = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  
  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <div className="pastebook">
            <span className="paste">paste</span>
            <span className="book">book</span>
          </div>
        </Link>
        <div className="search-container">
          <div className="search">
            <SearchOutlinedIcon />
            <input
              type="text"
              placeholder="Search Pastebook"
              value={searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="search-results">
            {searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map((user) => (
                  <Link
                    to={`/profile/${user.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                    onClick={handleProfileClick}
                  >
                  <div key={user.id} className="search-result-item">
                    <img src={user.profilePic} alt="" />
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="right">
        <div className="moon">
          {darkMode ? (
            <WbSunnyOutlinedIcon onClick={toggle} />
          ) : (
            <DarkModeOutlinedIcon onClick={toggle} />
          )}
        </div>
        <div className="notif" onClick={() => setShowNotifications(!showNotifications)}>
          <NotificationsOutlinedIcon />
          {showNotifications && (
            <div className="notification-menu">
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <img src={notification.profilePic} alt="" />
                  <div>
                    <span>{renderNotificationContent(notification)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="user">
          <button onClick={handleLogout}>
            <img src={currentUser.profilePic} alt="" />
          </button>
        </div>
      </div>
  </div>
  );
};

export default Navbar;