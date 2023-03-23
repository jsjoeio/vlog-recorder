import { useState, useEffect } from "react";

interface Props {
  setMicrophone: (deviceId: string) => void;
  setCamera: (deviceId: string) => void;
}

interface MediaDevice {
  deviceId: string;
  kind: "audioinput" | "videoinput";
  label: string;
}

export function CameraMicList({ setMicrophone, setCamera }: Props) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameraList = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setCameras(cameraList);
      const micList = devices.filter((device) => device.kind === "audioinput");
      setMicrophones(micList);
    };
    getDevices();
  }, []);

  const handleMicrophoneChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMicrophone(event.target.value);
  };

  const handleCameraChange = (deviceId: string) => {
    setCamera(deviceId);
  };

  return (
    <div className="dropdown dropdown-bottom">
      <label tabIndex={0} className="btn m-1">
        Click
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li>
          <p className="font-medium mb-1">Cameras</p>
          <ul>
            {cameras.map((camera) => (
              <li key={camera.deviceId}>
                <label>
                  <input
                    type="radio"
                    name="camera"
                    value={camera.deviceId}
                    onChange={() => handleCameraChange(camera.deviceId)}
                  />
                  {camera.label}
                </label>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <p className="font-medium mb-1">Microphones</p>
          <ul>
            {microphones.map((mic) => (
              <li key={mic.deviceId}>
                <label>
                  <input
                    type="radio"
                    name="microphone"
                    value={mic.deviceId}
                    onChange={() => handleMicrophoneChange(mic.deviceId)}
                  />
                  {mic.label}
                </label>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
