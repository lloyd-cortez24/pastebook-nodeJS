import "./update.scss";
import { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export const Update = ({setOpenUpdate, user}) => {
    const [cover, setCover] = useState(null);
    const [profile, setProfile] = useState(null);
    const [texts, setTexts] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        birthday: user.birthday,
        mobileNumber: user.mobileNumber,
        city: user.city,
        website: user.website,
        bio: user.bio,
    });

    const upload = async (file) => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await makeRequest.post("/upload", formData);
          return res.data;
        } catch (err) {
          console.log(err);
        }
    };

    const handleChange = (e) => {
        setTexts((prev) => ({ ...prev, [e.target.name]: [e.target.value] }));
    };

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (user) => {
        return makeRequest.put("/users", user);
        },
        onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });

    const handleClick = async (e) => {
        e.preventDefault();
        
        let coverUrl;
        let profileUrl;
        coverUrl = cover ? await upload(cover) : user.coverPic;
        profileUrl = profile ? await upload(profile) : user.profilePic;
        
        mutation.mutate({ ...texts, coverPic: coverUrl, profilePic: profileUrl });
        setOpenUpdate(false);
        setCover(null);
        setProfile(null);
    }

    useEffect(() => {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
  
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }, []);

  return (
    <div className="update">
      <div className="wrapper">
        <h1>Edit Profile</h1>
        <div className="form-container">
          <form>
            <div className="files">
              <label htmlFor="cover">
                <span>Cover Picture</span>
                <div className="imgContainer">
                  <img
                    src={
                      cover
                        ? URL.createObjectURL(cover)
                        : "/upload/" + user.coverPic
                    }
                    alt=""
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="cover"
                style={{ display: "none" }}
                onChange={(e) => setCover(e.target.files[0])}
              />
              <label htmlFor="profile">
                <span>Profile Picture</span>
                <div className="imgContainer">
                  <img
                    src={
                      profile
                        ? URL.createObjectURL(profile)
                        : "/upload/" + user.profilePic
                    }
                    alt=""
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="profile"
                style={{ display: "none" }}
                onChange={(e) => setProfile(e.target.files[0])}
              />
            </div>
            {/* <label>Email</label>
            <input
              type="text"
              value={texts.email}
              name="email"
              onChange={handleChange}
            />
            <label>Password</label>
            <input
              type="text"
              value={texts.password}
              name="password"
              onChange={handleChange}
            /> */}
            <label>First Name</label>
            <input
              type="text"
              value={texts.firstName}
              name="firstName"
              onChange={handleChange}
            />
            <label>Last Name</label>
            <input
              type="text"
              value={texts.lastName}
              name="lastName"
              onChange={handleChange}
            />
            <label>Gender</label>
            <select className="gender" value={texts.gender} name="gender" onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            <label>Birthday</label>
            <input
              type="date"
              value={texts.birthday}
              name="birthday"
              max={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
            />
            <label>Mobile Number</label>
            <input
              type="text"
              value={texts.mobileNumber}
              name="mobileNumer"
              onChange={handleChange}
            />
            <label>Bio</label>
            <input
              type="text"
              value={texts.bio}
              name="bio"
              onChange={handleChange}
            />
            <button onClick={handleClick}>Update</button>
          </form>
        </div>
        <button className="close" onClick={() => setOpenUpdate(false)}>
          close
        </button>
      </div>
    </div>
  );
}