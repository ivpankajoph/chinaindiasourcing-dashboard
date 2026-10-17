const countries: Record<string, { code: string; name: string }> = {
  in: { code: "IN", name: "India" }, india: { code: "IN", name: "India" },
  cn: { code: "CN", name: "China" }, china: { code: "CN", name: "China" },
  us: { code: "US", name: "United States" }, usa: { code: "US", name: "United States" }, "united states": { code: "US", name: "United States" },
  gb: { code: "GB", name: "United Kingdom" }, uk: { code: "GB", name: "United Kingdom" }, "united kingdom": { code: "GB", name: "United Kingdom" },
  ae: { code: "AE", name: "United Arab Emirates" }, uae: { code: "AE", name: "United Arab Emirates" }, "united arab emirates": { code: "AE", name: "United Arab Emirates" },
  pk: { code: "PK", name: "Pakistan" }, pakistan: { code: "PK", name: "Pakistan" },
  bd: { code: "BD", name: "Bangladesh" }, bangladesh: { code: "BD", name: "Bangladesh" },
  jp: { code: "JP", name: "Japan" }, japan: { code: "JP", name: "Japan" },
  de: { code: "DE", name: "Germany" }, germany: { code: "DE", name: "Germany" },
  fr: { code: "FR", name: "France" }, france: { code: "FR", name: "France" },
  ca: { code: "CA", name: "Canada" }, canada: { code: "CA", name: "Canada" },
  au: { code: "AU", name: "Australia" }, australia: { code: "AU", name: "Australia" },
  sg: { code: "SG", name: "Singapore" }, singapore: { code: "SG", name: "Singapore" },
  vn: { code: "VN", name: "Vietnam" }, vietnam: { code: "VN", name: "Vietnam" },
  tw: { code: "TW", name: "Taiwan" }, taiwan: { code: "TW", name: "Taiwan" },
  tr: { code: "TR", name: "Türkiye" }, turkey: { code: "TR", name: "Türkiye" },
};

export function countryDetails(value?: string) {
  const raw = String(value || "").trim();
  const normalized = raw.toLowerCase();
  const withoutCode = normalized.replace(/^([a-z]{2})\s+/, "").trim();
  const details = countries[withoutCode] || countries[normalized] || countries[normalized.split(/[(),]/)[0].trim()];
  if (details) return details;
  const code = normalized.match(/^([a-z]{2})\b/)?.[1]?.toUpperCase();
  const name = raw.replace(/^([a-z]{2})\s+/i, "").trim();
  return { code: code || "", name: name || raw };
}

export function countryFlag(value?: string) {
  const code = countryDetails(value).code;
  const src = flagAssets[code];
  return src ? <img src={src} alt="" className="h-4 w-6 rounded-[2px] border object-cover" /> : null;
}

const flagAssets: Record<string, string> = {
  IN: "/flags/india.svg", CN: "/flags/china.svg", US: "/flags/united-states.svg", GB: "/flags/uk.svg",
  AE: "/flags/uae.svg", PK: "/flags/pakistan.svg", BD: "/flags/bangladesh.svg", AU: "/flags/australia.svg",
  CA: "/flags/canada.svg", DE: "/flags/germany.svg", NG: "/flags/nigeria.svg", ZA: "/flags/south-africa.svg",
  TW: "/flags/taiwan.svg", NZ: "/flags/new-zealand.svg", VN: "/flags/vietnam.svg",
};

export function CountryDisplay({ value, className = "" }: { value?: string; className?: string }) {
  const details = countryDetails(value);
  return <span className={`inline-flex items-center gap-1.5 ${className}`}><span aria-hidden>{flagAssets[details.code] ? <img src={flagAssets[details.code]} alt="" className="h-4 w-6 rounded-[2px] border object-cover" /> : countryFlag(value)}</span><span>{details.name}</span></span>;
}
import * as React from "react";

