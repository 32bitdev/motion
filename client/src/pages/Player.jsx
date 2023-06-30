import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import { streamVerificationRoute, streamRoute } from "../utils/APIRoutes";
import axios from "axios";
import Hls from "hls.js";
import Menu from "../components/Menu";
import "react-toastify/dist/ReactToastify.css";
import "../css/Player.css";

export default function Player() {
    const navigate = useNavigate();
    const { videoId } = useParams();
    const [videoDetails, setVideoDetails] = useState({ ownerName: "", title: "", description: "", id: "" });
    const toastId = React.useRef(null);
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
    const copyId = () => {
        navigator.clipboard.writeText(videoDetails.videoId);
        if (!toast.isActive(toastId.current)) {
            toastId.current = toast.info("Video Id copied", toastOptions);
        }
    }
    useEffect(() => {
        async function fetchData() {
            if (!localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY)) {
                if (!navigate) return;
                navigate("/login");
            }
            else {
                const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
                try {
                    const { data } = await axios.post(`${streamVerificationRoute}`, { _id: user._id, videoId: videoId }, { withCredentials: true });
                    if (data.status === true) {
                        setVideoDetails(data.video);
                        const config = {
                            xhrSetup: function (xhr) {
                                xhr.withCredentials = true;
                                xhr.setRequestHeader(`Authorization`, `Bearer ${data.token}`);
                            },
                        };
                        if (Hls.isSupported()) {
                            const video = document.getElementById("videoPlayer");
                            const hls = new Hls(config);
                            hls.loadSource(`${streamRoute}/${data.url}`);
                            hls.attachMedia(video);
                            document.getElementById("videoPlayer").load();
                            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                                video.muted = false;
                                video.play();
                            });
                        }
                    }
                    else if (data.status === false && data.isPrivate === true) {
                        if (!navigate) return;
                        navigate("/private");
                    }
                } catch (err) {
                    if (!navigate) return;
                    navigate("/error");
                }
            }
        }
        fetchData();
    }, [videoId, navigate]);
    return (
        <>
            <Menu />
            <div className="body">
                <div className="playerTitleContainer">
                    <p className="playerTitle">Motion</p>
                </div>
                <div className="playerParentBox">
                    <video id="videoPlayer" controls></video>
                    <div className="infoBox">
                        <div className="infoTitle">
                            {videoDetails.title}
                        </div>
                        <button className="playerCopyId" onClick={() => copyId()}>Copy Video Id</button>
                    </div>
                    <div className="descriptionBox">
                        <p className="uploaderInfo">By {videoDetails.ownerName}</p>
                        <p>{videoDetails.description}</p>
                    </div>
                </div>
            </div>
            <ToastContainer style={{ backgroundColor: "rgba(0, 0, 0, 0)", overflow: "hidden" }} toastStyle={{ backgroundColor: "#1b1b1b" }} newestOnTop />
        </>
    )
}