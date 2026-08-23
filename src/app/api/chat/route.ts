import { NextResponse } from "next/server";
import { readSettings } from "@/services/db";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Missing message query" }, { status: 400 });
    }

    const settings = await readSettings<any>();
    const groqApiKey = settings?.groqApiKey || "";
    const aiShopContext = settings?.aiShopContext || settings?.systemPrompt || "";
    const aiRules = settings?.aiRules || [];

    // 1. Try Groq API if key is available
    if (groqApiKey.trim()) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey.trim()}`,
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
                content: message
              }
            ],
            temperature: 0.5,
            max_tokens: 250
          }),
        });

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

    // 2. Fallback to keyword matching if Groq is not configured or fails
    const query = message.toLowerCase();
    let matchedResponse = "";

    for (const rule of aiRules) {
      const hasKeyword = rule.keywords.some((keyword: string) => query.includes(keyword));
      if (hasKeyword) {
        matchedResponse = rule.response;
        break;
      }
    }

    const fallbackReply = matchedResponse || 
      "Thank you for contacting Whisk Fantasies! Our concierge chefs are currently baking. You can reach our design team directly on WhatsApp for custom cake design requests!";

    return NextResponse.json({ reply: fallbackReply });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
