import "./editPost.scss";
import { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const EditPost = ({ setOpenEdit, post }) => {
    const [texts, setTexts] = useState({
        desc: post.desc,
        img: post.img,
    });

    const handleChange = (e) => {
        setTexts((prev) => ({ ...prev, [e.target.name]: [e.target.value] }));
    };

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (updatedPost) => {
          return makeRequest.put("/posts/" + updatedPost.id, updatedPost);
        },
        onSuccess: () => {
          queryClient.refetchQueries(['posts', post.id]);
          setOpenEdit(false);
        },
    });      

    const handleClick = async (e) => {
        e.preventDefault();
        mutation.mutate({ ...texts, id: post.id });
        setOpenEdit(false);
    };

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
                <h1>Edit Post</h1>
                <div className="form-container">
                    <form>
                    <label>Description</label>
                    <input
                        type="text"
                        value={texts.desc}
                        name="desc"
                        onChange={handleChange}
                    />
                    <img src={"/upload/" + texts.img} alt="" />
                    <button onClick={handleClick}>Save</button>
                    </form>
                </div>
                <button className="close" onClick={() => setOpenEdit(false)}>
                    close
                </button>
            </div>
        </div>
    );
};
