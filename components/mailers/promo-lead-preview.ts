import type { PromoLead } from "@/components/mailers/promo-lead-picker";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character,
  );

export function renderPromoLeadCards(leads: PromoLead[]) {
  if (!leads.length) return "";

  return `<section style="margin-top:24px">${leads.map((lead) => {
    const name = escapeHtml(lead.companyName || lead.fullName || lead.contactName || "Lead");
    const description = escapeHtml(lead.lookingFor || lead.titleOfServices || "Lead details");
    return `<div style="margin:0 0 14px;padding:18px;border:1px solid #dce5f2;border-radius:12px;background:#fff;box-shadow:0 2px 6px rgba(15,23,42,.05)"><div style="font-size:17px;font-weight:700;color:#172033">${name}</div><p style="margin:10px 0 14px;color:#475569;line-height:1.5">${description}</p><span style="color:#2563eb;font-weight:700">View this lead in your dashboard</span></div>`;
  }).join("")}</section>`;
}
