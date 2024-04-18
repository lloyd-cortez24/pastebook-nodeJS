import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import Image from "../../assets/img.png";
import SettingsIcon from '@mui/icons-material/Settings';
import Posts from "../../components/posts/Posts";
import Placeholder from "../../assets/placeholder.png"; 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/authContext";
import { Update } from "../../components/update/Update";
import { EditEmail } from "../../components/editEmail/EditEmail";
import { EditPassword } from "../../components/editPassword/EditPassword";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openEditEmail, setOpenEditEmail] = useState(false);
  const [openEditPassword, setOpenEditPassword] = useState(false);
  const {currentUser} = useContext(AuthContext);
  const { id } = useParams();
  const postedByUserId = parseInt(id);
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const postRef = useRef(null);

  useEffect(() => {
    setFile(null);
    setError(null);
    setDesc("");

    queryClient.invalidateQueries(['user', postedByUserId]);
    queryClient.invalidateQueries(['relationship', postedByUserId]);
  }, [queryClient, postedByUserId]);

  const { isLoading: userLoading, data: userData } = useQuery({
    queryKey: ['user', postedByUserId],
    queryFn: () =>
      makeRequest.get("/users/profile/" + postedByUserId).then((res) => {
        return res.data;
      }),
  });

  const { isLoading: relationshipLoading, data: relationshipData } = useQuery({
    queryKey: ['relationship', postedByUserId],
    queryFn: () =>
      makeRequest.get("/relationships?followedUserId=" + postedByUserId).then((res) => {
        return res.data;
      }),
    enabled: !!postedByUserId,
  });

  const mutation = useMutation({
    mutationFn: async (following) => {
      if (following) {
        await makeRequest.delete("/relationships?userId=" + postedByUserId);
        // Delete notification if friend request is taken back
        const notificationData = {
          postedByUserId: postedByUserId,
          type: "friend_request",
        };
        await makeRequest.delete("/notifications", { data: notificationData });
      } else {
        await makeRequest.post("/relationships", { userId: postedByUserId });
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["relationship"] });

      if (!relationshipData.includes(currentUser.id)) {
        const notificationData = {
          postedByUserId: postedByUserId,
          type: "friend_request",
        };
        await makeRequest.post("/notifications", notificationData);
      }
    },
  });

  const postMutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const postToOtherMutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts/addToOther", newPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleFollow = () => {
    mutation.mutate(relationshipData.includes(currentUser.id));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!desc.trim()) {
      setError("Please enter some content before sharing.");
      return;
    }
    setError(null);

    let imgUrl = "";
    if (file) imgUrl = await upload();
    const targetUserId = postedByUserId;
    
    if (postedByUserId === currentUser.id) {
      postMutation.mutate({ desc, img: imgUrl, postedByUserId: currentUser.id, postedToUserId: targetUserId });
    } else {
      postToOtherMutation.mutate({ desc, img: imgUrl, postedByUserId: currentUser.id, targetUserId });
    }
    
    setDesc("");
    setFile(null);
  };
  
  const removeFile = () => {
    setFile(null);
  };

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch(err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (postRef.current && !postRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="profile">
      {userLoading || relationshipLoading ? (
        "Loading..."
      ) : (
        <>
          <div className="images">
            {userData.coverPic && (
              <img src={"/upload/" + userData.coverPic} alt="" className="cover" />
            )}
            {userData.profilePic 
            ? (
              <img src={"/upload/" + userData.profilePic} className="profilePic" /> )
            : <img src={"/upload/placeholder.png"} className="profilePic" />
            }
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
                      <span>{userData.bio}</span>
                  </div>
                </div>
                {postedByUserId === currentUser.id ? (
                  <button onClick={() => setOpenUpdate(true)}>Edit Profile</button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipData.includes(currentUser.id)
                      ? "Friends"
                      : "Add Friend"}
                  </button>
                )}
              </div>
              <div className="right" ref={postRef}>
              {currentUser.id === userData.id && (
                <>
                  <SettingsIcon className="settings" onClick={() => setMenuOpen(!menuOpen)} />
                  {menuOpen && (
                    <div className="settings-menu">
                      <div className="menu-item" onClick={() => { setOpenEditEmail(true); setMenuOpen(false); }}>
                        <button>Edit Email</button>
                      </div>
                      <div className="menu-item" onClick={() => { setOpenEditPassword(true); setMenuOpen(false); }}>
                        <button>Edit Password</button>
                      </div>
                    </div>
                  )}
                </>
              )}
              </div>
            </div>
          
            <div className="share">
              <div className="container">
                <div className="top">
                  <div className="left">
                  {currentUser.profilePic 
                  ? (
                    <img src={"/upload/" + currentUser.profilePic} className="profilePic" /> )
                  : <img src={"/upload/placeholder.png"} className="profilePic" />
                  }
                    <div className="share-container">
                      <input
                        type="text"
                        placeholder={postedByUserId !== currentUser.id ? `Share something to ${userData.firstName}...` : `What's on your mind?`}
                        onChange={(e) => setDesc(e.target.value)}
                        value={desc}
                      />
                    </div>
                  </div>
                  {error && <p className="error">{error}</p>}
                  <div className="right">
                    {file && (
                      <div className="file-preview">
                        <img className="file" alt="" src={URL.createObjectURL(file)} />
                        <button className="remove-file" onClick={removeFile}>X</button>
                      </div>
                    )}
                  </div>
                </div>
                <hr />
                <div className="bottom">
                  <div className="left">
                    <input type="file" id="file" style={{display:"none"}} onChange={e => setFile(e.target.files[0])} />
                    <label htmlFor="file">
                      <div className="item">
                        <img src={Image} alt="" />
                        <span>Add Image</span>
                      </div>
                    </label>
                  </div>
                  <div className="right">
                    <button onClick={handleClick}>Share</button>
                  </div>
                </div>
              </div>
            </div>

            <Posts postedByUserId={postedByUserId} />
          </div>
        </>
      )}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={userData} />}
      {openEditEmail && userData && <EditEmail setOpenEditEmail={setOpenEditEmail} user={userData} userId={postedByUserId} />}
      {openEditPassword && userData && <EditPassword setOpenEditPassword={setOpenEditPassword} user={userData} userId={postedByUserId} />}
    </div>
  );
};

export default Profile;
