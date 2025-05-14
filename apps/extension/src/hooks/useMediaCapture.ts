//@ts-nocheck
import { useState, useEffect, useRef } from "react";
import browser from "webextension-polyfill";
import { MESSAGE_TYPES } from "../enums/messages";

interface MediaCaptureHook {
  isRecording: boolean;
  captureMedia: () => Promise<void>;
  stopCapture: () => Promise<void>;
}

const useMediaCapture = (): MediaCaptureHook => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tabIdRef = useRef<number | null>(null);

  useEffect(() => {
    browser.runtime
      .sendMessage({ type: MESSAGE_TYPES.GET_RECORDING_STATE })
      .then((state) => {
        if (typeof state === "boolean") {
          setIsRecording(state);
        }
      })
      .catch((err) => {});

    const handleStorageChange = (
      changes: { [key: string]: browser.Storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes.isRecording) {
        setIsRecording(changes.isRecording.newValue);
      }
    };

    const messageListener = (
      message: any,
      sender: browser.Runtime.MessageSender,
    ) => {
      if (
        message.type === "PAGE_READY_FOR_RECORDING" &&
        chunksRef.current.length > 0 &&
        sender.tab?.id
      ) {
        tabIdRef.current = sender.tab.id;
        sendRecordingToTab();
      }
    };

    browser.runtime.onMessage.addListener(messageListener);
    browser.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.local.onChanged.removeListener(handleStorageChange);
      browser.runtime.onMessage.removeListener(messageListener);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        setIsRecording(false);
        browser.runtime
          .sendMessage({
            type: MESSAGE_TYPES.UPDATE_RECORDING_STATE,
            isRecording: false,
          })
          .catch((err) => {});
      }
    };
  }, []);

  const sendRecordingToTab = async () => {
    if (!tabIdRef.current || chunksRef.current.length === 0) return;

    try {
      const recordingBlob = new Blob(chunksRef.current, { type: "video/webm" });

      const reader = new FileReader();
      reader.readAsDataURL(recordingBlob);

      reader.onloadend = async () => {
        const base64data = reader.result as string;

        await browser.tabs.sendMessage(tabIdRef.current!, {
          type: "RECORDING_DATA",
          data: {
            videoData: base64data,
            fileName: "screen-recording.webm",
            fileSize: recordingBlob.size,
            mimeType: "video/webm",
            timestamp: Date.now(),
          },
        });
      };
    } catch (error) {}
  };

  const captureMedia = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      let audioStream: MediaStream | null = null;
      let combinedStream: MediaStream;

      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });
        const tracks = [...displayStream.getVideoTracks()];
        displayStream
          .getAudioTracks()
          .forEach((track) => tracks.push(track.clone()));
        audioStream
          .getAudioTracks()
          .forEach((track) => tracks.push(track.clone()));
        combinedStream = new MediaStream(tracks);
      } catch (err) {
        combinedStream = displayStream;
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          if (chunksRef.current.length === 0) {
            setIsRecording(false);
            await browser.runtime.sendMessage({
              type: MESSAGE_TYPES.UPDATE_RECORDING_STATE,
              isRecording: false,
            });
            return;
          }

          const recordingBlob = new Blob(chunksRef.current, {
            type: "video/webm",
          });
          const recordingId = `recording-${Date.now()}`;

          const base64data = await blobToBase64(recordingBlob);

          const newTab = await browser.tabs.create({
            url: `http://localhost:5174/?awaiting=recording&recordingId=${recordingId}`,
          });

          tabIdRef.current = newTab.id;

          await browser.storage.local.set({
            [`recording_${recordingId}`]: {
              videoData: base64data,
              fileName: "screen-recording.webm",
              fileSize: recordingBlob.size,
              mimeType: "video/webm",
              timestamp: Date.now(),
            },
          });

          setTimeout(async () => {
            try {
              console.log(
                "Attempting to send recording data to tab:",
                newTab.id,
              );

              // doing some triers and errors
              // tired of fixing this mehn

              let messageSent = false;
              for (let attempt = 1; attempt <= 5; attempt++) {
                try {
                  await browser.tabs.sendMessage(newTab.id, {
                    type: "RECORDING_DATA",
                    data: {
                      videoData: base64data,
                      fileName: "screen-recording.webm",
                      fileSize: recordingBlob.size,
                      mimeType: "video/webm",
                      timestamp: Date.now(),
                      recordingId,
                    },
                  });
                  console.log(
                    `Successfully sent recording data on attempt ${attempt}`,
                  );
                  messageSent = true;
                  break;
                } catch (err) {
                  console.warn(
                    `Failed to send message, attempt ${attempt}/5. Waiting before retry...`,
                  );
                  await new Promise((resolve) =>
                    setTimeout(resolve, attempt * 1000),
                  );
                }
              }

              if (!messageSent) {
                console.error(
                  "Failed to send recording data after multiple attempts",
                );
              }
            } catch (error) {
              console.error("Error sending recording data to tab:", error);
            }
          }, 3000);

          function blobToBase64(blob) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                resolve(reader.result);
              };
            });
          }

          const dataToStore = {
            data: {
              videoData: base64data,
              recordingId: recordingId,
            },
          };
          localStorage.setItem("recordingData", JSON.stringify(dataToStore));

          await browser.runtime.sendMessage({
            type: MESSAGE_TYPES.UPDATE_RECORDING_STATE,
            isRecording: false,
            recordingInfo: {
              id: recordingId,
              fileName: "screen-recording.webm",
              fileSize: recordingBlob.size,
              mimeType: "video/webm",
              timestamp: Date.now(),
            },
          });

          chunksRef.current = [];
        } catch (error) {
        } finally {
          setIsRecording(false);
          combinedStream.getTracks().forEach((track) => track.stop());
          if (audioStream)
            audioStream.getTracks().forEach((track) => track.stop());
          displayStream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      await browser.runtime.sendMessage({
        type: MESSAGE_TYPES.UPDATE_RECORDING_STATE,
        isRecording: true,
      });
    } catch (error) {
      setIsRecording(false);
      await browser.runtime
        .sendMessage({
          type: MESSAGE_TYPES.UPDATE_RECORDING_STATE,
          isRecording: false,
          error: `Failed to start recording: ${error.message}`,
        })
        .catch((err) => {});
    }
  };

  const stopCapture = async () => {
    try {
      await browser.runtime
        .sendMessage({ type: MESSAGE_TYPES.STOP_RECORDING_REQUEST })
        .catch((err) => {});

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      } else {
        setIsRecording(false);
        await browser.runtime
          .sendMessage({
            type: MESSAGE_TYPES.UPDATE_RECORDING_STATE,
            isRecording: false,
          })
          .catch((err) => {});
      }
    } catch (error) {
      setIsRecording(false);
      await browser.runtime
        .sendMessage({
          type: MESSAGE_TYPES.UPDATE_RECORDING_STATE,
          isRecording: false,
          error: `Error stopping recording: ${error.message}`,
        })
        .catch((err) => {});
    }
  };

  return { isRecording, captureMedia, stopCapture };
};

export default useMediaCapture;
