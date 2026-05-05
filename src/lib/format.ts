export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const truncate = (text: string, max = 160): string => {
  const stripped = text.replace(/[#>*`_~\-]/g, "").replace(/\s+/g, " ").trim();
  return stripped.length > max ? `${stripped.slice(0, max).trimEnd()}…` : stripped;
};
