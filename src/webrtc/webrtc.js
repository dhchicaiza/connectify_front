import Peer from "simple-peer/simplepeer.min.js";
import io from "socket.io-client";

// URLs and credentials for WebRTC and ICE servers
const serverWebRTCUrl = import.meta.env.VITE_WEBRTC_URL;
const iceServerUrl = import.meta.env.VITE_ICE_SERVER_URL;
const iceServerUsername = import.meta.env.VITE_ICE_SERVER_USERNAME;
const iceServerCredential = import.meta.env.VITE_ICE_SERVER_CREDENTIAL;

let socket = null;
let peers = {};
let localMediaStream = null;

/**
 * Initializes the WebRTC connection if supported.
 * @async
 * @function init
 * @param {string} roomId - The room ID to join
 * @param {string} userName - The user's display name
 */
export const initWebRTC = async (roomId, userName) => {
  if (Peer.WEBRTC_SUPPORT) {
    try {
      localMediaStream = await getMedia();
      initSocketConnection(roomId, userName);
    } catch (error) {
      console.error("Failed to initialize WebRTC connection:", error);
    }
  } else {
    console.warn("WebRTC is not supported in this browser.");
  }
};

/**
 * Gets the user's media stream (audio and video).
 * @async
 * @function getMedia
 * @returns {Promise<MediaStream>} The user's media stream.
 */
async function getMedia() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      }
    });
  } catch (err) {
    console.error("Failed to get user media:", err);
    throw err;
  }
}

/**
 * Initializes the socket connection and sets up event listeners.
 * @function initSocketConnection
 * @param {string} roomId - The room ID to join
 * @param {string} userName - The user's display name
 */
function initSocketConnection(roomId, userName) {
  socket = io(serverWebRTCUrl, {
    query: { room: roomId, name: userName }
  });

  socket.on("usersInRoom", handleIntroduction);
  socket.on("newUserConnected", handleNewUserConnected);
  socket.on("userDisconnected", handleUserDisconnected);
  socket.on("signal", handleSignal);
}

/**
 * Handles the introduction event (existing users in room).
 * @param {Array<{id: string, name: string}>} existingUsers - Array of existing users in room.
 */
function handleIntroduction(existingUsers) {
  console.log("🎬 Users already in room:", existingUsers);
  existingUsers.forEach((user) => {
    if (user.id !== socket.id) {
      console.log(`📞 Initiating call to ${user.name} (${user.id})`);
      peers[user.id] = { peerConnection: createPeerConnection(user.id, true) };
      createClientMediaElements(user.id);
    }
  });
}

/**
 * Handles the new user connected event.
 * @param {{id: string, name: string}} userData - The newly connected user data.
 */
function handleNewUserConnected(userData) {
  console.log(`👋 New user connected: ${userData.name} (${userData.id})`);
  if (userData.id !== socket.id && !(userData.id in peers)) {
    peers[userData.id] = {};
    createClientMediaElements(userData.id);
  }
}

/**
 * Handles the user disconnected event.
 * @param {{userId: string}} data - The disconnected user data.
 */
function handleUserDisconnected(data) {
  console.log(`👋 User disconnected: ${data.userId}`);
  if (data.userId !== socket.id) {
    removeClientVideoElement(data.userId);
    delete peers[data.userId];
  }
}

/**
 * Handles the signal event.
 * @param {{from: string, data: any}} signalData - The signal data from peer.
 */
function handleSignal(signalData) {
  const { from, data } = signalData;
  console.log(`📡 Signal received from ${from}`);

  let peer = peers[from];
  if (peer && peer.peerConnection) {
    peer.peerConnection.signal(data);
  } else {
    console.log(`📞 Creating peer connection for ${from}`);
    let peerConnection = createPeerConnection(from, false);
    peers[from] = { peerConnection };
    peerConnection.signal(data);
  }
}

/**
 * Creates a new peer connection.
 * @function createPeerConnection
 * @param {string} theirSocketId - The socket ID of the peer.
 * @param {boolean} [isInitiator=false] - Whether the current client is the initiator.
 * @returns {Peer} The created peer connection.
 */
