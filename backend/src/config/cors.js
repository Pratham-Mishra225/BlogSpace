import { env } from "./env.js";

const PRODUCTION_FRONTEND_ORIGIN = "https://blog-space225.vercel.app";
const VERCEL_PREVIEW_HOST_SUFFIX = ".vercel.app";
const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const parseCorsOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const configuredOrigins = parseCorsOrigins(env.CORS_ORIGIN);

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch (_error) {
    return origin.replace(/\/+$/, "");
  }
};

const escapeRegExp = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");

const wildcardToRegExp = (originPattern) => {
  const normalizedPattern = normalizeOrigin(originPattern);
  const pattern = normalizedPattern.split("*").map(escapeRegExp).join("[^/]*");
  return new RegExp(`^${pattern}$`, "i");
};

const exactConfiguredOrigins = new Set(
  configuredOrigins
    .filter((origin) => origin !== "*" && !origin.includes("*"))
    .map(normalizeOrigin)
);

const wildcardConfiguredOrigins = configuredOrigins
  .filter((origin) => origin !== "*" && origin.includes("*"))
  .map(wildcardToRegExp);

const allowsEveryOrigin = configuredOrigins.includes("*");

const isVercelOrigin = (url) =>
  url.protocol === "https:" && url.hostname.endsWith(VERCEL_PREVIEW_HOST_SUFFIX);

const isLocalhostOrigin = (url) =>
  ["http:", "https:"].includes(url.protocol) && LOCALHOST_HOSTS.has(url.hostname);

export const isCorsOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowsEveryOrigin) {
    return true;
  }

  let url;

  try {
    url = new URL(origin);
  } catch (_error) {
    return false;
  }

  const normalizedOrigin = url.origin;

  return (
    normalizedOrigin === PRODUCTION_FRONTEND_ORIGIN ||
    exactConfiguredOrigins.has(normalizedOrigin) ||
    wildcardConfiguredOrigins.some((pattern) => pattern.test(normalizedOrigin)) ||
    isVercelOrigin(url) ||
    isLocalhostOrigin(url)
  );
};

export const corsOptions = {
  origin(origin, callback) {
    callback(null, isCorsOriginAllowed(origin));
  },
  credentials: env.CORS_CREDENTIALS,
};
