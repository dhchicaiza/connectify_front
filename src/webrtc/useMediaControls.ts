import { useState, useEffect } from "react";

export function useMediaControls(
     localStream: MediaStream | null,
     setlocalStream: (s: MediaStream | null) => void 
) { 
    const [isMuted, setIsMuted] = useState(false); 
    const [isCameraOff, setIsCameraOff] = useState(false); 
    const [hasMic, setHasMic] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);

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