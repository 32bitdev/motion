import React, { useEffect, useState } from "react";
import { createRoomRoute, joinRoomRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import image from "../assets/hologram.png"
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "../css/Room.css";

export default function Room() {
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
    const [values, setValues] = useState({ roomId: "" });
    const textHandleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };
    const createRoom = async () => {
        // Create room logic here
    }

    const joinRoom = async (event) => {
        // Join room logic here
    }
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
            <div className="body">
                <div className="roomTitleContainer">
                    <p className="roomTitle">Room</p>
                </div>
                <div className="roomParentBox">
                    <div className="roomBox">
                        <button className="createButton" onClick={createRoom}>Create Room</button>
                        <form>
                            <div className="input-box">
                                <input className="form__field" type="text" placeholder="Room Id" name="roomId" onChange={(e) => textHandleChange(e)} autocomplete="off" />
                            </div>
                            {
                                !(values.roomId) ?
                                    <button className="joinButtonDisabled" disabled={true}>Join Room</button>
                                    :
                                    <button className="joinButton" onClick={joinRoom}>Join Room</button>
                            }
                        </form>
                    </div>
                    <div className="hologram">
                        <img src={image} alt="hologram" />
                    </div>
                </div>
            </div>
            <ToastContainer style={{ backgroundColor: "rgba(0, 0, 0, 0)", overflow: "hidden" }} toastStyle={{ backgroundColor: "#1b1b1b" }} newestOnTop />
        </>
    )
}
