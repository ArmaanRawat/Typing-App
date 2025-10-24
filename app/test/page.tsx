"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  useEffect(() => { userInputRef.current = userInput; }, [userInput]);
  useEffect(() => { testTextRef.current = testText; }, [testText]);
  useEffect(() => { errorsRef.current = errors; }, [errors]);
  useEffect(() => { backspacesRef.current = backspaces; }, [backspaces]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { targetValueRef.current = targetValue; }, [targetValue]);
  useEffect(() => { textSourceRef.current = textSource; }, [textSource]);
  useEffect(() => { startTimeRef.current = startTime; }, [startTime]);

  const generateRandomText = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
    return SAMPLE_TEXTS[randomIndex];
  };

  const finishTest = useCallback(async () => {
    if (finishingRef.current || !startTimeRef.current || testStatus !== "running") return;
    
    finishingRef.current = true;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const elapsedMinutes = elapsed / 60;

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

    setFinalMetrics(metrics);
    setTestStatus("finished");

    if (session?.user) {
      try {
        await fetch("/api/tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metrics),
        });
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFE4C4] via-[#FFDAB9] to-[#FFE4C4]">
      {/* Floating Navigation */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <nav className="bg-[#8B4513]/70 backdrop-blur-lg shadow-xl rounded-full border border-[#A0522D]/20">
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">⌨️</span>
                <h1 className="text-xl font-bold text-[#FFE4C4]">TypeCafé</h1>
              </Link>

              <div className="flex items-center gap-4">
                {session?.user && (
                  <Link
                    href="/dashboard"
                    className="text-[#FFE4C4] hover:text-[#FFDAB9] transition-colors font-medium text-sm"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/"
                  className="text-[#FFE4C4] hover:text-[#FFDAB9] transition-colors font-medium text-sm"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {testStatus === "idle" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
                ☕ Ready to Type?
              </h1>
              <p className="text-[#A0522D]">Configure your test and start brewing!</p>
            </div>

            {/* Mode Selection */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md">
              <label className="block text-sm font-semibold text-[#8B4513] mb-3">
                Test Mode
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode("time")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    mode === "time"
                      ? "bg-[#8B4513] text-[#FFE4C4] shadow-md"
                      : "bg-white border border-[#DEB887] text-[#8B4513] hover:bg-[#FFE4C4]"
                  }`}
                >
                  ⏱️ Time-based
                </button>
                <button
                  onClick={() => setMode("chars")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    mode === "chars"
                      ? "bg-[#8B4513] text-[#FFE4C4] shadow-md"
                      : "bg-white border border-[#DEB887] text-[#8B4513] hover:bg-[#FFE4C4]"
                  }`}
                >
                  📝 Character-based
                </button>
              </div>
            </div>

            {/* Duration/Character Count */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md">
              <label className="block text-sm font-semibold text-[#8B4513] mb-3">
                {mode === "time" ? "Duration" : "Character Count"}
              </label>
              <div className="flex gap-3">
                {mode === "time"
                  ? [15, 30, 60].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setTargetValue(sec)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                          targetValue === sec
                            ? "bg-[#D2691E] text-white shadow-md"
                            : "bg-white border border-[#DEB887] text-[#8B4513] hover:bg-[#FFE4C4]"
                        }`}
                      >
                        {sec}s
                      </button>
                    ))
                  : [100, 200].map((chars) => (
                      <button
                        key={chars}
                        onClick={() => setTargetValue(chars)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                          targetValue === chars
                            ? "bg-[#D2691E] text-white shadow-md"
                            : "bg-white border border-[#DEB887] text-[#8B4513] hover:bg-[#FFE4C4]"
                        }`}
                      >
                        {chars} chars
                      </button>
                    ))}
              </div>
            </div>

            {/* Text Source */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md">
              <label className="block text-sm font-semibold text-[#8B4513] mb-3">
                Text Source
              </label>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setTextSource("random")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    textSource === "random"
                      ? "bg-[#8B4513] text-[#FFE4C4] shadow-md"
                      : "bg-white border border-[#DEB887] text-[#8B4513] hover:bg-[#FFE4C4]"
                  }`}
                >
                  🎲 Random Text
                </button>
                <button
                  onClick={() => setTextSource("custom")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    textSource === "custom"
                      ? "bg-[#8B4513] text-[#FFE4C4] shadow-md"
                      : "bg-white border border-[#DEB887] text-[#8B4513] hover:bg-[#FFE4C4]"
                  }`}
                >
                  ✍️ Custom Text
                </button>
              </div>

              {textSource === "custom" && (
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste or type your custom text here..."
                  className="w-full px-4 py-3 bg-white border border-[#DEB887] rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent text-[#8B4513] placeholder-[#A0522D]/50"
                  rows={4}
                />
              )}
            </div>

            <button
              onClick={startTest}
              className="w-full bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-[#FFE4C4] py-4 rounded-xl text-lg font-bold hover:from-[#A0522D] hover:to-[#8B4513] transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Start Test ✨
            </button>
          </div>
        )}

        {testStatus === "running" && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mode === "time" ? (
                  <div className="text-center">
                    <div className="text-sm text-[#A0522D] mb-1">Time Left</div>
                    <div className="text-3xl font-bold text-[#8B4513]">{timeLeft}s</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-[#A0522D] mb-1">Chars Left</div>
                    <div className="text-3xl font-bold text-[#8B4513]">
                      {Math.max(0, targetValue - userInput.length)}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-sm text-[#A0522D] mb-1">WPM</div>
                  <div className="text-3xl font-bold text-[#8B4513]">{currentWpm}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-[#A0522D] mb-1">Raw WPM</div>
                  <div className="text-2xl font-bold text-[#A0522D]">{currentRawWpm}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-[#A0522D] mb-1">Errors</div>
                  <div className="text-3xl font-bold text-red-600">{errors}</div>
                </div>
              </div>
            </div>

            {/* Text Display */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#DEB887]/30 font-mono text-xl leading-relaxed">
              {testText.split("").map((char, i) => {
                let className = "text-[#A0522D]/40";
                if (i < userInput.length) {
                  className = userInput[i] === char 
                    ? "text-[#2F5233]" 
                    : "text-white bg-red-500 rounded";
                }
                if (i === userInput.length) {
                  className += " border-l-2 border-[#8B4513] animate-pulse";
                }
                return (
                  <span key={i} className={className}>
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Input Area */}
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-[#8B4513] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D2691E] font-mono text-lg text-[#8B4513] shadow-lg"
              rows={4}
              autoFocus
              placeholder="Start typing here..."
            />
          </div>
        )}

        {testStatus === "finished" && finalMetrics && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-[#8B4513] mb-2">
                Test Complete!
              </h2>
              <p className="text-[#A0522D]">Great job! Here are your results</p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-xl p-6 text-center shadow-lg">
                <div className="text-sm text-[#FFE4C4] mb-1">WPM</div>
                <div className="text-4xl font-bold text-[#FFE4C4]">
                  {Math.round(finalMetrics.wpm)}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 text-center shadow-md">
                <div className="text-sm text-[#A0522D] mb-1">Raw WPM</div>
                <div className="text-3xl font-bold text-[#8B4513]">
                  {Math.round(finalMetrics.rawWpm)}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 text-center shadow-md">
                <div className="text-sm text-[#A0522D] mb-1">Accuracy</div>
                <div className="text-3xl font-bold text-[#8B4513]">
                  {Math.round(finalMetrics.accuracy * 100)}%
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 text-center shadow-md">
                <div className="text-sm text-[#A0522D] mb-1">Errors</div>
                <div className="text-3xl font-bold text-red-600">{finalMetrics.errors}</div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-[#8B4513] mb-4 text-lg">📊 Detailed Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A0522D]">Duration:</span>
                  <span className="font-semibold text-[#8B4513]">{finalMetrics.durationSec}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0522D]">Characters:</span>
                  <span className="font-semibold text-[#8B4513]">{finalMetrics.charsTyped}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0522D]">Words:</span>
                  <span className="font-semibold text-[#8B4513]">{finalMetrics.wordsTyped}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0522D]">Backspaces:</span>
                  <span className="font-semibold text-[#8B4513]">{finalMetrics.backspaces}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={resetTest}
                className="bg-[#8B4513] text-[#FFE4C4] px-8 py-3 rounded-xl font-bold hover:bg-[#A0522D] transition-all transform hover:scale-105 shadow-lg"
              >
                Take Another Test ☕
              </button>
              {session?.user && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-white border border-[#DEB887] text-[#8B4513] px-8 py-3 rounded-xl font-bold hover:bg-[#FFE4C4] transition-all transform hover:scale-105 shadow-md"
                >
                  View Dashboard 📊
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}