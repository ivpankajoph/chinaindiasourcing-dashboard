"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, ChevronDown, Globe, Loader2, Save, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Field = { key: string; label: string; placeholder?: string; type?: "text" | "email" | "url" | "tel" | "number" | "textarea" | "list" | "json"; section: string; options?: string[] };
type Profile = Record<string, any> & { role?: string; roleKey?: string; email?: string; marketDetails?: Record<string, unknown>; marketAccountDetails?: Record<string, unknown> };

const marketCountries = [
  { name: "India", flag: "/flags/india.svg" }, { name: "United States", flag: "/flags/united-states.svg" },
  { name: "China", flag: "/flags/china.svg" }, { name: "United Kingdom", flag: "/flags/uk.svg" },
  { name: "Canada", flag: "/flags/canada.svg" }, { name: "Australia", flag: "/flags/australia.svg" },
  { name: "United Arab Emirates", flag: "/flags/uae.svg" }, { name: "Vietnam", flag: "/flags/vietnam.svg" },
  { name: "Germany", flag: "/flags/germany.svg" }, { name: "Taiwan", flag: "/flags/taiwan.svg" },
  { name: "New Zealand", flag: "/flags/new-zealand.svg" }, { name: "Pakistan", flag: "/flags/pakistan.svg" },
  { name: "Bangladesh", flag: "/flags/bangladesh.svg" }, { name: "South Africa", flag: "/flags/south-africa.svg" },
  { name: "Nigeria", flag: "/flags/nigeria.svg" }, { name: "Other Country", flag: "" },
];
const marketDialCodes = [
  { code: "+91", country: "India", flag: "/flags/india.svg" }, { code: "+1", country: "USA", flag: "/flags/united-states.svg" },
  { code: "+86", country: "China", flag: "/flags/china.svg" }, { code: "+84", country: "Vietnam", flag: "/flags/vietnam.svg" },
  { code: "+886", country: "Taiwan", flag: "/flags/taiwan.svg" }, { code: "+44", country: "UK", flag: "/flags/uk.svg" },
  { code: "+971", country: "UAE", flag: "/flags/uae.svg" }, { code: "+61", country: "Australia", flag: "/flags/australia.svg" },
  { code: "+49", country: "Germany", flag: "/flags/germany.svg" }, { code: "+1-CA", country: "Canada", flag: "/flags/canada.svg" },
  { code: "+64", country: "New Zealand", flag: "/flags/new-zealand.svg" }, { code: "+92", country: "Pakistan", flag: "/flags/pakistan.svg" },
  { code: "+880", country: "Bangladesh", flag: "/flags/bangladesh.svg" }, { code: "+27", country: "South Africa", flag: "/flags/south-africa.svg" },
  { code: "+234", country: "Nigeria", flag: "/flags/nigeria.svg" },
];

