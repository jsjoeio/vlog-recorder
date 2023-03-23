import React, { useState, useEffect } from "react";

interface Props {
  setMicrophone: (deviceId: string) => void;
  setCamera: (deviceId: string) => void;
}

type SelectListProps = {
  title: string;
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  handleSelected: (deviceId: string) => void;
};

export function DeviceList({
  title,
  devices,
  selectedDevice,
  handleSelected,
}: SelectListProps) {
  return (
    <div className="form-control max-w-xs">
      <label className="label">
        <span className="label-text">{title}</span>
      </label>
      <select
        className="select select-bordered select-sm"
        onChange={(event) => {
          console.log(event.target.value);
          handleSelected(event.target.value);
        }}
      >
        {devices.map((device) => (
          <option
            key={device.deviceId}
            value={device.deviceId}
            selected={device.deviceId === selectedDevice}
          >
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
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
    <div className="flex flex-col justify-center items-center mb-4">
      <DeviceList
        title="Microphone:"
        devices={microphones}
        selectedDevice={microphoneDeviceId}
        handleSelected={setMicrophoneDeviceId}
      />
      <DeviceList
        title="Camera:"
        devices={cameras}
        selectedDevice={cameraDeviceId}
        handleSelected={setCameraDeviceId}
      />
    </div>
  );
};

export default CameraAndMicLists;
