import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Details from "./pages/Details";
import Player from "./pages/Player";
import Room from "./pages/Room";
import InRoom from "./pages/InRoom";
import Validation from "./pages/Validation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/details/:videoId" element={<Details />} />
        <Route path="/player/:videoId" element={<Player />} />
        <Route path="/room" element={<Room />} />
        <Route path="/room/:roomId" element={<InRoom />} />
        <Route path="/validation" element={<Validation />} />
      </Routes>
    </BrowserRouter >
  )
}