// Field names, labels, prompts, and section headings follow Sellerslogin Market
// app/buyers/page.tsx and app/sellers/page.tsx. Only registration-only OTP,
// payment, and agreement actions are excluded from editing.
const buyerFields: Field[] = [
  { key: "fullName", label: "Name", placeholder: "e.g. John Doe / Rajesh Sharma", section: "Contact & Business Information" },
  { key: "whatsapp", label: "WhatsApp Number", placeholder: "98765 43210", type: "tel", section: "Contact & Business Information" },
  { key: "countryCode", label: "WhatsApp Country Code", section: "Contact & Business Information", options: ["+1", "+91", "+86", "+84", "+886", "+44", "+971", "+61", "+49", "+1-CA", "custom"] },
  { key: "customCountryCode", label: "Custom Country Code", placeholder: "+Code", section: "Contact & Business Information" },
  { key: "companyName", label: "Company Name", placeholder: "e.g. Apex Global Trade Ltd.", section: "Contact & Business Information" },
  { key: "website", label: "Website URL", placeholder: "https://yourcompany.com", type: "url", section: "Contact & Business Information" },
  { key: "lookingFor", label: "Looking For (Role / Title)", placeholder: "e.g. Sourcing agent for EV battery cells / Buying agent for ceramic tiles", section: "Detailed Sourcing Brief & Budget" },
  { key: "detailedRequirement", label: "Detailed Requirement", placeholder: "Specify product dimensions, materials, expected packaging, factory certifications, sample turnaround time, target unit pricing, and quality benchmarks...", type: "textarea", section: "Detailed Sourcing Brief & Budget" },
  { key: "budgetType", label: "Budget Type", section: "Detailed Sourcing Brief & Budget", options: ["hourly", "fixed"] },
  { key: "hourlyBudget", label: "Hourly Budget", section: "Detailed Sourcing Brief & Budget", options: ["$ 5 to $ 15 / hour", "$ 15 to $ 30 / hour", "$ 30 to $ 50 / hour", "$ 50 to $ 100 / hour", "$ 100 to $ 200 / hour", "Custom Hourly Rate"] },
  { key: "customHourlyBudget", label: "Custom Hourly Budget", placeholder: "e.g. $ 250 / hr or Negotiable based on project", section: "Detailed Sourcing Brief & Budget" },
  { key: "fixedBudget", label: "Fixed Budget", section: "Detailed Sourcing Brief & Budget", options: ["$ 30 to $ 100", "$ 100 to $ 300", "$ 300 to $ 1000", "$ 1000 to $ 3000", "$ 3000 to $ 5000", "$ 5000 to $ 10000", "Custom Fixed Budget"] },
  { key: "customFixedBudget", label: "Custom Fixed Budget", placeholder: "e.g. $ 15,000 Milestone based / Escrow protected", section: "Detailed Sourcing Brief & Budget" },
  { key: "selectedSources", label: "Source From", placeholder: "Select source countries (comma separated)", type: "list", section: "Sourcing Specifications & Timeline" },
  { key: "customSourceOther", label: "Specify custom origin market(s)", placeholder: "e.g. South Korea, Turkey, Indonesia, Malaysia, Japan...", section: "Sourcing Specifications & Timeline" },
  { key: "orderPlaceTime", label: "When Do You Need to Place the Order?", section: "Sourcing Specifications & Timeline", options: ["Immediate", "In week time", "In month", "In 3 month", "More than 3 month", "Custom Timeline"] },
  { key: "customOrderPlaceTime", label: "Custom Order Place Time", placeholder: "e.g. By 15th Nov / Q4 2026 / In 45 days...", section: "Sourcing Specifications & Timeline" },
  { key: "orderVolume", label: "Order Volume / Budget", section: "Sourcing Specifications & Timeline", options: ["Under $ 1500", "$ 1500 to $ 3000", "$ 3000 to $ 5000", "$ 5000 to $ 7500", "$ 7500 to $ 12500", "$ 12500 to $ 20000", "$ 20000 to $ 30000", "$ 30000 to $ 50000", "Above $ 50000", "Custom Volume / Budget"] },
  { key: "customOrderVolume", label: "Custom Order Volume", placeholder: "e.g. $ 75,000 to $ 100,000 / $ 250,000 annual procurement...", section: "Sourcing Specifications & Timeline" },
  { key: "quantity", label: "Quantity Required", placeholder: "e.g. 5000", section: "Sourcing Specifications & Timeline" },
  { key: "quantityUnit", label: "Quantity Unit", section: "Sourcing Specifications & Timeline", options: ["Piece", "Meter", "KG", "Ton", "Sets", "Carton", "Pairs", "Units", "Other (Custom Unit)"] },
  { key: "customQuantityUnit", label: "Custom Quantity Unit", placeholder: "Specify custom unit (e.g. Pallets, Rolls)...", section: "Sourcing Specifications & Timeline" },
  { key: "streetAddress", label: "Street Address", placeholder: "e.g. Unit 402, Trade Tower, Sector 62", section: "Address & Destination Details" },
  { key: "landmark", label: "Landmark", placeholder: "e.g. Near Metro Station / Port Gate", section: "Address & Destination Details" },
  { key: "country", label: "Country", placeholder: "Enter your country name...", section: "Address & Destination Details" },
  { key: "customCountry", label: "Custom Country", section: "Address & Destination Details" },
  { key: "state", label: "State / Province", placeholder: "Enter State / Province", section: "Address & Destination Details" },
  { key: "city", label: "City", placeholder: "e.g. Mumbai / Delhi / Los Angeles", section: "Address & Destination Details" },
  { key: "pincode", label: "Postal / ZIP Code", placeholder: "e.g. 110001 / 90001", section: "Address & Destination Details" },
];

