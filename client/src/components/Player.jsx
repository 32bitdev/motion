import React, { useEffect } from "react";
import { streamVerificationRoute, streamRoute } from "../utils/APIRoutes";
import axios from "axios";
import Hls from "hls.js";

export default function Player({ videoId, presenter, roomDetails, socket }) {
    useEffect(() => {
        async function fetchData() {
            if (videoId) {
                const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
                try {
                    const { data } = await axios.post(`${streamVerificationRoute}`, { _id: user._id, roomId: roomDetails.roomId, videoId: videoId }, { withCredentials: true });
                    if (data.status === true) {
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
                                video.muted = true;
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
    }, [videoId]); // eslint-disable-line
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
                            style={presenter ? {} : { pointerEvents: "none" }}>
                        </video>
                    </>
            }
        </>
    )
}