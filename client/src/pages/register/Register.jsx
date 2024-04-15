import { Link } from "react-router-dom";
import "./register.scss";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import Logo from "../../assets/pastebookLogo.png";
import People from "../../assets/people.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthday: "",
    confirmPassword: "",
    mobileNumber: "",
    bio: "",
  });

  const [err, setErr] = useState(null);
  const [formError, setFormError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    // Validate email format
    if (name === "email") {
      // Regular expression for email format validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        setEmailError("Please enter a valid email address.");
        return;
      } else {
        setEmailError("");
      }
    };

    // Validate mobile number length
    if (name === "mobileNumber") {
      // Restrict input to numbers only
      if (!/^\d*$/.test(value)) {
        setMobileError("Mobile number should contain only numbers.");
        return;
      } else if (value.length !== 11) {
        setMobileError("Mobile number should be exactly 11 characters.");
        return;
      } else {
        setMobileError("");
      }
      // Truncate to 11 characters if it exceeds
      newValue = value.slice(0, 11);
    };

    // Validate password length
    if (name === "password") {
      if (value.length < 8) {
        setPasswordError("Password should be at least 8 characters long.");
        return;
      } else {
        setPasswordError("");
      }
    };

    // Validate confirmPassword
    if (name === "confirmPassword") {
      if (value !== inputs.password) {
        setConfirmPasswordError("Passwords do not match.");
        return;
      } else {
        setConfirmPasswordError("");
      }
    };

    setInputs(prev => ({...prev, [name]: newValue}));
  };

  const resetForm = () => {
    setInputs({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      gender: "",
      birthday: "",
      confirmPassword: "",
      mobileNumber: "",
    });
    setErr(null);
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setMobileError("");
    setFormError("");
  };

  const handleClick = async e => {
    e.preventDefault();

    for (const key in inputs) {
      if (inputs[key] === "") {
        setFormError("Please fill in all fields.");
        return;
      } else {
        setFormError("");
      }
    }

    try {
      await axios.post("http://localhost:8800/api/auth/register", inputs);
        // resetForm();
        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          showConfirmButton: false,
          timer: 1500
        });
    } catch (err) {
      setErr(err.response.data);
    };
  };

  console.log(err);

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1 className="tagline">Be where the world is going</h1>
          <img className="people" src={People} alt="" />
          <div>
            <span className="account">Already have an account?</span>
            <Link to="/login">
            <button className="btn">Login</button>
            </Link>
          </div>
        </div>

        <div className="right">
          <div className="identity">
            <img className="logo" src={Logo} alt="" />
            <h2 className="pastebook">
              <span className="paste">paste</span>
              <span className="book">book</span>
            </h2>
          </div>
          <h1 className="create">Create account</h1>
          <form>
            <div className="names">
              <input type="text" className="firstName" placeholder="First Name" name="firstName" onChange={handleChange} />
              <input type="text" className="lastName" placeholder="Last Name" name="lastName" onChange={handleChange} />
            </div>
            <div className="errorDiv">
              <input type="email" className="email" placeholder="Email" name="email" onChange={handleChange} />
              {err && <div className="error">{err}</div>}
              {emailError && <div className="error">{emailError}</div>}
            </div>
            <div className="passwords">
              <div className="errorDiv">
                <input type="password" className="password" placeholder="Password" name="password" onChange={handleChange} />
                {passwordError && <div className="error">{passwordError}</div>}
              </div>
              <div className="errorDiv">
                <input type="password" className="confirmPassword" placeholder="Confirm Password" name="confirmPassword" onChange={handleChange} />
                {confirmPasswordError && <div className="error">{confirmPasswordError}</div>}
              </div>
            </div>
            <div className="errorDiv">
              <input type="tel" className="mobileNumber" placeholder="Mobile Number (e.g. 09xxxxxxxxx)" name="mobileNumber" onChange={handleChange} />
              {mobileError && <div className="error">{mobileError}</div>}
            </div>
            <div className="others">
              <select className="gender" name="gender" onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
              <input type="date" className="birthday" placeholder="Birthday" name="birthday" max={new Date().toISOString().split('T')[0]} onChange={handleChange} />
            </div>
            {formError && <div className="error">{formError}</div>}
            <button onClick={handleClick}>
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
