import React, { useEffect, useRef, useState } from "react";
import { host } from "../utils/APIRoutes";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "../css/Validation.css";

export default function Validation() {
  const navigate = useNavigate();
  const socket = useRef();
  const location = useLocation();
  const [inValidation, setInValidation] = useState(true);
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
      console.log("loaded");
      if (location.state === null) {
        if (!navigate) return;
        navigate("/");
      }
      else {
        socket.current = io(host);
        const _id = location.state._id;
        const roomDetails = location.state.roomDetails;
        // Socket logic shall be written here
      }
    }
    fetchData();
  }, [navigate, location]);
  return (
    <>
      <div className="parentValidationBox">
        {
          (inValidation) ?
            <div className="waiting">
              <p>Waiting for the host to let you in!</p>
            </div>
            :
            <div className="not-accepted">
              <p>Sorry! your request couldn't be approved!</p>
              <div className="buttons">
                <button className="resendRequest" onClick={() => window.location.reload()}>Retry</button>
                <button className="cancelRequest" onClick={() => navigate("/room")}>Cancel</button>
              </div>
            </div>
        }
      </div>
    </>
  )
}
