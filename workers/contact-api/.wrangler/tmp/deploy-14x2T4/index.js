var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var corsHeaders = /* @__PURE__ */ __name((origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}), "corsHeaders");
function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin)
    }
  });
}
__name(json, "json");
async function verifyTurnstile(secret, token) {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      response: token
    })
  });
  const result = await response.json();
  return Boolean(result.success);
}
__name(verifyTurnstile, "verifyTurnstile");
async function sendEmail(env, payload) {
  if (!env.EMAILJS_PRIVATE_KEY) {
    throw new Error(
      "EmailJS private key is not configured. Run: npx wrangler secret put EMAILJS_PRIVATE_KEY"
    );
  }
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: {
        from_name: payload.name,
        from_email: payload.email,
        subject: payload.subject,
        message: payload.message
      }
    })
  });
  if (!response.ok) {
    const details = (await response.text()).trim();
    const hint = response.status === 403 ? " Enable non-browser API access in EmailJS Account \u2192 Security and set EMAILJS_PRIVATE_KEY on the worker." : "";
    throw new Error(`Email delivery failed (${response.status})${details ? `: ${details}` : ""}.${hint}`);
  }
}
__name(sendEmail, "sendEmail");
async function sendTelegram(env, payload) {
  const text = [
    "New portfolio contact message",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject || "No subject"}`,
    "",
    payload.message
  ].join("\n");
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text
    })
  });
  if (!response.ok) {
    throw new Error(`Telegram delivery failed (${response.status}).`);
  }
}
__name(sendTelegram, "sendTelegram");
var index_default = {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://the-shoaib2.github.io";
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(allowedOrigin) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405, allowedOrigin);
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400, allowedOrigin);
    }
    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();
    const subject = body.subject?.trim() ?? "";
    const turnstileToken = body.turnstileToken?.trim();
    if (!name || !email || !message || !turnstileToken) {
      return json({ error: "Missing required contact fields or security token." }, 400, allowedOrigin);
    }
    try {
      const turnstileValid = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, turnstileToken);
      if (!turnstileValid) {
        return json({ error: "Security verification failed. Please try again." }, 400, allowedOrigin);
      }
      const payload = { name, email, subject, message, turnstileToken };
      const [emailResult, telegramResult] = await Promise.allSettled([
        sendEmail(env, payload),
        sendTelegram(env, payload)
      ]);
      if (telegramResult.status === "rejected") {
        throw telegramResult.reason;
      }
      if (emailResult.status === "rejected") {
        throw emailResult.reason;
      }
      return json({ success: true }, 200, allowedOrigin);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Failed to send message.";
      return json({ error: messageText }, 500, allowedOrigin);
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
