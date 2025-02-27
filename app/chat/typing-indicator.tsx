import React from "react";

export const TypingIndicator = () => {
  return (
    <div className="flex space-x-1">
      <div
        className="size-2 bg-gray-400 rounded-full animate-typing"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="size-2 bg-gray-400 rounded-full animate-typing"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="size-2 bg-gray-400 rounded-full animate-typing"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  );
};

export default TypingIndicator;
