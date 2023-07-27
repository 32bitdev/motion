const { Users, Metadata, Rooms, Streams, ObjectId } = require("../collections/mongoCollections");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const { getVideoDurationInSeconds } = require("get-video-duration");

//upload request handler
module.exports.upload = async (req, res, next) => {
    try {
        const processingDone = async () => {
            getVideoDurationInSeconds(`${path.join(__dirname, `..`, `..`, `database`, `${videoId}.mp4`)}`).then(async (duration) => {
                if (duration == null)
                    console.log(`Error in finding length - ${videoId}`)
                console.log(duration);
                await new ffmpeg(`${path.join(__dirname, `..`, `..`, `database`, `${videoId}.mp4`)}`)
                    .takeScreenshots({
                        count: 1,
                        timemarks: [duration / 2],
                        filename: `${videoId}.png`
                    }, `${path.join(__dirname, `..`, `..`, `database`, `thumbnails`)}`, function (err) {
                        if (err)
                            console.log(`Screenshot failed - ${videoId}`);
                    });
            });
            await Metadata.updateOne({ videoId: videoId }, { $set: { processed: true } });
            console.log(`Video processing done - ${videoId}`);
        }
        if (req.files === null)
            return res.status(400).json({ status: false, msg: "No file selected" });
        const file = await req.files.file;
        console.log(file.name);
        const fileType = await file.mimetype;
        console.log(file.mimetype);
        const title = await req.body.title;
        const description = await req.body.description;
        const _id = await req.body._id;
        if (!(fileType === "video/mp4") || !(path.extname(`${file.name}`) === ".mp4"))
            return res.status(400).json({ status: false, msg: "File type is not supported" });
        if (title === "")
            return res.status(400).json({ status: false, msg: "Title or Description cannot be blank" });
        if (description === "")
            return res.status(400).json({ status: false, msg: "Title or Description cannot be blank" });
        if (title.indexOf(" ") === 0)
            return res.status(400).json({ status: false, msg: "Title cannot start with space" });
        if (description.indexOf(" ") === 0)
            return res.status(400).json({ status: false, msg: "Description cannot start with space" });
        const user = await Users.findOne({ _id: new ObjectId(_id) });
        if (!(user))
            return res.status(500).json({ status: false, msg: "User not found" });
        let newMediaCount = user.mediaCount + 1;
        const videoId = user._id + newMediaCount;
        file.name = videoId;
        console.log(file.name);
        file.mv(`${path.join(__dirname, `..`, `..`, `database`, `${file.name}.mp4`)}`, async (err) => {
            if (err) {
                return res.status(500).json({ status: false, msg: "Something went wrong" });
            }
            const update = await Users.updateOne({ _id: new ObjectId(_id) }, { $set: { mediaCount: newMediaCount } });
            if (!update.acknowledged)
                return res.status(500).json({ status: false, msg: "Something went wrong" });
            const metaAdd = await Metadata.insertOne({ videoId: videoId, title: title, description: description, isPrivate: true, owner: _id, ownerName: user.username, processed: false });
            if (!metaAdd.acknowledged)
                return res.status(500).json({ status: false, msg: "Something went wrong" });
            console.log(`Video processing started - ${videoId}`);
            ffmpeg(`${path.join(__dirname, `..`, `..`, `database`, `${file.name}.mp4`)}`).addOptions([
                '-profile:v main',
                '-vf scale=w=1280:h=720:force_original_aspect_ratio=decrease',
                '-c:a aac',
                '-ar 48000',
                '-b:a 128k',
                '-c:v h264',
                '-crf 20',
                '-g 48',
                '-keyint_min 48',
                '-sc_threshold 0',
                '-b:v 2800k',
                '-maxrate 2996k',
                '-bufsize 4200k',
                '-hls_time 10',
                `-hls_segment_filename ${path.join(__dirname, `..`, `..`, `database`, `${videoId}_720p_%04d.ts`)}`,
                '-hls_playlist_type vod',
                '-f hls'
            ]).output(`${path.join(__dirname, `..`, `..`, `database`, `${file.name}.m3u8`)}`).on('end', processingDone).run()
            return res.status(200).json({ status: true, msg: "Upload successfull", videoId: videoId });
        });
    }
    catch (ex) {
        next(ex);
    }
};

