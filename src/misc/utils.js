import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "./api";
import axios from "axios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function valueUpdater(updaterOrValue, ref) {
  ref.value =
    typeof updaterOrValue === "function"
      ? updaterOrValue(ref.value)
      : updaterOrValue;
}

export function numberFormatter(value) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function textFormatter(input) {
  return input
    .toString()
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function timeFormatter(value, locale) {
  return new Date(value).toLocaleString(locale || "ru");
}

export function dateFormatter(value, locale) {
  return new Date(value).toLocaleDateString(locale || "ru");
}

export async function convertUrlToFile(url, filename) {
  try {
    const response = await axios(url, {
      responseType: "blob",
    });
    return new File([response.data], filename, { type: response.data.type });
  } catch (error) {
    console.error("Failed to convert URL to File:", error);
    return null;
  }
}