function createPeerConnection(theirSocketId, isInitiator = false) {
  const iceServers = [];

  if (iceServerUrl) {
    const urls = iceServerUrl
      .split(",")
      .map(url => url.trim())
      .filter(Boolean)
      .map(url => {
        if (!/^stun:|^turn:|^turns:/.test(url)) {
          return `turn:${url}`;
        }
        return url;
      });

    urls.forEach(url => {
      const serverConfig = { urls: url };
      if (iceServerUsername) {
        serverConfig.username = iceServerUsername;
      }
      if (iceServerCredential) {
        serverConfig.credential = iceServerCredential;
      }
      iceServers.push(serverConfig);
    });
  }

  if (!iceServers.length) {
    iceServers.push({ urls: "stun:stun.l.google.com:19302" });
  } else {
    const hasTurn = iceServers.some(server =>
      Array.isArray(server.urls)
        ? server.urls.some(url => url.startsWith("turn:") || url.startsWith("turns:"))
        : server.urls.startsWith("turn:") || server.urls.startsWith("turns:")
    );
    if (!hasTurn) {
      iceServers.push({ urls: "stun:stun.l.google.com:19302" });
    }
  }

  const peerConnection = new Peer({
    initiator: isInitiator,
    config: {
      iceServers,
    },
  });

  peerConnection.on("signal", (data) =>
    socket.emit("signal", { to: theirSocketId, data })
  );

  peerConnection.on("connect", () =>
    peerConnection.addStream(localMediaStream)
  );
  peerConnection.on("stream", (stream) =>
    updateClientMediaElements(theirSocketId, stream)
  );

  return peerConnection;
}

/**
 * Disables the outgoing audio stream (mute microphone).
 * @function disableOutgoingStream
 */
export function disableOutgoingStream() {
  if (localMediaStream) {
    localMediaStream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    console.log("🔇 Audio disabled");
  }
}

/**
 * Enables the outgoing audio stream (unmute microphone).
 * @function enableOutgoingStream
 */
export function enableOutgoingStream() {
  if (localMediaStream) {
    localMediaStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    console.log("🎤 Audio enabled");
  }
}

/**
 * Disables the outgoing video stream (turn off camera).
 * @function disableOutgoingVideo
 */
export function disableOutgoingVideo() {
  if (localMediaStream) {
    localMediaStream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    console.log("📹 Video disabled");
  }
}

/**
 * Enables the outgoing video stream (turn on camera).
 * @function enableOutgoingVideo
 */
export function enableOutgoingVideo() {
  if (localMediaStream) {
    localMediaStream.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });
    console.log("📹 Video enabled");
  }
}

/**
 * Gets the local media stream.
 * @function getLocalStream
 * @returns {MediaStream | null} The local media stream
 */
export function getLocalStream() {
  return localMediaStream;
}

/**
 * Creates media elements for a client (video with audio).
 * @function createClientMediaElements
 * @param {string} _id - The ID of the client.
 */
function createClientMediaElements(_id) {
  // Create video element that will contain both video and audio
  const videoEl = document.createElement("video");
  videoEl.id = `${_id}_video`;
  videoEl.autoplay = true;
  videoEl.playsInline = true;
  videoEl.muted = false; // Not muted so we can hear the remote audio
  videoEl.style.display = "none"; // Hidden by default, will be shown by React component
  document.body.appendChild(videoEl);

  videoEl.addEventListener("loadeddata", () => {
    console.log(`📹 Video loaded for peer ${_id}`);
    videoEl.play().catch(err => console.error("Error playing video:", err));
  });
}

/**
 * Updates media elements for a client with a new stream.
 * @function updateClientMediaElements
 * @param {string} _id - The ID of the client.
 * @param {MediaStream} stream - The new media stream.
 */
function updateClientMediaElements(_id, stream) {
  const videoEl = document.getElementById(`${_id}_video`);
  if (videoEl) {
    videoEl.srcObject = stream;
    console.log(`📹 Updated video stream for peer ${_id}`, {
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length
    });
  }
}

/**
 * Removes media elements for a client.
 * @function removeClientVideoElement
 * @param {string} _id - The ID of the client.
 */
function removeClientVideoElement(_id) {
  const videoEl = document.getElementById(`${_id}_video`);
  if (videoEl) {
    videoEl.srcObject = null;
    videoEl.remove();
    console.log(`🗑️ Removed video element for peer ${_id}`);
  }
}