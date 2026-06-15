var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/cors.ts
var LOCAL_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
];
var LOCAL_DEV_ORIGIN_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3}):\d+$/;
function parseAllowedOrigins(configured) {
  const fromConfig = (configured ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
  return [.../* @__PURE__ */ new Set([...fromConfig, ...LOCAL_DEV_ORIGINS])];
}
__name(parseAllowedOrigins, "parseAllowedOrigins");
function resolveRequestOrigin(request, allowedOrigins) {
  const origin = request.headers.get("Origin")?.trim();
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    if (LOCAL_DEV_ORIGIN_PATTERN.test(origin)) {
      return origin;
    }
    return null;
  }
  const referer = request.headers.get("Referer")?.trim();
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.includes(refererOrigin)) {
        return refererOrigin;
      }
      if (LOCAL_DEV_ORIGIN_PATTERN.test(refererOrigin)) {
        return refererOrigin;
      }
    } catch {
      return null;
    }
  }
  return null;
}
__name(resolveRequestOrigin, "resolveRequestOrigin");
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}
__name(corsHeaders, "corsHeaders");

// src/rateLimit.ts
var RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 60
};
async function checkRateLimit(request) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const windowId = Math.floor(Date.now() / (RATE_LIMIT.windowSeconds * 1e3));
  const cacheKey = new Request(`https://rate-limit.internal/${encodeURIComponent(ip)}/${windowId}`);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  const currentCount = cached ? Number.parseInt(await cached.text(), 10) : 0;
  if (!Number.isFinite(currentCount) || currentCount >= RATE_LIMIT.maxRequests) {
    return { allowed: false, retryAfter: RATE_LIMIT.windowSeconds };
  }
  await cache.put(cacheKey, new Response(String(currentCount + 1)), {
    expirationTtl: RATE_LIMIT.windowSeconds
  });
  return { allowed: true };
}
__name(checkRateLimit, "checkRateLimit");