const sellerFields: Field[] = [
  { key: "selectedRoles", label: "Select Business Role(s)", type: "list", section: "Basic Information & Identification" },
  { key: "selectedSourcingTypes", label: "Select Sourcing Specialization", placeholder: "Choose Sourcing Agent type (Alibaba, 1688, IndiaMART, FBA, Dropshipping...)...", type: "list", section: "Basic Information & Identification" },
  { key: "titleOfServices", label: "Title Of Services", placeholder: "e.g. Verified CNC Machining, Electronics & Sourcing Partner", section: "Basic Information & Identification" },
  { key: "chargeType", label: "Charges & Pricing Model", section: "Basic Information & Identification", options: ["hourly", "fixed"] },
  { key: "hourlyCharge", label: "Hourly Charge", section: "Basic Information & Identification", options: ["$ 5 to $ 15 / hr", "$ 15 to $ 30 / hr", "$ 30 to $ 50 / hr", "$ 50 to $ 100 / hr", "$ 100 to $ 150 / hr", "Custom Hourly"] },
  { key: "customHourlyCharge", label: "Custom Hourly Rate", placeholder: "Enter custom hourly rate (e.g. $ 45 / hr)", section: "Basic Information & Identification" },
  { key: "fixedCharge", label: "Fixed Charge", section: "Basic Information & Identification", options: ["$ 50 to $ 200", "$ 200 to $ 500", "$ 500 to $ 1,500", "$ 1,500 to $ 3,000", "$ 3,000 to $ 5,000", "Custom Fixed"] },
  { key: "customFixedCharge", label: "Custom Fixed Fee", placeholder: "Enter custom fixed fee (e.g. $ 750 / project)", section: "Basic Information & Identification" },
  { key: "companyName", label: "Company Name", placeholder: "e.g. Apex Precision Ltd.", section: "Basic Information & Identification" },
  { key: "legalBusinessName", label: "Legal Business Name", placeholder: "e.g. Apex Precision Technologies Pvt Ltd", section: "Basic Information & Identification" },
  { key: "businessRole", label: "Primary Business Role", section: "Basic Information & Identification", options: ["Manufacturer", "Supplier", "Sourcing Agent", "Service Provider"] },
  { key: "aboutCompany", label: "About Me / Company", placeholder: "Describe your manufacturing or sourcing strengths, engineering capabilities, machinery, and global client experience (minimum 100 characters)...", type: "textarea", section: "Basic Information & Identification" },
  { key: "yearOfEstablishment", label: "Year of Establishment", section: "Basic Information & Identification", options: Array.from({ length: new Date().getFullYear() - 1949 }, (_, index) => String(new Date().getFullYear() - index)) },
  { key: "contactName", label: "Contact Name", placeholder: "e.g. John Doe / Rajesh Patel", section: "Contact & Operating Address Details" },
  { key: "jobTitle", label: "Job Title / Designation", placeholder: "e.g. Managing Director / Sourcing Head", section: "Contact & Operating Address Details" },
  { key: "whatsapp", label: "WhatsApp Number", placeholder: "98765 43210", type: "tel", section: "Contact & Operating Address Details" },
  { key: "countryCode", label: "WhatsApp Country Code", section: "Contact & Operating Address Details", options: ["+91", "+1", "+86", "+84", "+886", "+44", "+971", "+61", "+49", "+64", "+92", "+880", "+27", "+234", "custom"] },
  { key: "customCountryCode", label: "Custom Country Code", placeholder: "+...", section: "Contact & Operating Address Details" },
  { key: "website", label: "Website URL", placeholder: "https://www.company.com", type: "url", section: "Contact & Operating Address Details" },
  { key: "streetAddress", label: "Street Address", placeholder: "e.g. Plot 42, GIDC Industrial Estate, Phase 2", section: "Contact & Operating Address Details" },
  { key: "locationLandmark", label: "Landmark", placeholder: "e.g. Near Central Logistics Hub", section: "Contact & Operating Address Details" },
  { key: "country", label: "Country", placeholder: "Enter country name...", section: "Contact & Operating Address Details" },
  { key: "customCountry", label: "Custom Country", section: "Contact & Operating Address Details" },
  { key: "state", label: "State / Province", placeholder: "Enter State / Province", section: "Contact & Operating Address Details" },
  { key: "city", label: "City", placeholder: "e.g. Ahmedabad / Shenzhen", section: "Contact & Operating Address Details" },
  { key: "pincode", label: "Postal / ZIP Code", placeholder: "e.g. 382445 / 518000", section: "Contact & Operating Address Details" },
  { key: "products", label: "Products & Product Specifications", placeholder: "Edit product entries as JSON: [{\"name\":\"...\",\"category\":\"...\",\"specs\":\"...\",\"moq\":\"...\",\"sampleAvailability\":\"...\",\"imageName\":\"...\"}]", type: "json", section: "Operational & Sourcing Capabilities" },
  { key: "targetRegions", label: "Target Export & Sourcing Regions Served", type: "list", section: "Operational & Sourcing Capabilities" },
  { key: "customRegion", label: "Custom Region", section: "Operational & Sourcing Capabilities" },
  { key: "moqCapability", label: "Minimum Order Quantity (MOQ)", section: "Operational & Sourcing Capabilities", options: ["No MOQ", "10 to 50 Units", "50 to 200 Units", "200 to 500 Units", "500 to 2,000 Units", "Above 2,000 Units", "Custom MOQ"] },
  { key: "customMoq", label: "Custom MOQ", placeholder: "Enter custom MOQ (e.g. 5 Units prototype)", section: "Operational & Sourcing Capabilities" },
  { key: "turnaroundTime", label: "Average Turnaround Time (TAT)", section: "Operational & Sourcing Capabilities", options: ["Ready Stock (24-48 hrs)", "3 to 7 Days", "1 to 2 Weeks", "2 to 4 Weeks", "1 to 2 Months", "Custom TAT"] },
  { key: "customTurnaroundTime", label: "Custom Turnaround Time", placeholder: "Enter custom TAT (e.g. 10 Days Express)", section: "Operational & Sourcing Capabilities" },
  { key: "selectedIncoterms", label: "Logistics & Incoterms Handled", type: "list", section: "Operational & Sourcing Capabilities", options: ["FOB", "CIF", "EXW", "DDP", "CFR", "DAP"] },
  { key: "samplePolicy", label: "Sample Availability Terms", section: "Catalog, Portfolio & Service Offerings", options: ["Free Sample (Buyer Pays Freight)", "Free Sample & Freight Included", "Paid Sample at Production Cost", "Available on Request", "Custom Sample Terms"] },
  { key: "sourcingRegions", label: "Sourcing Regions Covered & Industrial Hubs", placeholder: "e.g. Shenzhen, Dongguan, Ningbo (China) | Delhi NCR, Gujarat, Tirupur (India)", type: "text", section: "Catalog, Portfolio & Service Offerings" },
  { key: "auditingExpertise", label: "Factory Auditing & Quality Inspection Expertise", type: "list", section: "Catalog, Portfolio & Service Offerings" },
  { key: "networkSize", label: "Verified Manufacturer Network Size", section: "Catalog, Portfolio & Service Offerings", options: ["10 to 50 Verified Factories", "50 to 100 Verified Factories", "100 to 250 Verified Factories", "250+ Verified Factories", "Sole In-House Manufacturing"] },
  { key: "serviceScope", label: "Scope of Work", placeholder: "e.g. End-to-end OEM/ODM Sourcing, Design & Customs Brokerage", type: "text", section: "Catalog, Portfolio & Service Offerings" },
  { key: "techStack", label: "Technical Stack / Engineering Software", placeholder: "e.g. SolidWorks, AutoCAD, ERP, 3D Prototyping, PLM", type: "text", section: "Catalog, Portfolio & Service Offerings" },
  { key: "servicePackages", label: "Service Packages", placeholder: "e.g. Basic Sourcing | Full Turnkey OEM/ODM | Quality Inspection Retainer", type: "text", section: "Catalog, Portfolio & Service Offerings" },
  { key: "caseStudies", label: "Past Project Case Studies", placeholder: "Describe notable past export or sourcing deliverables, volume handled, client satisfaction, or certifications achieved...", type: "textarea", section: "Catalog, Portfolio & Service Offerings" },
  { key: "teamSize", label: "Total Team Size & Workforce", section: "Infrastructure, Capacity & Team Certifications", options: ["1 to 10", "11 to 50", "51 to 200", "201 to 500", "500+"] },
  { key: "qcCount", label: "Dedicated Quality Control (QC) Count", placeholder: "e.g. 8", section: "Infrastructure, Capacity & Team Certifications" },
  { key: "sourcingStaffCount", label: "Dedicated Sourcing Staff Count", placeholder: "e.g. 12", section: "Infrastructure, Capacity & Team Certifications" },
  { key: "facilityDetails", label: "Facility Details (Warehouse Size, Plant Sq. Footage or Office Setup)", placeholder: "e.g. 35,000 Sq. Ft. manufacturing plant with CNC milling shop floor, 15,000 Sq. Ft. bonded warehouse, and cleanroom assembly area...", type: "textarea", section: "Infrastructure, Capacity & Team Certifications" },
  { key: "certificates", label: "Certifications", placeholder: "Edit certificate entries as JSON: [{\"name\":\"...\",\"issuingBody\":\"...\",\"fileName\":\"...\"}]", type: "json", section: "Infrastructure, Capacity & Team Certifications" },
  { key: "kycJurisdictionTab", label: "KYC Jurisdiction", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "panNumber", label: "PAN Number", placeholder: "e.g. ABCDE1234F", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "gstinNumber", label: "GSTIN Number", placeholder: "e.g. 24ABCDE1234F1Z5", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "msmeUdyam", label: "MSME / Udyam Number", placeholder: "e.g. UDYAM-GJ-01-0012345", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "cinNumber", label: "CIN Number", placeholder: "e.g. U72900GJ2020PTC114567", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "iecCode", label: "IEC Code", placeholder: "e.g. 0512345678", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "einNumber", label: "EIN Number", placeholder: "e.g. 12-3456789", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "stateLicense", label: "State License", placeholder: "e.g. CA-CORP-987654", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "usResaleCert", label: "US Resale Certificate", placeholder: "e.g. RES-99887766-TAX", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "ukCompaniesHouse", label: "UK Companies House Number", placeholder: "e.g. 01234567", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "ukVatNumber", label: "UK VAT Number", placeholder: "e.g. GB 123 4567 89", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "ukUtr", label: "UK UTR", placeholder: "e.g. 10-digit UTR", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "euVatNumber", label: "EU VAT Number", placeholder: "e.g. DE123456789", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "euEoriNumber", label: "EU EORI Number", placeholder: "e.g. DE123456789012", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "euCommercialRegister", label: "EU Commercial Register", placeholder: "e.g. HRB 12345 Amtsgericht Frankfurt", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "chinaUscc", label: "China USCC", placeholder: "e.g. 91330100MA2Bxxxxxx", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "chinaBusinessLicense", label: "China Business License", placeholder: "e.g. 330100000xxxxxx", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "chinaCustomsCode", label: "China Customs Code", placeholder: "e.g. 10-digit Customs Code", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "localTaxId", label: "Local Tax ID", placeholder: "Official Tax / VAT Registration", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "otherBusinessReg", label: "Other Business Registration", placeholder: "Commercial Registry / Legal Entity No", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "uploadedKycDoc", label: "Uploaded KYC Document", section: "Country-Specific Legal, Tax & Compliance (KYC)" },
  { key: "accountHolder", label: "Account Holder Name", placeholder: "Legal Entity Name or Official Account Holder", section: "Banking & International Payout Setup" },
  { key: "bankName", label: "Bank Name", placeholder: "e.g. JPMorgan Chase / HDFC Bank / HSBC", section: "Banking & International Payout Setup" },
  { key: "accountOrIban", label: "Account Number / IBAN", placeholder: "Account Number or International IBAN", section: "Banking & International Payout Setup" },
  { key: "swiftCode", label: "SWIFT / BIC Code", placeholder: "8 or 11 Character SWIFT/BIC or Routing Code", section: "Banking & International Payout Setup" },
  { key: "settlementCurrencies", label: "Settlement Currencies", type: "list", section: "Banking & International Payout Setup" },
  { key: "withholdingTaxType", label: "Withholding Tax Type", section: "Banking & International Payout Setup" },
  { key: "taxResidencyDocName", label: "Tax Residency Document", section: "Banking & International Payout Setup" },
];

