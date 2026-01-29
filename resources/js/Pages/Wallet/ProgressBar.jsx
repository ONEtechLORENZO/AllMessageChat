import React from "react";

const ProgressBar = (props) => {
  const {
    isLoading = props.percent === "loading",
    percent,
    size = "small",
    showInfo = false
  } = props;

  return (
    <div className="progress-outer">
      <div
        className={`progress ${size ? "progress--" + size : ""} ${
          isLoading ? "progress--" + "loading" : ""
        }`}
      >
        <div className={`progress-bar h-2 bg-green-400 rounded`} style={{ width: percent + "%" }}></div>
      </div>

      {isLoading == false && showInfo ? (
        <span className="progress-info">{percent}%</span>
      ) : (
        ""
      )}
    </div>
  );
};

export default ProgressBar;









