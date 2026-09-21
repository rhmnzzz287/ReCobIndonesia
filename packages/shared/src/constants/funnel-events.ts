export const FUNNEL_EVENTS = [
  "page_view",
  "cta_click",
  "scroll_75",
  "outbound_wa_click",
  "sample_form_start",
  "sample_form_submit",
  "article_read_75",
  "referral_click",
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];
