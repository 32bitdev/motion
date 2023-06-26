import React, { useState, useEffect } from "react";
import { Slide, ToastContainer, toast } from "react-toastify";
import { registerRoute } from "../utils/APIRoutes";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "../css/Register.css";

export default function Register() {
    const navigate = useNavigate();
    const toastOptions = {
        position: "bottom-right",
        autoClose: 5000,
        transition: Slide,
        hideProgressBar: true,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: false,
        closeButton: false,
    };
    const [values, setValues] = useState({ username: "", email: "", password: "", confirmPassword: "" });
    useEffect(() => {
        if (localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY)) {
            if (!navigate) return;
            navigate("/");
        }
    }, [navigate]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (handleValidation()) {
            const { password, username, email } = values;
            try {
                const { data } = await axios.post(registerRoute, { username, email, password });
                if (data.status === true) {
                    localStorage.setItem(process.env.MOTION_APP_LOCALHOST_KEY, JSON.stringify(data.user));
                    navigate("/");
                }
            } catch (err) {
                if (err.response && err.response.status && err.response.status === 400)
                    toast.error(err.response.data.msg, toastOptions);
                else
                    navigate("/error");
            }
        }
    };
    const handleValidation = () => {
        const { password, confirmPassword, username, email } = values;
        if (username === "") {
            toast.error("Username is required", toastOptions);
            return false;
        }
        else if (!(username.indexOf(" ") === -1)) {
            toast.error("Username should not contain spaces", toastOptions);
            return false;
        }
        else if (/^(?=.*[A-Z])/.test(username)) {
            toast.error("Username should not contain uppercase letters", toastOptions);
            return false;
        }
        else if (/(?=.*\d)/.test(username)) {
            toast.error("Username should not contain numbers", toastOptions);
            return false;
        }
        else if (/^(?=.*[-+_!@#$%^&*., ?])/.test(username)) {
            toast.error("Username should not contain special characters", toastOptions);
            return false;
        }
        else if (email === "") {
            toast.error("Email is required", toastOptions);
            return false;
        }
        else if (!(/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            toast.error("Invalid Email", toastOptions);
            return false;
        }
        else if (username.length < 3) {
            toast.error("Username should be greater than or equal to 3 characters", toastOptions);
            return false;
        }
        else if (password.length < 8) {
            toast.error("Password should be greater than or equal to 8 characters", toastOptions);
            return false;
        }
        else if (password !== confirmPassword) {
            toast.error("Password and confirm password should same", toastOptions);
            return false;
        }
        return true;
    };
    const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };
    return (
        <>
            <div className="registerContainer">
                <form onSubmit={(event) => handleSubmit(event)}>
                    <div className="brand">
                        <h1>Motion</h1>
                    </div>
                    <input type="text" placeholder="Username" name="username" onChange={(e) => handleChange(e)} autocomplete="off" />
                    <input type="email" placeholder="Email" name="email" onChange={(e) => handleChange(e)} autocomplete="off" />
                    <input type="password" placeholder="Password" name="password" onChange={(e) => handleChange(e)} autocomplete="off" />
                    <input type="password" placeholder="Confirm Password" name="confirmPassword" onChange={(e) => handleChange(e)} autocomplete="off" />
                    <button type="submit">Create User</button>
                    <span>Already have an account? <Link to="/login">Login</Link></span>
                </form>
            </div>
            <ToastContainer style={{ backgroundColor: "rgba(0, 0, 0, 0)", overflow: "hidden" }} toastStyle={{ backgroundColor: "#1b1b1b" }} newestOnTop />
        </>
    )
}