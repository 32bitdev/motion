import React, { useEffect, useState } from "react";
import { host, getVideosRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import image from "../assets/play-icon.svg";
import processing from "../assets/processing.webp";
import "../css/Videos.css";

export default function Videos({ onlyOwned }) {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [showContent, setShowContent] = useState(false);
    useEffect(() => {
        async function fetchData() {
            const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
            try {
                const { data } = await axios.post(`${getVideosRoute}`, { _id: user._id, onlyOwned: onlyOwned });
                if (data.status === true) {
                    setVideos(data.videos);
                    setShowContent(true);
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchData();
    }, [onlyOwned]);
    return (
        <>
            {(showContent) ?
                <>
                    {
                        (videos.length) ?
                            <div className="vidContainer">
                                {videos.map((video) => {
                                    return (
                                        <div key={uuidv4()} onClick={() => { (onlyOwned) ? navigate(`/details/${video.videoId}`) : navigate(`/player/${video.videoId}`) }} className="vidBoxes" style={(video.processed) ? { backgroundImage: `url(${host}/media/getThumbs/${video.videoId})` } : { backgroundImage: `url(${processing})` }}>
                                            {
                                                !(onlyOwned) ?
                                                    <>
                                                        <div className="logoBox"><img className="logo" src={image} alt="play-logo" /></div>
                                                    </>
                                                    :
                                                    <>
                                                    </>
                                            }
                                            <div className={(onlyOwned) ? "filter-profile" : "filter"}>
                                                <div className="info">
                                                    <div className="videoTitle">{video.title}</div>
                                                    <div className="videoOwner">{video.ownerName}</div>
                                                </div>
                                                {
                                                    (onlyOwned) ?
                                                        <>
                                                            {
                                                                (video.isPrivate) ?
                                                                    <div className="visibility">
                                                                        private
                                                                    </div>
                                                                    :
                                                                    <div className="visibility">
                                                                        public
                                                                    </div>
                                                            }
                                                        </>
                                                        :
                                                        <></>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            :
                            <div className="noVideos">
                                No Videos to Show
                            </div>
                    }
                </>
                :
                <></>
            }
        </>
    )
}
