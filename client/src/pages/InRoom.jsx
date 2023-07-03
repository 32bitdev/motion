import React, { useEffect, useState, useRef } from "react";
import { roomDetailsRoute, host } from "../utils/APIRoutes";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "../css/InRoom.css";

export default function InRoom() {
    const socket = useRef();
    const navigate = useNavigate();
    const [videoId, setVideoId] = useState("");
    const [presenter, setPresenter] = useState(false);
    const [values, setValues] = useState({ videoId: "" });
    const [roomDetails, setRoomDetails] = useState({ membersNames: [] });
    const [selectVideo, setSelectVideo] = useState(false);
    const [key, setKey] = useState("");
    const toastId = React.useRef(null);
    const toastClipboardId = React.useRef(null);
    const user = JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
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
    const { roomId } = useParams();
    useEffect(() => {
        async function fetchData() {
            const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
            try {
                const { data } = await axios.post(`${roomDetailsRoute}`, { roomId: roomId, _id: user._id });
                if (data.status === true) {
                    setRoomDetails(data.roomDetails);
                    socket.current = io(host);
                    socket.current.emit("in-room", { roomDetails: data.roomDetails, _id: user._id });
                    socket.current.on("room-update", async () => {
                        console.log("roomupdate");
                        try {
                            const { data } = await axios.post(`${roomDetailsRoute}`, { roomId: roomId, _id: user._id });
                            if (data.status === true)
                                setRoomDetails(data.roomDetails);
                        } catch (err) {
                            if (err.response && err.response.status && err.response.status === 400)
                                toast.error(err.response.data.msg, toastOptions);
                            else
                                navigate("/error");
                        }
                    });
                }
                else
                    navigate("/error");
            } catch (err) {
                if (err.response && err.response.status && err.response.status === 400)
                    toast.error(err.response.data.msg, toastOptions);
                else
                    navigate("/error");
            }
        }
        fetchData();
    }, [navigate, roomId]); // eslint-disable-line
    const copyId = () => {
        navigator.clipboard.writeText(roomDetails.roomId);
        if (!toast.isActive(toastClipboardId.current)) {
            toastClipboardId.current = toast.info("Room Id copied", toastOptions);
        }
    }
    const showOptions = async (memberName) => {
        // Show Options logic shall be written here
    }
    const exit = async () => {
        // Exit logic shall be written here
    }
    const stopSharing = async () => {
        // Stop sharing logic shall be written here
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        // Submit logic shall be written here
    };
    const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };
    return (
        <>
            <div className="body">
                <div className="inRoomTitleContainer">
                    <p className="inRoomTitle">Room</p>
                </div>
                <div className="inRoomParentBox">
                    <div className="content">
                        {
                            !(videoId) ?
                                <>
                                    {
                                        !(selectVideo) ?
                                            <>
                                                <button className="playContent" onClick={() => setSelectVideo(true)}>Play Some Video</button>
                                            </>
                                            :
                                            <>
                                                <form className="formMain" onSubmit={(event) => handleSubmit(event)}>
                                                    <input type="text" className="videoIdForm" placeholder="Enter some Id" name="videoId" onChange={(e) => handleChange(e)} min="3" autocomplete="off" />
                                                    {
                                                        (values.videoId) ?
                                                            <>
                                                                <button className="playContent" type="submit">Play</button>
                                                            </>
                                                            :
                                                            <>
                                                                <button className="playContentDisabled" type="submit" disabled={true}><span title="Enter Video Id to Play">Play</span></button>
                                                            </>
                                                    }
                                                    <button className="back" onClick={() => setSelectVideo(false)}>Back</button>
                                                </form>
                                            </>
                                    }
                                </>
                                :
                                <>
                                </>
                        }
                    </div>
                    <div className="members">
                        <button className="copyId" onClick={() => copyId()}>Copy Room Id</button>
                        {
                            (presenter) ?
                                <button className="stopSharing" onClick={() => {
                                    stopSharing();
                                    setValues({ videoId: "" });
                                }}>Stop Sharing</button>
                                :
                                <>
                                </>
                        }
                        <button className="exitRoom" onClick={() => exit()}>Exit Room</button>
                        {roomDetails.membersNames.map((memberName) => {
                            return (
                                <div onClick={async () => {
                                    const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
                                    if ((roomDetails.owner === user._id) && !(user.username === memberName))
                                        showOptions(memberName);
                                }} className={(roomDetails.owner === user._id) && !(user.username === memberName) ? "optionsMemberBox" : "non-OptionsMemberBox"} key={uuidv4()}>{memberName.charAt(0).toUpperCase() + memberName.slice(1)}</div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <ToastContainer style={{ backgroundColor: "rgba(0, 0, 0, 0)", overflow: "hidden" }} toastStyle={{ backgroundColor: "#1b1b1b" }} newestOnTop />
        </>
    )
}