export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function getStatusClass(status: string) {
  if (status === "분석 완료") {
    return "border-[#ff385c]/20 bg-[#ff385c]/10 text-[#c13515]";
  }

  if (status === "초안") {
    return "border-[#dddddd] bg-[#f7f7f7] text-[#3f3f3f]";
  }

  return "border-[#dddddd] bg-white text-[#6a6a6a]";
}
