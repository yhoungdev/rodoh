import {useState} from "react";

const useGetUserMedia = async () => {
    const [ isMedia , setIsMedia ] = useState<boolean>(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
        });

        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start();

    } catch (err ) {
        console.error(err);
    }

}

export default useGetUserMedia;