// src/validation.ts
var FIELD_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { max: 200 },
  message: { min: 10, max: 5e3 }
};
var MAX_BODY_BYTES = 16384;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var NAME_PATTERN = /^[\p{L}\p{M}0-9\s'.-]+$/u;
function isAllowedOrigin(request, allowedOrigins) {
  return resolveRequestOrigin(request, allowedOrigins) !== null;
}
__name(isAllowedOrigin, "isAllowedOrigin");
function validateContactPayload(body) {
  if (body.honey_pot?.trim()) {
    return { ok: false, error: "__HONEYPOT__" };
  }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const turnstileToken = body.turnstileToken?.trim() ?? "";
  if (!name || !email || !message || !turnstileToken) {
    return { ok: false, error: "Missing required contact fields or security token." };
  }
  if (name.length < FIELD_LIMITS.name.min || name.length > FIELD_LIMITS.name.max) {
    return { ok: false, error: `Name must be between ${FIELD_LIMITS.name.min} and ${FIELD_LIMITS.name.max} characters.` };
  }
  const letterCount = (name.match(/[\p{L}\p{M}]/gu) ?? []).length;
  if (letterCount < FIELD_LIMITS.name.min || !NAME_PATTERN.test(name)) {
    return { ok: false, error: "Please provide a valid name." };
  }
  if (email.length > FIELD_LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please provide a valid email address." };
  }
  if (subject.length > FIELD_LIMITS.subject.max) {
    return { ok: false, error: "Subject is too long." };
  }
  if (message.length < FIELD_LIMITS.message.min || message.length > FIELD_LIMITS.message.max) {
    return {
      ok: false,
      error: `Message must be between ${FIELD_LIMITS.message.min} and ${FIELD_LIMITS.message.max} characters.`
    };
  }
  return {
    ok: true,
    payload: { name, email, subject, message, turnstileToken }
  };
}
__name(validateContactPayload, "validateContactPayload");

// src/index.ts
function getAllowedOrigins(env) {
  return parseAllowedOrigins(env.ALLOWED_ORIGINS ?? env.ALLOWED_ORIGIN);
}
__name(getAllowedOrigins, "getAllowedOrigins");
function json(data, status, corsOrigin, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(corsOrigin),
      ...extraHeaders
    }
  });
}
__name(json, "json");
function rejectCors(status = 403) {
  return new Response(JSON.stringify({ error: "Origin not allowed." }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(rejectCors, "rejectCors");
async function verifyTurnstile(secret, token, remoteIp) {
  const body = new URLSearchParams({
    secret,
    response: token
  });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!response.ok) {
    console.error("Turnstile siteverify HTTP error:", response.status);
    return false;
  }
  const result = await response.json();
  if (!result.success) {
    console.error("Turnstile verification failed:", result["error-codes"]?.join(", ") ?? "unknown");
  }
  return Boolean(result.success);
}
__name(verifyTurnstile, "verifyTurnstile");
async function sendEmail(env, payload) {
  if (!env.EMAILJS_PRIVATE_KEY) {
    throw new Error("EMAILJS_PRIVATE_KEY is not configured.");
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
    console.error("EmailJS delivery failed:", response.status, await response.text());
    throw new Error("EMAIL_DELIVERY_FAILED");
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
    console.error("Telegram delivery failed:", response.status, await response.text());
    throw new Error("TELEGRAM_DELIVERY_FAILED");
  }
}
__name(sendTelegram, "sendTelegram");
var index_default = {
  async fetch(request, env) {
    const allowedOrigins = getAllowedOrigins(env);
    const corsOrigin = resolveRequestOrigin(request, allowedOrigins);
    if (request.method === "OPTIONS") {
      if (!corsOrigin) {
        return rejectCors();
      }
      return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) });
    }
    if (request.method !== "POST") {
      if (!corsOrigin) {
        return rejectCors();
      }
      return json({ error: "Method not allowed." }, 405, corsOrigin);
    }
    if (!corsOrigin || !isAllowedOrigin(request, allowedOrigins)) {
      return rejectCors();
    }
    const contentLength = Number.parseInt(request.headers.get("Content-Length") ?? "0", 10);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "Request body is too large." }, 413, corsOrigin);
    }
    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.allowed) {
      return json(
        { error: "Too many requests. Please try again later." },
        429,
        corsOrigin,
        rateLimit.retryAfter ? { "Retry-After": String(rateLimit.retryAfter) } : {}
      );
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400, corsOrigin);
    }
    const validation = validateContactPayload(body);
    if (!validation.ok) {
      if (validation.error === "__HONEYPOT__") {
        return json({ success: true }, 200, corsOrigin);
      }
      return json({ error: validation.error }, 400, corsOrigin);
    }
    if (!env.TURNSTILE_SECRET_KEY?.trim()) {
      console.error("TURNSTILE_SECRET_KEY is not configured.");
      return json({ error: "Contact service is not fully configured." }, 503, corsOrigin);
    }
    try {
      const remoteIp = request.headers.get("CF-Connecting-IP");
      const turnstileValid = await verifyTurnstile(
        env.TURNSTILE_SECRET_KEY,
        validation.payload.turnstileToken,
        remoteIp
      );
      if (!turnstileValid) {
        return json(
          { error: "Security verification failed. Please complete the check and try again." },
          400,
          corsOrigin
        );
      }
      const [emailResult, telegramResult] = await Promise.allSettled([
        sendEmail(env, validation.payload),
        sendTelegram(env, validation.payload)
      ]);
      if (telegramResult.status === "rejected") {
        throw telegramResult.reason;
      }
      if (emailResult.status === "rejected") {
        throw emailResult.reason;
      }
      return json({ success: true }, 200, corsOrigin);
    } catch (error) {
      console.error("Contact delivery failed:", error);
      return json({ error: "Unable to send message. Please try again later." }, 500, corsOrigin);
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
