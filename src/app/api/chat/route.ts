import { NextResponse } from "next/server";
import { readSettings } from "@/services/db";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Missing or invalid message query" }, { status: 400 });
    }

    const cleanMessage = message.trim().slice(0, 500); // Truncate very long messages to prevent API abuse

    const settings = await readSettings<any>();
    const groqApiKey = (process.env.GROQ_API_KEY || settings?.groqApiKey || "").trim();
    const aiShopContext = settings?.aiShopContext || settings?.systemPrompt || "";
    const aiRules = settings?.aiRules || [];

    // 1. Try Groq API if key is available
    if (groqApiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are the friendly and premium AI Concierge chatbot for "Whisk Fantasies", an eggless boutique bakery in Mumbai. Use the following context details to answer customer questions. Be helpful, concise, and professional. If the customer's question is not answered by the context, guide them to contact the team on WhatsApp (+91 8424 016 876). Do not make up facts outside the context.\n\nContext:\n${aiShopContext}`
              },
              {
                role: "user",
                content: cleanMessage
              }
            ],
            temperature: 0.5,
            max_tokens: 250
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (err) {
        console.error("Groq API call error, falling back to keywords:", err);
      }
    }

    // 2. Fallback to keyword matching if Groq is not configured, times out, or fails
    const query = cleanMessage.toLowerCase();
    let matchedResponse = "";

    for (const rule of aiRules) {
      const hasKeyword = rule.keywords.some((keyword: string) => query.includes(keyword.toLowerCase()));
      if (hasKeyword) {
        matchedResponse = rule.response;
        break;
      }
    }

    const fallbackReply = matchedResponse || 
      "Thank you for contacting Whisk Fantasies! Our concierge chefs are currently baking. You can reach our design team directly on WhatsApp for custom cake design requests!";

    return NextResponse.json({ reply: fallbackReply });

  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to process chat query" }, { status: 500 });
  }
}

