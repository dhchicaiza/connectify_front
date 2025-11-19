import { useState, useCallback } from "react";
import { initWebRTC } from "../../webrtc/webrtc";
/**
 * Simple voice control UI that toggles microphone state
 * and initiates the WebRTC flow the first time the user speaks.
 */
export default function Voice() {
  const [isSpeaking, setIsSpeaking] = useState(false); // State to track if the user is speaking
  const [callPeers, setCallPeers] = useState(true); // State to track if peers should be called

  // Function to start speaking
  const speak = useCallback(() => {
    setIsSpeaking(true);

    if (callPeers) {
      setCallPeers(false);
      initWebRTC();
    }
  }, [callPeers]);

  // Function to stop speaking
  const stop = useCallback(() => {
    setIsSpeaking(false);
  }, []);

  return (
    <div className="container-page">
      <div className="flex flex-col gap-4 w-full">
        <div className="button-speak">
          <button onClick={isSpeaking ? stop : speak}>
            {isSpeaking ? (
              "Mutear"
            ) : (
              "Hablar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}