import React, { useState, useRef } from "react";

const AudioPlayer = ({ audioUrl, transcript }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Update current time
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  // Find the current word based on audio time
  const currentWordIndex = transcript.findIndex(
    ({ start, end }) => currentTime >= start && currentTime <= end
  );

  return (
    <div className="">
      <audio
        src={audioUrl}
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button onClick={togglePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
      <div className="max-w-full overflow-hidden">
        <p className="whitespace-normal">
          {transcript.map(({ word, start }, index) => (
            <React.Fragment key={start}>
              <span
                className={`${
                  index === currentWordIndex ? "bg-yellow-200" : ""
                }`}
              >
                {word + (index < transcript.length - 1 ? " " : "")}
              </span>
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};

export default AudioPlayer;
