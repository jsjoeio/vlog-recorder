import React from "react";

interface DateProps {
  date: Date;
}

export const DateDisplay: React.FC<DateProps> = ({ date }) => {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <small className="block text-xs text-base-content font-light">
      {formattedDate}
    </small>
  );
};
