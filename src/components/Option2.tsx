import React, { useState, useEffect } from "react";

interface Props {
  setMicrophone: (deviceId: string) => void;
  setCamera: (deviceId: string) => void;
}



const CameraAndMicLists: React.FC<Props> = ({ setMicrophone, setCamera }) => {
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState<string>("");
  const [cameraDeviceId, setCameraDeviceId] = useState<string>("");
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    // Get available audio and video devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        ) as MediaDeviceInfo[];

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        ) as MediaDeviceInfo[];

        setMicrophones(audioDevices);
        setCameras(videoDevices);
      })
      .catch((error) => {
        console.error("Error enumerating devices:", error);
      });
  }, []);

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setCameraDeviceId(deviceId);
    setMicrophoneDeviceId(deviceId);
    setCamera(deviceId);
  };

  const handleMicrophoneChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const deviceId = event.target.value;
    setMicrophoneDeviceId(deviceId);
    setMicrophone(deviceId);
  };

  return (
    <div>
      <label>Microphone:</label>
      <select
        className="select select-secondary w-full max-w-xs"
        onChange={handleMicrophoneChange}
        value={microphoneDeviceId}
      >
        {microphones.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
      <label>Camera:</label>
      <select
        className="select select-secondary w-full max-w-xs"
        onChange={handleCameraChange}
        value={cameraDeviceId}
      >
        {cameras.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CameraAndMicLists;
