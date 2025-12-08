/**
 * Type declarations for webrtc.js module
 */
export declare function initWebRTC(roomId: string, userName: string): Promise<void>;
export declare function disableOutgoingStream(): void;
export declare function enableOutgoingStream(): void;
export declare function disableOutgoingVideo(): void;
export declare function enableOutgoingVideo(): void;
export declare function getLocalStream(): MediaStream | null;

