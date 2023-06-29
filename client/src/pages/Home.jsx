import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Videos from "../components/Videos";
import Menu from "../components/Menu";
import "../css/Home.css";

export default function Home() {
    const navigate = useNavigate();
    const [messsage, setMessage] = useState("");
    useEffect(() => {
        async function fetchData() {
            if (!localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY)) {
                if (!navigate) return;
                navigate("/login");
            }
        }
        fetchData();
    }, [navigate]);
    useEffect(() => {
        async function fetchData() {
            const myDate = new Date();
            const hrs = myDate.getHours();
            if (hrs < 12)
                setMessage("Good Morning");
            else if (hrs >= 12 && hrs <= 17)
                setMessage("Good Afternoon");
            else if (hrs >= 17 && hrs <= 24)
                setMessage("Good Evening");
        }
        fetchData();
    }, []);
    return (
        <>
            <Menu />
            <div className="body">
                <div className="titleContainer">
                    <p className="title">{messsage}</p>
                </div>
                <div className="videos">
                    <Videos onlyOwned={false} />
                </div>
            </div>
        </>
    );
}