import "./post.scss";
import moment from "moment";
import Comments from "../comments/Comments";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const {currentUser} = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { isLoading: likesLoading, data: likesData } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get("/likes?postId=" + post.id).then((res) => res.data),
  });

  const { isLoading: commentsLoading, data: commentsData } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () =>
      makeRequest.get("/comments?postId=" + post.id).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (liked) => {
      if (liked) {
        return makeRequest.delete("/likes?postId=" + post.id);
      } else {
        return makeRequest.post("/likes", { postId: post.id });
      }
    },
    onSuccess: async () => {
      const isLiked = !likesData.includes(currentUser.id);
      await queryClient.invalidateQueries(["likes", post.id]);
      // Add or remove notification based on like status
      if (isLiked) {
        // Only create a notification if the notifierUserId and notifiedUserId are different
        if (post.userId !== currentUser.id) {
          await makeRequest.post("/notifications", {
            userId: post.userId,
            postId: post.id,
            type: "like",
          });
        }
      } else {
        // Delete the notification if it exists
        await makeRequest.delete("/notifications", {
          data: {
            userId: post.userId,
            postId: post.id,
            type: "like",
          },
        });
      }
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (postId) => {
      return makeRequest.delete("/posts/" + postId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleLike = () => {
    mutation.mutate(likesData.includes(currentUser.id))
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id)
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.profilePic} alt="" />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.firstName} {post.lastName}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {(menuOpen && post.userId === currentUser.id) && <button onClick={handleDelete}>Delete</button>}
        </div>
        <div className="content">
          <p>{post.desc}</p>
          <img src={"./upload/" + post.img} alt="" />
        </div>
        <div className="info">
          <div className="item">
            {likesLoading ? (
              "Loading..."
            ) : likesData?.includes(currentUser.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {likesData?.length}{" "}
            {likesData?.length <= 1 ? "Like" : "Likes"}
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {commentsLoading ? (
              "Loading..."
            ) : (
              `${commentsData?.length}
              ${commentsData?.length <= 1 ? "Comment" : "Comments"}`
            )}
          </div>
          {/* <div className="item">
            <ShareOutlinedIcon />
            Share
          </div> */}
        </div>
        {commentOpen && <Comments post={post} postId={post.id} comments={commentsData} />}
      </div>
    </div>
  );
};

export default Post;
