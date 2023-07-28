# Motion

Video Sharing - simplified by Motion!

Motion is a video sharing platform based on HTTP Live Stream technology which let's you upload, stream, download and share your videos in real-time private rooms.

## Basic Features:
- Upload your videos.
 - Make a video public or private for personal access only.
 - Stream the content that are publicly available or owned by you.
 - Download the acccessible videos.

## Room Features:
- Create or join a room.
- Enter the video Id and hit play to let everyone enjoy the same content.
- Private sharing of videos in the rooms.
- Access to room admin to kick or ban any member.

# How things works?

## Streaming over HLS

HTTP live streaming (HLS) is one of the most widely used video streaming protocols. HLS breaks down video files into smaller chunks of downloadable HTTP files and delivers them using the HTTP protocol. Client devices load these HTTP files and then play them back as video.

## Authentication with HLS

Motion implements the HTTP live streaming with the help of Javascript library HLS.js on the client side, which also provides the option to customize the xhr request that will load the video files by using the xhrSetup property in the configuration. With Motion, the client incredibly sends a pre-post request to the server before loading the video to create a jwt signed url, token and a cookie for that particular request, and these credentials will be verified whenever an HLS request is made to load any chunks of the video files from the server. With this, Motion gives a multi-level secure streaming experience.

## Use of FFmpeg

With the implementation of HTTP live streaming, the uploaded videos are needed to be broke down into small chunks to make them HLS compatible and Motion implements it with the help of FFmpeg - a command-line tool, designed for processing of video and audio files. FFmpeg convert the uploaded video to HLS compatible format which consist of a m3u8 playlist file and its corresponding transport stream files.

Here is an example playlist

```
  #EXTM3U
   #EXT-X-TARGETDURATION:10

   #EXTINF:9.009,
   http://media.example.com/first.ts
   #EXTINF:9.009,
   http://media.example.com/second.ts
   #EXTINF:3.003,
   http://media.example.com/third.ts

```

As can be seen the source files for m3u8 format are packaged in an transport stream and broken up into a series of smaller chunks (.ts files).

## Sync using Socket.IO

The real-time synchronization of video and audio in a private room is smartly handled by Socket.IO. The media events in a room such as playing, pausing, seeking a video are emitted in the form of Socket.IO events and listened by the room members in real-time and accordingly acted.

# Preview
<img src="/preview/preview_1.png" width="400"> <img src="/preview/preview_2.png" width="400">
<img src="/preview/preview_3.png" width="400"> <img src="/preview/preview_4.png" width="400">
<img src="/preview/preview_5.png" width="400"> <img src="/preview/preview_6.png" width="400">

## Video Preview
[Motion Walkthrough Guide](https://youtu.be/2TaXu3EK3NM)

## Requirements

MongoDB server should be running locally.

## Deployment

To deploy this project

Open terminal and navigate to client

```bash
  cd motion/client
```
Install packages

```bash
  npm install
```
Now navigate to server

```bash
  cd ../server
```
Install packages

```bash
  npm install
```

Start the server

```bash
  npm start
```

Open a new terminal in client directory and start the app

```bash
  npm start
```
## Tech Stack

React.js, Node.js, MongoDB, Express.js, Socket.IO

## Created by
- [Subrat Pandey](https://github.com/32bitdev)
- [Archana Yadav](https://github.com/archanay1203)
