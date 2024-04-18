import "./post.scss";
import moment from "moment";
import Comments from "../comments/Comments";
import { Link } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { EditPost } from "../editPost/EditPost";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const {currentUser} = useContext(AuthContext);
  const queryClient = useQueryClient();
  const postRef = useRef(null);

  const { data: postData } = useQuery({
    queryKey: ['posts', post.id],
    queryFn: () =>
      makeRequest.get("/posts/" + post.id).then((res) => {
        return res.data;
      }),
  });

  const { data: likesData } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get("/likes?postId=" + post.id).then((res) => res.data),
  });

  const { data: commentsData } = useQuery({
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
        if (post.postedByUserId !== currentUser.id) {
          await makeRequest.post("/notifications", {
            postedByUserId: post.postedByUserId,
            postId: post.id,
            type: "like",
          });
        }
      } else {
        // Delete the notification if it exists
        await makeRequest.delete("/notifications", {
          data: {
            postedByUserId: post.postedByUserId,
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
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            {post.profilePic 
            ? (
              <img src={"/upload/" + post.profilePic} className="profilePic" /> )
            : <img src={"/upload/placeholder.png"} className="profilePic" />
            }
            <div className="details">
              <Link
                to={`/profile/${post.postedByUserId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">
                  {post.firstName} {post.lastName}
                </span>
              </Link>
              <span className="date">
                {moment(post.createdAt).fromNow()}
              </span>
            </div>
          </div>
          <div className="actions" ref={postRef}>
            <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
            {menuOpen && post.postedByUserId === currentUser.id && (
              <div className="actions-menu">
                <div className="menu-item" onClick={() => { setOpenEdit(true); setMenuOpen(false); }}>
                  <EditIcon />
                  <button>Edit</button>
                </div>
                <div className="menu-item" onClick={handleDelete}>
                  <DeleteIcon />
                  <button>Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="content">
          <p>{post.desc}</p>
          <img src={"/upload/" + post.img} alt="" />
        </div>
        <div className="info">
          <div className="item" onClick={handleLike}>
            {likesData ? (
              likesData.includes(currentUser.id) ? (
                <FavoriteOutlinedIcon
                  style={{ color: "red" }}
                  
                />
              ) : (
                <FavoriteBorderOutlinedIcon />
              )
            ) : (
              "Loading..."
            )}
            {likesData && likesData.length}{" "}
            {likesData && likesData.length <= 1 ? "Like" : "Likes"}
          </div>
          <div
            className="item"
            onClick={() => setCommentOpen(!commentOpen)}
          >
            <TextsmsOutlinedIcon />
            {commentsData ? (
              `${commentsData.length}
              ${commentsData.length <= 1 ? "Comment" : "Comments"}`
            ) : (
              "Loading..."
            )}
          </div>
        </div>
        {commentOpen && (
          <Comments post={post} postId={post.id} comments={commentsData} />
        )}
      </div>
      {openEdit && <EditPost setOpenEdit={setOpenEdit} post={postData} />}
    </div>
  );
};

export default Post;
