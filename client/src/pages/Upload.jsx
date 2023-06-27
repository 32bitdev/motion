import React, { useEffect, useState } from "react";
import { uploadRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Menu from "../components/Menu";
import "react-toastify/dist/ReactToastify.css";
import "../css/Upload.css";

export default function Upload() {
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
    const [file, setFile] = useState("");
    const [filename, setFilename] = useState("Select a Video to Upload");
    const [infoWindow, setInfoWindow] = useState(false);
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [values, setValues] = useState({ title: "", description: "" });
    const fileHandleChange = (event) => { setFile(event.target.files[0]); setFilename("Video Selected") };
    const textHandleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };
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
                <div className="uploadTitleContainer">
                    <p className="uploadTitle">Upload</p>
                </div>
                <div className="uploadParentBox">
                    {
                        (uploadPercentage) ?
                            <>
                                <div className="uploadProgressMain">
                                    <div className="uploadProgressCurrent" style={{ width: `${uploadPercentage}` }}>{uploadPercentage}%</div>
                                </div>
                            </>
                            :
                            <>
                                {
                                    !(infoWindow) ?
                                        <>
                                            {
                                                !(file) ?
                                                    <form>
                                                        <input id="customFile" type="file" accept=".mp4" onChange={(e) => fileHandleChange(e)} autocomplete="off" />
                                                        <label className="custom-file-label" style={file ? { pointerEvents: "none" } : {}} htmlFor="customFile">{filename}</label>
                                                    </form>
                                                    :
                                                    <div className="navigation">
                                                        <button className="clearSelected" onClick={() => window.location.reload(false)}>Clear Selected</button>
                                                        <button className="continueSelected" onClick={() => setInfoWindow(true)}>Continue</button>
                                                    </div>
                                            }
                                        </>
                                        :
                                        <>
                                            <form>
                                                <div className="input-box">
                                                    <input className="form-field" type="text" placeholder="Title" name="title" onChange={(e) => textHandleChange(e)} autocomplete="off" />
                                                    <textarea className="form-field" type="text" placeholder="Description" name="description" onChange={(e) => textHandleChange(e)} autocomplete="off" />
                                                </div>
                                                <div className="navigation">
                                                    <button className="clearSelected" onClick={() => window.location.reload(false)}>Clear Selected</button>
                                                    {
                                                        (values.title && values.description) ?
                                                            <button className="uploadButton" onClick={()=>{ }}>Upload</button>
                                                            :
                                                            <button type="button" disabled={true} className="uploadButtonDisabled"><span title="Enter Title and Description to Upload">Upload</span></button>
                                                    }
                                                </div>
                                            </form>
                                        </>
                                }
                            </>
                    }
                </div>
            </div >
            <ToastContainer style={{ backgroundColor: "rgba(0, 0, 0, 0)", overflow: "hidden" }} toastStyle={{ backgroundColor: "#1b1b1b" }} newestOnTop />
        </>
    );
}