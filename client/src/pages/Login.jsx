import React, { useState, useEffect } from "react";
import { Slide, ToastContainer, toast } from "react-toastify";
import { loginRoute } from "../utils/APIRoutes";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "../css/Login.css";

export default function Login() {
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
    const [values, setValues] = useState({ username: "", password: "" });
    useEffect(() => {
        if (localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY)) {
            if (!navigate) return;
            navigate("/");
        }
    }, [navigate]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (handleValidation()) {
            const { password, username } = values;
            try {
                const { data } = await axios.post(loginRoute, { username, password });
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
        const { password, username } = values;
        if (password === "" || username === "") { toast.error("Username and password required", toastOptions); return false; }
        return true;
    };
    const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };
    return (
        <>
            <div className="loginContainer">
                <form onSubmit={(event) => handleSubmit(event)}>
                    <div className="brand">
                        <h1>Motion</h1>
                    </div>
                    <input type="text" placeholder="Username" name="username" onChange={(e) => handleChange(e)} min="3" autoComplete="off" />
                    <input type="password" placeholder="Password" name="password" onChange={(e) => handleChange(e)} autoComplete="off" />
                    <button type="submit">Log In</button>
                    <span>Don't have an account? <Link className="link" to="/register">Register</Link></span>
                </form>
            </div>
            <ToastContainer style={{ backgroundColor: "rgba(0, 0, 0, 0)", overflow: "hidden" }} toastStyle={{ backgroundColor: "#1b1b1b" }} newestOnTop />
        </>
    )
}