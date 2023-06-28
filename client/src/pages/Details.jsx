import React, { useEffect, useState } from "react";
import { host, getDetailsRoute, changeVisibilityRoute, downloadRoute } from "../utils/APIRoutes";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import Menu from "../components/Menu";
import axios from "axios";
import image from "../assets/play-icon.svg"
import "react-toastify/dist/ReactToastify.css";
import "../css/Details.css";

export default function Details() {
    const navigate = useNavigate();
    const { videoId } = useParams();
    const [video, setVideo] = useState({ title: "", description: "", owner: "", isPrivate: "", processed: false });
    const [showContent, setShowContent] = useState(false);
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
            const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
            try {
                const { data } = await axios.post(`${getDetailsRoute}`, { _id: user._id, videoId: videoId });
                if (data.status === true) {
                    setVideo(data.videoDetails);
                    setShowContent(true);
                }
            } catch (err) {
                if (!navigate) return;
                navigate("/error");
            }
        }
        fetchData();
    }, [navigate, videoId]);
    const copyId = () => {
        navigator.clipboard.writeText(video.videoId);
        if (!toast.isActive(toastId.current)) {
            toastId.current = toast.info("Video Id copied", toastOptions);
        }
    }
    const changeVisibility = async (isPrivate) => {
        const user = await JSON.parse(localStorage.getItem(process.env.MOTION_APP_LOCALHOST_KEY));
        try {
            const { data } = await axios.post(`${changeVisibilityRoute}`, { videoId: videoId, _id: user._id, isPrivate: isPrivate });
            if (data.status === true)
                setVideo(data.videoDetails);
        } catch (err) {
            if (err.response && err.response.status && err.response.status === 400)
                toast.error(err.response.data.msg, toastOptions);
            else
                navigate("/error");
        }
    }
    return (
        <>
            {(showContent) ?
                <>
                    <Menu />
                    <div className="body">
                        <div className="detailsTitleContainer">
                            <p className="detailsTitle">Motion</p>
                        </div>
                        <div className="detailsParentBox">
                            {
                                (video.processed) ?
                                    <>
                                        <div onClick={() => navigate(`/player/${videoId}`)} className="detailsVideoThumbs">
                                            <div className="visibilityBox">
                                                <>
                                                    {
                                                        (video.isPrivate) ?
                                                            <div className="detailsVisibility">
                                                                private
                                                            </div>
                                                            :
                                                            <div className="detailsVisibility">
                                                                public
                                                            </div>
                                                    }
                                                </>
                                            </div>
                                            <div className="detailsLogoBox"><img className="detailsLogo" src={image} alt="play-logo" /></div>
                                            <img width={720} src={`${host}/media/getThumbs/${video.videoId}`} alt="video-thumbnail" />
                                        </div>
                                    </>
                                    :
                                    <>
                                        <div className="inProcessing">
                                            In Processing...
                                        </div>
                                    </>
                            }
                            <div className="detailsInfoBox">
                                <div className="detailsInfoTitle">
                                    {video.title}
                                </div>
                                <div className="detailsButtonBox">
                                    {
                                        !(video.processed) ?
                                            <>
                                                <button type="button" disabled={true} className="detailsButtonsDisabled"><span title="In Processing">Download</span></button>
                                                <button type="button" disabled={true} className="detailsButtonsDisabled"><span title="In Processing">Make Public</span></button>
                                            </>
                                            :
                                            <>
                                                <button className="detailsButtons" onClick={() => download(video.videoId)}>Download</button>
                                                {
                                                    (video.isPrivate) ?
                                                        <button className="detailsButtons" onClick={() => { changeVisibility(false) }}>Make Public</button>
                                                        :
                                                        <button className="detailsButtons" onClick={() => { changeVisibility(true) }}>Make Private</button>
                                                }
                                            </>
                                    }
                                    <button className="detailsButtons" onClick={() => copyId()}>Copy Video Id</button>
                                </div>
                            </div>
                            <div className="detailsDescriptionBox">
                                <p className="detailsUploaderInfo">By {video.ownerName}</p>
                                <p>{video.description}</p>
                            </div>
                        </div>
                    </div>
                    <ToastContainer style={{ backgroundColor: "rgba(0, 0, 0, 0)", overflow: "hidden" }} toastStyle={{ backgroundColor: "#1b1b1b" }} newestOnTop />
                </>
                :
                <></>
            }
        </>
    )
}