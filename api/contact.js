const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Méthode non autorisée." }, 405);
    }

    const contentType = (request.headers.get("content-type") || "").split(";")[0].trim();
    if (contentType !== "application/json") {
      return jsonResponse({ error: "Format de requête invalide." }, 415);
    }

    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).origin !== new URL(request.url).origin) {
          return jsonResponse({ error: "Origine non autorisée." }, 403);
        }
      } catch {
        return jsonResponse({ error: "Origine non autorisée." }, 403);
      }
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 10_000) {
      return jsonResponse({ error: "Message trop volumineux." }, 413);
    }

    let rawBody;
    let payload;
    try {
      rawBody = await request.text();
      if (rawBody.length > 10_000) {
        return jsonResponse({ error: "Message trop volumineux." }, 413);
      }
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Corps JSON invalide." }, 400);
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return jsonResponse({ error: "Données invalides." }, 400);
    }

    // Quietly accept bot submissions caught by the hidden field.
    if (typeof payload.website === "string" && payload.website.trim()) {
      return jsonResponse({ ok: true });
    }

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || name.length > 80 || !emailPattern.test(email) || email.length > 254 || !message || message.length > 4_000) {
      return jsonResponse({ error: "Vérifie ton nom, ton adresse e-mail et ton message." }, 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_TO;
    const sender = process.env.CONTACT_FROM;
    if (!apiKey || !recipient || !sender) {
      return jsonResponse({ error: "Le formulaire n’est pas encore configuré." }, 503);
    }

    try {
      const mailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: sender,
          to: [recipient],
          reply_to: email,
          subject: "Nouveau message depuis le portfolio",
          text: `Nom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}`
        })
      });

      if (!mailResponse.ok) {
        return jsonResponse({ error: "Le message n’a pas pu être envoyé. Réessaie plus tard." }, 502);
      }

      return jsonResponse({ ok: true });
    } catch {
      return jsonResponse({ error: "Le service d’e-mail est temporairement indisponible." }, 502);
    }
  }
};
