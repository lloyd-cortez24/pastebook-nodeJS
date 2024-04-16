import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { Update } from "../../components/update/Update";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const {currentUser} = useContext(AuthContext);
  const userId = parseInt(useLocation().pathname.split("/")[2]);
  const queryClient = useQueryClient();

  const { isLoading: userLoading, data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      makeRequest.get("/users/profile/" + userId).then((res) => {
        return res.data;
      }),
  });

  const { isLoading: relationshipLoading, data: relationshipData } = useQuery({
    queryKey: ['relationship'],
    queryFn: () =>
      makeRequest.get("/relationships?followedUserId=" + userId).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: async (following) => {
      if (following) {
        await makeRequest.delete("/relationships?userId=" + userId);
        // Delete notification if friend request is taken back
        const notificationData = {
          userId: userId,
          type: "friend_request",
        };
        await makeRequest.delete("/notifications", { data: notificationData });
      } else {
        await makeRequest.post("/relationships", { userId });
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["relationship"] });

      if (!relationshipData.includes(currentUser.id)) {
        const notificationData = {
          userId: userId,
          type: "friend_request",
        };
        await makeRequest.post("/notifications", notificationData);
      }
    },
  });

  const handleFollow = () => {
    mutation.mutate(relationshipData.includes(currentUser.id));
  };

  return (
    <div className="profile">
      {userLoading || relationshipLoading ? (
        "Loading..."
      ) : (
        <>
          <div className="images">
            {userData.coverPic && (
              <img src={userData.coverPic} alt="" className="cover" />
            )}
            {userData.profilePic && (
              <img src={userData.profilePic} alt="" className="profilePic" />
            )}
          </div>
          <div className="profileContainer">
            <div className="uInfo">
              <div className="left">
                <a href="http://facebook.com">
                  <FacebookTwoToneIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <InstagramIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <TwitterIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <LinkedInIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <PinterestIcon fontSize="large" />
                </a>
              </div>
              <div className="center">
                <span>
                  {userData.firstName} {userData.lastName}
                </span>
                <div className="info">
                  <div className="item">
                    <PlaceIcon />
                    <span>{userData.city}</span>
                  </div>
                  <div className="item">
                    <LanguageIcon />
                    <span>{userData.website}</span>
                  </div>
                </div>
                {userId === currentUser.id ? (
                  <button onClick={() => setOpenUpdate(true)}>Edit Profile</button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipData.includes(currentUser.id)
                      ? "Friends"
                      : "Add Friend"}
                  </button>
                )}
              </div>
              <div className="right">
                <EmailOutlinedIcon />
                <MoreVertIcon />
              </div>
            </div>
            <Posts userId={userId} />
          </div>
        </>
      )}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={userData} />}
    </div>
  );
};

export default Profile;
