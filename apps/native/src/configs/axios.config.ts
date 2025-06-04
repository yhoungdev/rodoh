import axios from "axios";

const defaultAxios = axios.create({
    url: "",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    timeoutErrorMessage: "Request timed out",
    validateStatus: (status) => status >= 200 && status < 300,
    withCredentials: true,
    maxRedirects: 5,
    maxContentLength: 10000000,
    maxBodyLength: 10000000,

});

export default defaultAxios;