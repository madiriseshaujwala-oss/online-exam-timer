import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("welcome");
  const [examName, setExamName] = useState("My Examination");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [alarm, setAlarm] = useState(true);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState("waiting");

  const alarmPlayed = useRef(false);
  const audioContext = useRef(null);

  // Calculate the countdown using useEffect
  useEffect(() => {
    if (page !== "timer") return;

    const updateTimer = () => {
      const start = new Date(`${examDate}T${examTime}`).getTime();
      const end = start + Number(duration) * 60 * 1000;
      const now = Date.now();

      if (now < start) {
        setStatus("waiting");
        setRemaining(Math.ceil((start - now) / 1000));
      } else if (now < end) {
        setStatus("running");
        setRemaining(Math.ceil((end - now) / 1000));
      } else {
        setStatus("finished");
        setRemaining(0);

        // Play the alarm only once
        if (alarm && !alarmPlayed.current) {
          alarmPlayed.current = true;

          try {
            const audio = audioContext.current;
            if (audio) {
              audio.resume();
              [0, 0.5, 1].forEach((delay) => {
                setTimeout(() => {
                  const oscillator = audio.createOscillator();
                  const gain = audio.createGain();

                  oscillator.connect(gain);
                  gain.connect(audio.destination);
                  oscillator.frequency.value = 880;
                  gain.gain.value = 0.2;

                  oscillator.start();
                  oscillator.stop(audio.currentTime + 0.2);
                }, delay * 1000);
              });
            }
          } catch (error) {
            console.log("Alarm could not play.");
          }
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [page, examDate, examTime, duration, alarm]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return [h, m, s]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const startExam = () => {
    if (!examDate || !examTime || Number(duration) < 1) {
      alert("Please enter the exam date, time, and duration.");
      return;
    }

    const start = new Date(`${examDate}T${examTime}`).getTime();

    if (Number.isNaN(start)) {
      alert("Please enter a valid exam date and time.");
      return;
    }

    if (start + Number(duration) * 60000 <= Date.now()) {
      alert("This exam's end time has already passed. Choose a future time.");
      return;
    }

    alarmPlayed.current = false;

    // Prepare audio after the user's button click
    try {
      const AudioClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioClass && !audioContext.current) {
        audioContext.current = new AudioClass();
      }
      audioContext.current?.resume();
    } catch (error) {
      console.log("Audio is not available.");
    }

    setPage("timer");
  };

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <main className="app">
      <div className="card">
        <div className="logo">⏱</div>

        {page === "welcome" && (
          <section className="content">
            <p className="tag">STAY FOCUSED. FINISH STRONG.</p>
            <h1>Online Examination Timer</h1>
            <p className="description">
              Plan your exam, track every second, and finish
              with confidence.
            </p>
            <button
              className="primary"
              onClick={() => setPage("settings")}
            >
              Continue to Exam Settings →
            </button>
          </section>
        )}

        {page === "settings" && (
          <section className="content">
            <p className="tag">SET UP YOUR EXAM</p>
            <h1>Exam Settings</h1>

            <label>Exam Name</label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Enter exam name"
            />

            <label>Exam Date</label>
            <input
              type="date"
              min={todayString}
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />

            <label>Exam Start Time</label>
            <input
              type="time"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
            />

            <label>Exam Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />

            <label className="alarm-option">
              <input
                type="checkbox"
                checked={alarm}
                onChange={(e) => setAlarm(e.target.checked)}
              />
              Enable alarm sound
            </label>

            <button className="primary" onClick={startExam}>
              Start Examination →
            </button>

            <button
              className="secondary"
              onClick={() => setPage("welcome")}
            >
              ← Back
            </button>
          </section>
        )}

        {page === "timer" && (
          <section className="content">
            <p className="tag">ONLINE EXAMINATION</p>
            <h1>{examName || "My Examination"}</h1>

            <p className="status">
              {status === "waiting" && "Your exam will begin in"}
              {status === "running" && "Time Remaining"}
              {status === "finished" && "Examination Completed"}
            </p>

            {status !== "finished" ? (
              <div className="countdown">
                {formatTime(remaining)}
              </div>
            ) : (
              <div className="finished">
                <div className="checkmark">✓</div>
                <h2>Exam Time Is Over!</h2>
                <p>Your examination has ended. Well done!</p>
              </div>
            )}

            <p className="exam-detail">
              Duration: {duration} minutes
            </p>

            {status === "waiting" && (
              <p className="hint">
                Keep this page open. The exam starts automatically
                at the selected time.
              </p>
            )}

            {status === "running" && (
              <p className="hint">
                Do your best. Your timer is running!
              </p>
            )}

            <button
              className="secondary"
              onClick={() => {
                setPage("settings");
                setStatus("waiting");
              }}
            >
              Back to Settings
            </button>

            <button
              className="primary"
              onClick={() => {
                setPage("welcome");
                setStatus("waiting");
              }}
            >
              Return Home
            </button>
          </section>
        )}
      </div>

      <footer>ONLINE EXAMINATION TIMER • REACT PROJECT</footer>
    </main>
  );
}

export default App;
