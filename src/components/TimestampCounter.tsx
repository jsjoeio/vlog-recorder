import React, { useState, useEffect } from "react";

export const TimestampCounter: React.FC = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

  return <small className="font-light">{formattedTime}</small>;
};
