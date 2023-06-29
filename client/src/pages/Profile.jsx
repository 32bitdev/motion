import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Videos from "../components/Videos";
import Menu from "../components/Menu";
import "../css/Home.css";

export default function Home() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
    useEffect(() => {
        async function fetchData() {
            if (!localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY)) {
                if (!navigate) return;
                navigate("/login");
            }
        }
        fetchData();
    }, [navigate]);
    return (
        <>
            <Menu />
            <div className="body">
                <div className="titleContainer">
                    <p className="title">Hello, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}</p>
                </div>
                <div className="videos">
                    <Videos onlyOwned={true} />
                </div>
            </div>
        </>
    );
}