const commonFields = [
  ["name", "Name"], ["companyName", "Company Name"],
  ["designation", "Job Title"], ["website", "Website URL"], ["address", "Street Address"],
  ["city", "City"], ["state", "State / Province"], ["pincode", "Postal / ZIP Code"], ["country", "Country"],
] as const;
const excludedFromForm = new Set(["fullName", "contactName", "whatsapp", "countryCode", "customCountryCode", "companyName", "website", "streetAddress", "city", "state", "country", "pincode", "jobTitle"]);
const stringifyDetails = (details: Record<string, unknown> = {}) => Object.fromEntries(Object.entries(details).map(([key, value]) => [key, Array.isArray(value) ? (["products", "certificates"].includes(key) ? JSON.stringify(value, null, 2) : value.join(", ")) : value ?? ""]));

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [values, setValues] = React.useState<Profile>({});
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState("");
  const { data: profile, isLoading } = useQuery<Profile>({ queryKey: ["current-admin"], queryFn: async () => { const response = await fetch("/api/auth/me"); const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Could not load profile"); return body.data; } });
  React.useEffect(() => { if (profile) setValues({ ...profile, marketDetails: stringifyDetails(profile.marketDetails) }); }, [profile]);
  React.useEffect(() => { if (!photo) { setPreview(""); return; } const url = URL.createObjectURL(photo); setPreview(url); return () => URL.revokeObjectURL(url); }, [photo]);
  const save = useMutation({ mutationFn: async () => { const body = new FormData(); for (const [key] of commonFields) body.set(key, values[key] || ""); body.set("marketDetails", JSON.stringify(values.marketDetails || {})); if (photo) body.set("avatar", photo); const response = await fetch("/api/auth/me", { method: "PUT", body }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || "Profile update failed"); return result.data; }, onSuccess: (data) => { queryClient.setQueryData(["current-admin"], (current: Profile | undefined) => ({ ...current, ...data })); queryClient.invalidateQueries({ queryKey: ["current-admin"] }); setPhoto(null); toast.success("Profile updated"); }, onError: (error: Error) => toast.error(error.message) });
  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  const roleFields = profile?.roleKey === "buyer" ? buyerFields : sellerFields;
  const visibleFields = roleFields.filter((field) => !excludedFromForm.has(field.key) && (profile?.marketDetails ? field.key in profile.marketDetails : false));
  const sections = [...new Set(visibleFields.map((field) => field.section))];
  const avatar = preview || profile?.avatar || "";
  const dialCode = String(profile?.marketDetails?.countryCode || "");
  const phoneFlag = marketDialCodes.find((item) => item.code === dialCode)?.flag || "";
  const shownDialCode = dialCode === "custom" ? String(profile?.marketDetails?.customCountryCode || "") : dialCode;
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight">My profile</h1><p className="mt-1 text-sm text-muted-foreground">Update the details shown on your dashboard and Sellerslogin Market account.</p></div>
    <section className="rounded-xl border bg-card p-5 sm:p-7">
      <div className="mb-7 flex items-center gap-4"><Avatar className="size-20"><AvatarImage src={avatar} alt="Profile photo" /><AvatarFallback><UserRound className="size-8" /></AvatarFallback></Avatar><div><p className="font-semibold">Profile photo</p><p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP or GIF · up to 5 MB</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"><Camera className="size-4" />{photo ? "Change photo" : "Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be 5 MB or smaller"); event.target.value = ""; return; } setPhoto(file); }} /></label></div></div>
      <div className="mb-7 grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label>Email ID</Label><Input value={profile?.email || ""} disabled /><p className="text-xs text-muted-foreground">Email is read-only.</p></div><div className="space-y-2"><Label>Account type</Label><Input value={profile?.role || profile?.roleKey || "Member"} disabled /></div><div className="space-y-2"><Label>WhatsApp Number</Label><div className="flex h-10 items-center gap-2 rounded-md border bg-muted/40 px-3">{phoneFlag ? <img src={phoneFlag} alt="" className="h-3.5 w-5 rounded-[2px] border object-cover" /> : <Globe className="size-4 text-muted-foreground" />}<span className="shrink-0 text-sm text-muted-foreground">{shownDialCode}</span><span className="truncate text-sm text-muted-foreground">{profile?.phone || "Not provided"}</span></div><p className="text-xs text-muted-foreground">Phone number and country code are read-only.</p></div></div>
      {sections.map((section) => <div key={section} className="mb-8 border-t pt-6"><h2 className="mb-4 text-lg font-semibold">{section}</h2><div className="grid gap-4 sm:grid-cols-2">{visibleFields.filter((field) => field.section === section).map((field) => {
        const raw = values.marketDetails?.[field.key];
        const value = String(raw ?? "");
        const setValue = (next: string) => setValues((current) => ({ ...current, marketDetails: { ...current.marketDetails, [field.key]: field.type === "list" ? next.split(",").map((item) => item.trim()).filter(Boolean) : next } }));
        const fieldId = `market-${field.key}`;
        return <div key={field.key} className={`space-y-2 ${["textarea", "json"].includes(field.type || "") ? "sm:col-span-2" : ""}`}><Label htmlFor={fieldId}>{field.label}</Label>{field.key === "country" ? <MarketCountrySelect id={fieldId} value={value} onChange={(next) => setValue(next)} /> : field.options ? <select id={fieldId} value={value} onChange={(event) => setValue(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select...</option>{value && !field.options.includes(value) && <option value={value}>{value}</option>}{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : field.type === "textarea" || field.type === "json" ? <Textarea id={fieldId} rows={field.type === "json" ? 8 : 4} value={value} onChange={(event) => setValue(event.target.value)} placeholder={field.placeholder} /> : <Input id={fieldId} type={field.type === "list" ? "text" : field.type || "text"} value={value} onChange={(event) => setValue(event.target.value)} placeholder={field.placeholder || (field.type === "list" ? "Separate entries with commas" : undefined)} />}{field.type === "json" && <p className="text-xs text-muted-foreground">Keep the Market field structure shown in the placeholder so every product or certificate detail is retained.</p>}</div>;
      })}</div></div>)}
      {Object.keys(profile?.marketAccountDetails || {}).length > 0 && <div className="mt-2 border-t pt-6"><h2 className="mb-1 text-lg font-semibold">Submission status & confirmations</h2><p className="mb-5 text-sm text-muted-foreground">Registration, verification, and payment records from Sellerslogin Market.</p><div className="grid gap-3 sm:grid-cols-2">{Object.entries(profile?.marketAccountDetails || {}).map(([key, value]) => <div key={key} className="rounded-lg border bg-muted/20 p-3"><p className="mb-1.5 text-xs font-medium text-muted-foreground">{humanize(key)}</p><p className="whitespace-pre-wrap break-words text-sm">{displayValue(value)}</p></div>)}</div></div>}
      <div className="mt-7 flex justify-end"><Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{save.isPending ? "Saving..." : "Save profile"}</Button></div>
    </section>
  </div>;
}

function humanize(value: string) { return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase()); }
function displayValue(value: unknown): string { if (typeof value === "boolean") return value ? "Yes" : "No"; if (Array.isArray(value)) return value.map((item) => typeof item === "object" && item !== null ? JSON.stringify(item) : String(item)).join(", ") || "—"; if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, item]) => `${humanize(key)}: ${String(item ?? "—")}`).join("\n"); if (typeof value === "string" && /^\d{4}-\d\d-\d\dT/.test(value)) return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); return String(value ?? "—"); }

function MarketCountrySelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const selected = marketCountries.find((country) => country.name === value);
  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);
  return <div id={id} ref={root} className={`relative ${open ? "z-30" : "z-0"}`}>
    <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs hover:bg-accent/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
      <span className="flex min-w-0 items-center gap-2">{selected?.flag ? <img src={selected.flag} alt="" className="h-3.5 w-5 shrink-0 rounded-[2px] border object-cover" /> : <Globe className="size-4 shrink-0 text-cyan-600" />}<span className="truncate">{value || "Select country..."}</span></span><ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div role="listbox" className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-popover p-1 shadow-xl">{marketCountries.map((country) => <button key={country.name} type="button" role="option" aria-selected={country.name === value} onClick={() => { onChange(country.name); setOpen(false); }} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm ${country.name === value ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}><span className="flex items-center gap-2">{country.flag ? <img src={country.flag} alt="" className="h-3.5 w-5 rounded-[2px] border object-cover" /> : <Globe className="size-4 text-cyan-600" />}{country.name}</span>{country.name === value && <Check className="size-4" />}</button>)}</div>}
  </div>;
}
