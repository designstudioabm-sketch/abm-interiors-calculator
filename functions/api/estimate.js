// Cloudflare Pages Function: sends accepted enquiries to Superfone and returns the estimate.
export async function onRequestPost({ request, env }) {
  const headers = { "content-type": "application/json; charset=utf-8" };
  if (!env.SUPERFONE_WEBHOOK_URL || !/^https:\/\/.+/i.test(env.SUPERFONE_WEBHOOK_URL)) {
    return json({ success: false, error: "Lead integration is not configured yet. Please contact ABM Interiors directly." }, 503, headers);
  }
  let lead;
  try { lead = await request.json(); }
  catch { return json({ success: false, error: "Invalid form submission. Please try again." }, 400, headers); }

  const name = String(lead.name || "").trim().slice(0, 80);
  const phone = String(lead.phone || "").replace(/\D/g, "");
  const bhk = String(lead.bhk || "");
  const tier = String(lead.tier || "");
  if (name.length < 2) return json({ success: false, error: "Please enter your name." }, 400, headers);
  if (!/^[6-9]\d{9}$/.test(phone)) return json({ success: false, error: "Please enter a valid 10-digit Indian mobile number." }, 400, headers);

  const priceMap = {
    "1": { budget: 4.5, mid: 6, premium: 8 },
    "2": { budget: 10, mid: 11.5, premium: 13 },
    "3": { budget: 15, mid: 17.5, premium: 20 },
    "4plus": { budget: 18, mid: 21, premium: 25 }
  };
  if (!priceMap[bhk] || priceMap[bhk][tier] === undefined) {
    return json({ success: false, error: "Please select your home size and finish preference." }, 400, headers);
  }

  const lakh = priceMap[bhk][tier];
  const estimate = `₹${Number.isInteger(lakh) ? lakh : lakh.toFixed(1)} lakh`;
  const parts = name.split(/\s+/);
  const firstName = parts.shift() || name;
  const lastName = parts.join(" ");
  const tierLabel = tier === "mid" ? "Mid-range" : tier.charAt(0).toUpperCase() + tier.slice(1);
  const bhkLabel = bhk === "4plus" ? "4+ BHK" : `${bhk} BHK`;
  const payload = {
    customer_phone: `+91${phone}`,
    first_name: firstName,
    ...(lastName ? { last_name: lastName } : {}),
    source: "ABM Interiors Price Estimator",
    source_type: "OTHERS",
    business_name: "ABM Interiors",
    city: "Varanasi",
    additional_info: `Website price estimator enquiry. Home size: ${bhkLabel}. Finish preference: ${tierLabel}. Indicative estimate: ${estimate}.`
  };
  try {
    const upstream = await fetch(env.SUPERFONE_WEBHOOK_URL, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload)
    });
    const upstreamText = await upstream.text();
    let upstreamData = {};
    try { upstreamData = JSON.parse(upstreamText); } catch {}
    if (!upstream.ok) return json({
      success: false,
      error: upstream.status === 404
        ? "Superfone did not accept the lead. Please check the webhook URL and account integration."
        : "We could not submit your enquiry to our team. Please try again."
    }, 502, headers);
    return json({ success: true, estimate, leadId: upstreamData?.data?.customer_id || null }, 200, headers);
  } catch {
    return json({ success: false, error: "We could not connect to our lead system. Please try again." }, 502, headers);
  }
}
function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}
