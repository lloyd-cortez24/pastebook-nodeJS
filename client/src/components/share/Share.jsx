import "./share.scss";
import Image from "../../assets/img.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { makeRequest } from "../../axios";

const Share = () => {
  const {currentUser} = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch(err) {
      console.log(err);
    }
  };

  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setDesc("");
      setFile(null);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (!desc.trim()) {
      setError("Please enter some content before sharing.");
      return;
    }
    setError(null);
    let imgUrl = "";
    if(file) imgUrl = await upload();
    mutation.mutate({desc, img:imgUrl});
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            <div className="profile-pic">
              <img
                src={currentUser.profilePic}
                alt=""
              />
            </div>
            <div className="share-container">
              <input type="text" placeholder={`What's on your mind, ${currentUser.firstName}?`} onChange={e => setDesc(e.target.value)} value={desc} />
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
  );
};

export default Share;
