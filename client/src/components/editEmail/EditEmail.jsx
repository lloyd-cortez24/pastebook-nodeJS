import "./editEmail.scss";
import { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const EditEmail = ({ setOpenEditEmail, user, userId }) => {
    console.log(user.id);
    const [texts, setTexts] = useState({
        newEmail: "",
        currentPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTexts((prev) => ({ ...prev, [name]: value }));
    };
    
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ newEmail, currentPassword, userId }) => {
          return makeRequest.put(`/users/${userId}`, { newEmail, password: currentPassword });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["user", userId] });
        },
      });

      const handleClick = async (e) => {
        e.preventDefault();
      
        const { newEmail, currentPassword, confirmPassword } = texts;
      
        if (!newEmail || !currentPassword || !confirmPassword) {
            // Display error message or prevent form submission
            return;
        }
      
        if (currentPassword !== confirmPassword) {
            // Display error message indicating password mismatch
            return;
        }
      
        // Pass the user object containing the necessary fields to the mutation function
        mutation.mutate({ newEmail, currentPassword, userId });
        setOpenEditEmail(false);
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
                <h1>Edit Email</h1>
                <div className="form-container">
                    <form>

                    <label>Enter new email address</label>
                    <input type="email" name="newEmail" onChange={handleChange} />

                    <label>Enter current password</label>
                    <input type="password" name="currentPassword" onChange={handleChange} />

                    <label>Confirm password</label>
                    <input type="password" name="confirmPassword" onChange={handleChange} />

                    <button onClick={handleClick}>Save</button>
                    </form>
                </div>
                <button className="close" onClick={() => setOpenEditEmail(false)}>
                    close
                </button>
            </div>
        </div>
    );
}