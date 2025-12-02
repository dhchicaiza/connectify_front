import { useState, useEffect } from "react";

/**
 * Custom React hook for managing media controls (microphone and camera) for a local media stream.
 * 
 * This hook provides state management and toggle functions for muting/unmuting the microphone
 * and enabling/disabling the camera. It automatically syncs the UI state with the actual
 * track states in the MediaStream.
 * 
 * @param {MediaStream | null} localStream - The local media stream containing audio and/or video tracks.
 * @param {(s: MediaStream | null) => void} setlocalStream - Setter function to update the local stream state.
 * 
 * @returns {Object} An object containing media control state and functions:
 * @returns {boolean} returns.isMuted - Whether the microphone is currently muted.
 * @returns {boolean} returns.isCameraOff - Whether the camera is currently disabled.
 * @returns {boolean} returns.hasMic - Whether the stream has audio tracks available.
 * @returns {boolean} returns.hasCamera - Whether the stream has video tracks available.
 * @returns {() => void} returns.toggleMute - Function to toggle microphone mute/unmute state.
 * @returns {() => void} returns.toggleCamera - Function to toggle camera on/off state.
 * 
 * @example
 * ```tsx
 * const { isMuted, isCameraOff, toggleMute, toggleCamera } = useMediaControls(
 *   localStream,
 *   setLocalStream
 * );
 * 
 * <button onClick={toggleMute}>
 *   {isMuted ? 'Unmute' : 'Mute'}
 * </button>
 * ```
 * 
 * @author Connectify Team
 * @since 1.0.0
 */
export function useMediaControls(
     localStream: MediaStream | null,
     setlocalStream: (s: MediaStream | null) => void 
) { 
    const [isMuted, setIsMuted] = useState(false); 
    const [isCameraOff, setIsCameraOff] = useState(false); 
    const [hasMic, setHasMic] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);

    /**
     * Effect hook that synchronizes the UI state with the actual track states in the MediaStream.
     * Updates hasMic, hasCamera, isMuted, and isCameraOff based on the tracks present in the stream
     * and their enabled/disabled status.
     */
     useEffect(() => {
         if (!localStream) {
            setHasMic(false);
            setHasCamera(false);
            setIsCameraOff(true);
            return;
        }
        const audioTracks = localStream.getAudioTracks();
        const videoTracks = localStream.getVideoTracks();

        setHasMic(audioTracks.length > 0);
        setHasCamera(videoTracks.length > 0);

        if (videoTracks.length > 0) {
            setIsCameraOff(!videoTracks[0].enabled); 
        } else {
        setIsCameraOff(true);
    }
    if (audioTracks.length > 0) {
         setIsMuted(!audioTracks[0].enabled); 
         }
         }, [localStream]);

    /**
     * Toggles the microphone mute/unmute state.
     * Enables or disables all audio tracks in the local stream and updates the isMuted state.
     * 
     * @function toggleMute
     * @returns {void}
     * 
     * @description
     * If no local stream is available or there are no audio tracks, the function returns early
     * and sets hasMic to false. Otherwise, it toggles the enabled state of all audio tracks
     * and updates the isMuted state accordingly.
     */
    const toggleMute = () => {
         if (!localStream) return;
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
         setHasMic(false);
          return;
         }
    const newMuted = !isMuted;
    audioTracks.forEach((t) => { t.enabled = !t.enabled; });
     setIsMuted(newMuted);
  };

    /**
     * Toggles the camera on/off state.
     * Enables or disables all video tracks in the local stream and updates the isCameraOff state.
     * 
     * @function toggleCamera
     * @returns {void}
     * 
     * @description
     * If no local stream is available or there are no video tracks, the function returns early
     * and sets hasCamera to false. Otherwise, it toggles the enabled state of all video tracks
     * and updates the isCameraOff state accordingly.
     */
    const toggleCamera = () => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) {
         setHasCamera(false);
         return;
         }

    const newCameraOff = !isCameraOff;
    videoTracks.forEach((t) => { t.enabled = !t.enabled; });
     setIsCameraOff(newCameraOff);
    };

    return {
    isMuted,
    isCameraOff,
    hasMic,
    hasCamera,
    toggleMute,
    toggleCamera,
 };
}