import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from "../../axios";

const Posts = ({postedByUserId}) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['posts'],
    queryFn: () =>
    makeRequest.get("/posts?postedByUserId=" + postedByUserId).then(res => {
      return res.data;
    })
  });

  return (
    <div className="posts">
      {error
        ? console.log(error)
        : isLoading
        ? "Loading..."
        : data.map((post, index) => <Post post={post} postedByUserId={postedByUserId} key={`${post.id}-${index}`} />)}
    </div>
  );
};

export default Posts;