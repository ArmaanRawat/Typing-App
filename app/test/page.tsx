"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Mode = "time" | "chars";
type TestStatus = "idle" | "running" | "finished";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Programming is the art of telling another human what one wants the computer to do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. Believe you can and you're halfway there. The only way to do great work is to love what you do.",
  "A journey of a thousand miles begins with a single step. Practice makes perfect. The expert in anything was once a beginner. Every accomplishment starts with the decision to try.",
];

export default function TestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [mode, setMode] = useState<Mode>("time");
  const [targetValue, setTargetValue] = useState(30);
  const [textSource, setTextSource] = useState<"random" | "custom">("random");
  const [customText, setCustomText] = useState("");
  
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testText, setTestText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [errors, setErrors] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [currentRawWpm, setCurrentRawWpm] = useState(0);
  const [finalMetrics, setFinalMetrics] = useState<any>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const finishingRef = useRef(false);
  
  // Refs to capture latest state
  const userInputRef = useRef("");
  const testTextRef = useRef("");
  const errorsRef = useRef(0);
  const backspacesRef = useRef(0);
  const modeRef = useRef<Mode>("time");
  const targetValueRef = useRef(30);
  const textSourceRef = useRef<"random" | "custom">("random");
  const startTimeRef = useRef<number | null>(null);

  // Update refs whenever state changes
  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    testTextRef.current = testText;
  }, [testText]);

  useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);

  useEffect(() => {
    backspacesRef.current = backspaces;
  }, [backspaces]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    targetValueRef.current = targetValue;
  }, [targetValue]);

  useEffect(() => {
    textSourceRef.current = textSource;
  }, [textSource]);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  const generateRandomText = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
    return SAMPLE_TEXTS[randomIndex];
  };

  const finishTest = useCallback(async () => {
    console.log("finishTest called", { 
      finishingRef: finishingRef.current, 
      startTime: startTimeRef.current, 
      testStatus,
      inputLength: userInputRef.current.length 
    });
    
    if (finishingRef.current || !startTimeRef.current || testStatus !== "running") {
      console.log("finishTest early return");
      return;
    }
    
    finishingRef.current = true;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const elapsedMinutes = elapsed / 60;

    console.log("Calculating metrics", { 
      userInputLength: userInputRef.current.length, 
      elapsed 
    });

    // If no input, set metrics with 0s
    if (userInputRef.current.length === 0) {
      const metrics = {
        durationSec: Math.round(elapsed),
        mode: modeRef.current,
        targetValue: targetValueRef.current,
        wpm: 0,
        rawWpm: 0,
        accuracy: 0,
        backspaces: 0,
        errors: 0,
        charsTyped: 0,
        wordsTyped: 0,
        source: textSourceRef.current,
      };
      console.log("No input metrics", metrics);
      setFinalMetrics(metrics);
      setTestStatus("finished");
      return;
    }

    let correctChars = 0;
    for (let i = 0; i < userInputRef.current.length; i++) {
      if (userInputRef.current[i] === testTextRef.current[i]) correctChars++;
    }

    const totalChars = userInputRef.current.length;
    const accuracy = correctChars / totalChars;

    const wpm = (correctChars / 5) / elapsedMinutes;
    const rawWpm = (totalChars / 5) / elapsedMinutes;

    const wordsTyped = userInputRef.current.trim().split(/\s+/).filter(w => w.length > 0).length;

    const metrics = {
      durationSec: Math.round(elapsed),
      mode: modeRef.current,
      targetValue: targetValueRef.current,
      wpm: parseFloat(wpm.toFixed(2)),
      rawWpm: parseFloat(rawWpm.toFixed(2)),
      accuracy: parseFloat(accuracy.toFixed(4)),
      backspaces: backspacesRef.current,
      errors: errorsRef.current,
      charsTyped: totalChars,
      wordsTyped,
      source: textSourceRef.current,
    };

    console.log("Final metrics calculated", metrics);

    setFinalMetrics(metrics);
    setTestStatus("finished");

    // Save to database if logged in
    if (session?.user) {
      console.log("Saving to database...");
      try {
        const response = await fetch("/api/tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metrics),
        });
        
        const data = await response.json();
        console.log("API response", { ok: response.ok, data });
        
        if (!response.ok) {
          console.error("Failed to save test result", data);
        } else {
          console.log("Test saved successfully");
        }
      } catch (error) {
        console.error("Failed to save test result:", error);
      }
    }
  }, [session, testStatus]);

  const startTest = () => {
    const text = textSource === "random" ? generateRandomText() : customText;
    if (!text.trim()) {
      alert("Please enter or generate text first!");
      return;
    }

    setTestText(text);
    setUserInput("");
    setErrors(0);
    setBackspaces(0);
    setCurrentWpm(0);
    setCurrentRawWpm(0);
    setFinalMetrics(null);
    setStartTime(Date.now());
    setTestStatus("running");
    finishingRef.current = false;
    
    if (mode === "time") {
      setTimeLeft(targetValue);
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Timer countdown
  useEffect(() => {
    if (testStatus !== "running" || mode !== "time") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!finishingRef.current) {
            finishTest();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testStatus, mode, finishTest]);

  // Update WPM in real-time
  useEffect(() => {
    if (testStatus !== "running" || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      if (elapsed === 0 || userInput.length === 0) return;

      let correctChars = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === testText[i]) correctChars++;
      }

      const wpm = Math.round((correctChars / 5) / elapsed);
      const rawWpm = Math.round((userInput.length / 5) / elapsed);

      setCurrentWpm(wpm || 0);
      setCurrentRawWpm(rawWpm || 0);
    }, 500);

    return () => clearInterval(interval);
  }, [testStatus, startTime, userInput, testText]);

  const handleInputChange = (value: string) => {
    if (testStatus !== "running") return;

    if (value.length < userInput.length) {
      setBackspaces((prev) => prev + 1);
    }

    setUserInput(value);

    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== testText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);

    if (mode === "chars" && value.length >= targetValue) {
      if (!finishingRef.current) {
        finishTest();
      }
    }
  };

  const resetTest = () => {
    setTestStatus("idle");
    setUserInput("");
    setTestText("");
    setStartTime(null);
    setErrors(0);
    setBackspaces(0);
    setCurrentWpm(0);
    setCurrentRawWpm(0);
    setFinalMetrics(null);
    finishingRef.current = false;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {testStatus === "idle" && (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Typing Test</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Mode
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setMode("time")}
                className={`px-4 py-2 rounded-lg border ${
                  mode === "time"
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Time-based
              </button>
              <button
                onClick={() => setMode("chars")}
                className={`px-4 py-2 rounded-lg border ${
                  mode === "chars"
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Character-based
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === "time" ? "Duration" : "Character Count"}
            </label>
            <div className="flex gap-3">
              {mode === "time"
                ? [15, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setTargetValue(sec)}
                      className={`px-4 py-2 rounded-lg border ${
                        targetValue === sec
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))
                : [100, 200].map((chars) => (
                    <button
                      key={chars}
                      onClick={() => setTargetValue(chars)}
                      className={`px-4 py-2 rounded-lg border ${
                        targetValue === chars
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {chars} chars
                    </button>
                  ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Source
            </label>
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => setTextSource("random")}
                className={`px-4 py-2 rounded-lg border ${
                  textSource === "random"
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Random Text
              </button>
              <button
                onClick={() => setTextSource("custom")}
                className={`px-4 py-2 rounded-lg border ${
                  textSource === "custom"
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Custom Text
              </button>
            </div>

            {textSource === "custom" && (
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste or type your custom text here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                rows={4}
              />
            )}
          </div>

          <button
            onClick={startTest}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800"
          >
            Start Test
          </button>
        </>
      )}

      {testStatus === "running" && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {mode === "time" ? (
              <div>
                <div className="text-sm text-gray-600">Time Left</div>
                <div className="text-3xl font-bold text-gray-900">{timeLeft}s</div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600">Characters Left</div>
                <div className="text-3xl font-bold text-gray-900">
                  {Math.max(0, targetValue - userInput.length)}
                </div>
              </div>
            )}

            <div>
              <div className="text-sm text-gray-600">WPM</div>
              <div className="text-3xl font-bold text-gray-900">{currentWpm}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Raw WPM</div>
              <div className="text-2xl font-bold text-gray-700">{currentRawWpm}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Errors</div>
              <div className="text-3xl font-bold text-red-600">{errors}</div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 mb-4 font-mono text-xl leading-relaxed break-words">
            {testText.split("").map((char, i) => {
              let className = "text-gray-400";
              if (i < userInput.length) {
                className = userInput[i] === char 
                  ? "text-green-600" 
                  : "text-white bg-red-600";
              }
              if (i === userInput.length) {
                className += " border-l-2 border-blue-500";
              }
              return (
                <span key={i} className={className}>
                  {char}
                </span>
              );
            })}
          </div>

          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none font-mono text-lg"
            rows={4}
            autoFocus
          />
        </>
      )}

      {testStatus === "finished" && finalMetrics && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Test Complete! 🎉</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">WPM</div>
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(finalMetrics.wpm)}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Raw WPM</div>
              <div className="text-2xl font-bold text-gray-700">
                {Math.round(finalMetrics.rawWpm)}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Accuracy</div>
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(finalMetrics.accuracy * 100)}%
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Errors</div>
              <div className="text-3xl font-bold text-red-600">{finalMetrics.errors}</div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3 text-gray-900">Detailed Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>Duration: {finalMetrics.durationSec}s</div>
              <div>Characters Typed: {finalMetrics.charsTyped}</div>
              <div>Words Typed: {finalMetrics.wordsTyped}</div>
              <div>Backspaces: {finalMetrics.backspaces}</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetTest}
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800"
            >
              Take Another Test
            </button>
            {session?.user && (
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                View Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}