import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function isServer() {
    return typeof window === "undefined";
}
export function isClient() {
    return !isServer();
}
