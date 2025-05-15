//@ts-nocheck
import browser from "webextension-polyfill";

console.log("[Rodoh Extension] Content script loaded!");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(
    "[Rodoh Extension] Content script received message:",
    message.type,
  );

  if (message.type === "RECORDING_DATA") {
    try {
      const dataToStore = {
        data: {
          videoData: message.data.videoData,
          recordingId: message.data.recordingId,
          fileName: message.data.fileName,
          fileSize: message.data.fileSize,
          mimeType: message.data.mimeType,
          timestamp: message.data.timestamp,
        },
      };

      localStorage.setItem("recordingData", JSON.stringify(dataToStore));
      console.log("[Rodoh Extension] Recording data stored in localStorage");
      window.dispatchEvent(
        new CustomEvent("rodoh:recording-ready", {
          detail: { recordingId: message.data.recordingId },
        }),
      );

      sendResponse({ success: true });
    } catch (error) {
      console.error("[Rodoh Extension] Error storing recording data:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const awaiting = urlParams.get("awaiting");
  const recordingId = urlParams.get("recordingId");

  if (awaiting === "recording" && recordingId) {
    console.log(
      "[Rodoh Extension] Page ready for recording, sending notification to background script",
    );
    browser.runtime
      .sendMessage({
        type: "PAGE_READY_FOR_RECORDING",
        recordingId: recordingId,
      })
      .catch((err) => {
        console.error(
          "[Rodoh Extension] Error sending PAGE_READY_FOR_RECORDING message:",
          err,
        );
      });
  }
});