//get a video details
module.exports.getDetails = async (req, res, next) => {
    try {
        const { _id, videoId, roomId } = req.body;
        const video = await Metadata.findOne({ videoId: videoId });
        if (roomId) {
            if (!video)
                return res.status(400).json({ status: false, msg: "No video available" });
            if (!(video.processed))
                return res.status(400).json({ status: false, msg: "Video is under processing" });
            if (video.isPrivate) {
                if (_id === video.owner) {
                    const room = await Rooms.findOne({ roomId: roomId });
                    if (!room)
                        return res.status(500).json({ status: false, msg: "Room does not exist" });
                    const videoAdd = await Rooms.updateOne({ roomId: roomId }, { $set: { videoId: videoId } });
                    if (!videoAdd.acknowledged)
                        return res.status(500).json({ status: false, msg: "Something went wrong" });
                    res.status(200).json({ status: true, msg: "Video found", videoDetails: video });
                }
                else {
                    const room = await Rooms.findOne({ roomId: roomId });
                    if (!room)
                        return res.status(500).json({ status: false, msg: "Room does not exist" });
                    if (!(room.videoId === videoId))
                        return res.status(400).json({ status: false, msg: "Video not allowed in room" });
                    res.status(200).json({ status: true, msg: "Video found", videoDetails: video });
                }
            }
            else {
                const room = await Rooms.findOne({ roomId: roomId });
                if (!room)
                    return res.status(500).json({ status: false, msg: "Room does not exist" });
                res.status(200).json({ status: true, msg: "Video found", videoDetails: video });
            }
        }
        else {
            if (!video)
                return res.status(500).json({ status: false, msg: "No video available" });
            if (_id === video.owner)
                res.status(200).json({ status: true, msg: "Video found", videoDetails: video });
            else
                return res.status(500).json({ status: false, msg: "Video is private" });
        }
    }
    catch (ex) {
        next(ex);
    }
};

//stream verification handler
module.exports.streamVerification = async (req, res, next) => {
    try {
        const urlId = randomUUID();
        const tokenId = randomUUID();
        const cookieId = randomUUID();
        const { _id, videoId, roomId } = req.body;
        const video = await Metadata.findOne({ videoId: videoId });
        if (!video)
            return res.status(500).json({ status: false, msg: "No video available" });
        if (!(video.processed))
            return res.status(500).json({ status: false, msg: "Video is under processing" });
        if (video.isPrivate === false || _id === video.owner) {
            const streamAdd = await Streams.insertOne({ createdAt: new Date(), sessionId: req.sessionID, urlId: urlId, tokenId: tokenId, cookieId: cookieId, videoId: videoId });
            if (!streamAdd.acknowledged)
                return res.status(500).json({ status: false, msg: "Something went wrong" });
            const url = jwt.sign(
                { "urlId": urlId },
                process.env.URL_SECRET_KEY,
                { expiresIn: "1d" }
            );
            const token = jwt.sign(
                { "tokenId": tokenId },
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: "1d" }
            );
            const cookie = jwt.sign(
                { "cookieId": cookieId },
                process.env.COOKIE_SECRET_KEY,
                { expiresIn: "1d" }
            );
            res.cookie("jwt", cookie, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            res.status(200).json({ status: true, msg: "Video found", url: url, token: token, video: video });
        }
        else if (roomId) {
            const room = await Rooms.findOne({ roomId: roomId });
            if (!room)
                return res.status(400).json({ status: false, msg: "Room does not exist" });
            if (!(room.videoId === videoId))
                return res.status(400).json({ status: false, msg: "Video not allowed in room" });
            const streamAdd = await Streams.insertOne({ createdAt: new Date(), sessionId: req.sessionID, urlId: urlId, tokenId: tokenId, cookieId: cookieId, videoId: videoId });
            if (!streamAdd.acknowledged)
                return res.status(500).json({ msg: "Something went wrong" });
            const url = jwt.sign(
                { "urlId": urlId },
                process.env.URL_SECRET_KEY,
                { expiresIn: "1d" }
            );
            const token = jwt.sign(
                { "tokenId": tokenId },
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: "1d" }
            );
            const cookie = jwt.sign(
                { "cookieId": cookieId },
                process.env.COOKIE_SECRET_KEY,
                { expiresIn: "1d" }
            );
            res.cookie("jwt", cookie, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            res.status(200).json({ status: true, msg: "Video found", url: url, token: token, video: video });
        }
        else
            return res.status(200).json({ status: false, isPrivate: true, msg: "Video is private" });
    }
    catch (ex) {
        next(ex);
    }
};

