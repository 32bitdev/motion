import React, { useEffect } from "react";
import { streamVerificationRoute, streamRoute } from "../utils/APIRoutes";
import axios from "axios";
import Hls from "hls.js";

export default function Player({ videoId, presenter, roomDetails, socket }) {
    const seek = () => {
        if (presenter) {
            const owner = roomDetails.owner;
            const roomId = roomDetails.roomId;
            const newPosition = document.getElementById("videoPlayer").currentTime;
            const payload = { owner: owner, roomId: roomId, newPosition: newPosition };
            socket.current.emit("seeked", payload);
        }
    };
    const pause = () => {
        if (presenter) {
            const owner = roomDetails.owner;
            const roomId = roomDetails.roomId;
            const payload = { owner: owner, roomId: roomId };
            socket.current.emit("paused", payload);
        }
    };
    const play = () => {
        if (presenter) {
            const owner = roomDetails.owner;
            const roomId = roomDetails.roomId;
            const payload = { owner: owner, roomId: roomId };
            socket.current.emit("played", payload);
        }
    };
    useEffect(() => {
        async function fetchData() {
            if (videoId) {
                const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
                try {
                    const { data } = await axios.post(`${streamVerificationRoute}`, { _id: user._id, roomId: roomDetails.roomId, videoId: videoId }, { withCredentials: true });
                    if (data.status === true) {
                        socket.current.on("pause", async () => {
                            document.getElementById("videoPlayer").pause();
                        });
                        socket.current.on("play", async () => {
                            document.getElementById("videoPlayer").play();
                        });
                        socket.current.on("seek", async (newPosition) => {
                            document.getElementById("videoPlayer").currentTime = newPosition;
                        });
                        const config = {
                            xhrSetup: function (xhr) {
                                xhr.withCredentials = true;
                                xhr.setRequestHeader(`Authorization`, `Bearer ${data.token}`);
                            },
                        };
                        if (Hls.isSupported()) {
                            const video = document.getElementById('videoPlayer');
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
                } catch (err) {
                    console.log(err);
                }
            }
        }
        fetchData();
    }, [videoId, socket]); // eslint-disable-line
    return (
        <>
            {
                !(videoId) ?
                    <>
                    </>
                    :
                    <>
                        <video
                            width={720}
                            id="videoPlayer"
                            controls={presenter}
                            autoPlay={true}
                            onPause={() => pause()}
                            onSeeking={() => seek()}
                            onPlay={() => play()}
                            style={presenter ? {} : { pointerEvents: "none" }}>
                        </video>
                    </>
            }
        </>
    )
}