import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutRoute } from "../utils/APIRoutes";
import axios from "axios";
import "../css/Menu.css";

export default function Menu() {
    const navigate = useNavigate();
    const [toggleNavStatus, setToggleNavStatus] = useState(false);
    function openInNewWindow(url) {
        const win = window.open(url, '_blank');
        if (win != null) {
          win.focus();
        }
      }
    const handleClickLogout = async () => {
        const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
        try {
            const data = await axios.get(`${logoutRoute}/${user._id}`);
            if (data.status === 200) {
                localStorage.clear();
                navigate("/login");
            }
        } catch (err) {
            console.log(err);
        }
    };
    const toggleNav = () => {
        const body = document.querySelector(".body");
        const getSidebar = document.querySelector(".nav-sidebar");
        const getSidebarUl = document.querySelector(".nav-sidebar ul");
        const getSidebarLinks = document.querySelectorAll(".nav-sidebar a");
        if (toggleNavStatus === false) {
            getSidebarUl.style.visibility = "visible";
            body.style.opacity = "0.5";
            getSidebar.style.width = "240px";
            const arrayLength = getSidebarLinks.length;
            for (let i = 0; i < arrayLength; i++)
                getSidebarLinks[i].style.opacity = "1";
            setToggleNavStatus(true);
        }
        else if (toggleNavStatus === true) {
            getSidebar.style.width = "0px";
            body.style.opacity = "1";
            const arrayLength = getSidebarLinks.length;
            for (let i = 0; i < arrayLength; i++)
                getSidebarLinks[i].style.opacity = "0";
            getSidebarUl.style.visibility = "hidden";
            setToggleNavStatus(false);
        }
    }
    return (
        <>
            <div className="btn-toggle-nav" onClick={() => toggleNav()}></div>
            <aside className="nav-sidebar">
                <ul>
                    <li><button onClick={() => {
                        navigate("/");
                        toggleNav();
                    }}>Home</button></li>
                    <li><button onClick={() => {
                        openInNewWindow("/room");
                        toggleNav();
                    }}>Room</button></li>
                    <li><button onClick={() => {
                        navigate("/upload");
                        toggleNav();
                    }}>Upload</button></li>
                    <li><button onClick={() => {
                        navigate("/profile");
                        toggleNav();
                    }}>Profile</button></li>
                    <li><button onClick={() => {
                        handleClickLogout();
                        toggleNav();
                    }}>Logout</button></li>
                </ul>
            </aside>
        </>
    )
}