//stream request handler
module.exports.stream = async (req, res, next) => {
    try {
        let urlId, tokenId, cookieId;
        const url = req.params.url;
        const urlExt = path.extname(url);
        const cookie = req.cookies.jwt;
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer '))
            return res.status(401);
        const token = authHeader.split(' ')[1];
        if (!(urlExt === ".ts")) {
            jwt.verify(
                url,
                process.env.URL_SECRET_KEY,
                (err, decoded) => {
                    if (err)
                        return res.status(403);
                    urlId = decoded.urlId;
                }
            );
        }
        jwt.verify(
            token,
            process.env.TOKEN_SECRET_KEY,
            (err, decoded) => {
                if (err)
                    return res.status(403);
                tokenId = decoded.tokenId;
            }
        );
        jwt.verify(
            cookie,
            process.env.COOKIE_SECRET_KEY,
            (err, decoded) => {
                if (err)
                    return res.status(403);
                cookieId = decoded.cookieId;
            }
        );
        if (urlExt === ".ts") {
            const stream = await Streams.findOne({ tokenId: tokenId });
            if (!stream)
                return res.status(400).json({ status: false, msg: "No stream available" });
            if (!(req.sessionID === stream.sessionId))
                return res.status(403);
            const tsPath = `${path.join(__dirname, `..`, `..`, `database`, url)}`;
            const tsStream = fs.createReadStream(tsPath);
            tsStream.pipe(res);
        }
        else {
            const stream = await Streams.findOne({ urlId: urlId });
            if (!stream)
                return res.status(400).json({ status: false, msg: "No stream available" });
            if (!(tokenId === stream.tokenId))
                return res.status(403);
            else if (!(cookieId === stream.cookieId))
                return res.status(403);
            else if (!(req.sessionID === stream.sessionId))
                return res.status(403);
            const m3u8Path = `${path.join(__dirname, `..`, `..`, `database`, `${stream.videoId}.m3u8`)}`;
            const m3u8Stream = fs.createReadStream(m3u8Path);
            m3u8Stream.pipe(res);
        }
    }
    catch (ex) {
        next(ex);
    }
};

//download request handler
module.exports.download = async (req, res, next) => {
    try {
        const { _id, videoId } = req.body;
        const videoDetails = await Metadata.findOne({ videoId: videoId });
        if (!(videoDetails.owner === _id))
            return res.status(400).json({ status: false, msg: "User not authorised" });
        const filePath = `${path.join(__dirname, `..`, `..`, `database`, `${videoId}.mp4`)}`;
        const fileName = `${videoDetails.title}.mp4`;
        res.header('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(200);
        fs.createReadStream(filePath).pipe(res);
    } catch (ex) {
        next(ex);
    }
};

//delete request handler
module.exports.deleteVideo = async (req, res, next) => {
    try {
        const { _id, videoId } = req.body;
        const user = await Users.findOne({ _id: new ObjectId(_id) });
        if (!(user))
            return res.status(500).json({ status: false, msg: "User not found" });
        const video = await Metadata.findOne({ videoId: videoId });
        if (!(_id === video.owner))
            return res.status(500).json({ status: false, msg: "Access Denied" });
        await Metadata.deleteOne({ videoId: videoId });
        let newFileCount = user.fileCount - 1;
        const update = await Users.updateOne({ _id: new ObjectId(_id) }, { $set: { fileCount: newFileCount } });
        if (!update.acknowledged)
            return res.status(500).json({ status: false, msg: "Something went wrong" });
        return res.json({ status: true, msg: "File Deleted" });
    } catch (ex) {
        next(ex);
    }
};

// change video visibility
module.exports.changeVisibility = async (req, res, next) => {
    try {
        const { _id, videoId, isPrivate } = req.body;
        const video = await Metadata.findOne({ videoId: videoId });
        if (!(video.owner === _id))
            return res.status(500).json({ status: false, msg: "Video is private" });
        const update = await Metadata.updateOne({ videoId: videoId }, { $set: { isPrivate: isPrivate } });
        if (!update.acknowledged)
            return res.status(500).json({ status: false, msg: "Something went wrong" });
        const videoDetails = await Metadata.findOne({ videoId: videoId });
        if (!videoDetails)
            return res.status(500).json({ status: false, msg: "No video available" });
        else return res.status(200).json({ status: true, msg: "Visibility updated", videoDetails: videoDetails });
    }
    catch (ex) {
        next(ex);
    }
};

//get videos
module.exports.getVideos = async (req, res, next) => {
    try {
        const { _id, onlyOwned } = req.body;
        if (onlyOwned) {
            const videos = await Metadata.find({ owner: _id }).sort({ _id: -1 }).toArray();
            return res.status(200).json({ status: true, videos: videos });
        }
        else {
            const videos = await Metadata.find({ $and: [{ processed: true }, { $or: [{ owner: _id }, { isPrivate: false }] }] }).sort({ _id: -1 }).toArray();
            return res.status(200).json({ status: true, videos: videos });
        }
    } catch (ex) {
        next(ex);
    }
};

//get thumbnails
module.exports.getThumbs = async (req, res, next) => {
    try {
        const videoId = req.params.videoId;
        if (fs.existsSync(`${path.join(__dirname, `..`, `..`, `database`, `thumbnails`, `${videoId}.png`)}`))
            res.sendFile(`${path.join(__dirname, `..`, `..`, `database`, `thumbnails`, `${videoId}.png`)}`);
    } catch (ex) {
        next(ex);
    }
};