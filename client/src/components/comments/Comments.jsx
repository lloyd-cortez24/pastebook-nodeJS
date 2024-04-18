import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({ post, postId, comments }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    onSuccess: async () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      
      if (post.postedByUserId !== currentUser.id) {
        await makeRequest.post("/notifications", {
          postedByUserId: post.postedByUserId,
          postId: post.id,
          type: "comment",
        });
      }
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({desc, postId});
    setDesc("");
  };
  
  return (
    <div className="comments">
      <div className="write">
        {currentUser.profilePic 
        ? (
          <img src={"/upload/" + currentUser.profilePic} className="profilePic" /> )
        : <img src={"/upload/placeholder.png"} className="profilePic" />
        }
        <input
          type="text"
          placeholder="write a comment"
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
        />
        <button onClick={handleClick}>Send</button>
      </div>
      {comments.map((comment) => (
        <div className="comment" key={comment.id}>
          {comment.profilePic 
          ? (
            <img src={"/upload/" + comment.profilePic} className="profilePic" /> )
          : <img src={"/upload/placeholder.png"} className="profilePic" />
          }
          <div className="info">
            <span>
              {comment.firstName} {comment.lastName}
            </span>
            <p>{comment.desc}</p>
          </div>
          <span className="date">{moment(comment.createdAt).fromNow()}</span>
        </div>
      ))}
    </div>
  );
};

export default Comments;
