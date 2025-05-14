//@ts-nocheck
import browser from "webextension-polyfill";
import { MESSAGE_TYPES } from "./enums/messages";

let activeStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordingChunks: Blob[] = [];

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});

browser.runtime.onMessage.addListener(async (message) => {
  console.log("Background received message:", message.type);
  console.log(
    "Current recording status:",
    mediaRecorder?.state === "recording",
  );

  switch (message.type) {
    case MESSAGE_TYPES.START_RECORDING:
      console.log("Starting recording...");
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        activeStream = stream;
        mediaRecorder = new MediaRecorder(stream);
        recordingChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          recordingChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const recording = new Blob(recordingChunks, { type: "video/webm" });
          const url = URL.createObjectURL(recording);
          browser.downloads.download({
            url: url,
            filename: `screen-recording-${Date.now()}.webm`,
            saveAs: true,
          });
          URL.revokeObjectURL(url);

          activeStream?.getTracks().forEach((track) => track.stop());
          activeStream = null;
          mediaRecorder = null;
          recordingChunks = [];

          browser.storage.local.set({ isRecording: false });
        };

        mediaRecorder.start();
        console.log("Recording started successfully");
        browser.storage.local.set({ isRecording: true });
        return true;
      } catch (error) {
        console.error("Error starting recording:", error);
        browser.storage.local.set({ isRecording: false });
      }
      break;

    case MESSAGE_TYPES.STOP_RECORDING:
      console.log("Stopping recording...");
      if (mediaRecorder?.state === "recording") {
        mediaRecorder.stop();
        console.log("Recording stopped successfully");
        return true;
      } else {
        console.log("No active recording to stop");
      }
      break;

    case MESSAGE_TYPES.GET_RECORDING_STATUS:
      const status = mediaRecorder?.state === "recording";
      console.log("Current recording status:", status);
      return status;

    case MESSAGE_TYPES.UPDATE_RECORDING_STATE:
      await browser.storage.local.set({ isRecording: message.isRecording });
      break;

    case MESSAGE_TYPES.GET_RECORDING_STATE:
      const state = await browser.storage.local.get("isRecording");
      return !!state.isRecording;
  }
});

browser.runtime.onSuspend.addListener(() => {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
  }
});

browser.action.onClicked.addListener(async () => {
  await browser.tabs.create({
    url: browser.runtime.getURL("src/popup.html"),
  });
});
