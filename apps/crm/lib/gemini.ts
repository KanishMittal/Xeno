import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FilterRule } from "@/lib/db";

function getModel(name: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: name });
}

async function generate(systemInstruction: string, prompt: string) {
  try {
    const result = await getModel("gemini-2.5-flash-lite").generateContent(`${systemInstruction}\n\nUser input:\n${prompt}`);
    return result.response.text().trim();
  } catch (error) {
    console.warn("gemini-2.5-flash-lite failed, trying fallback gemini-2.5-flash-lite", error);
    const result = await getModel("gemini-2.5-flash-lite").generateContent(`${systemInstruction}\n\nUser input:\n${prompt}`);
    return result.response.text().trim();
  }
}

export async function nlToSegmentFilter(query: string): Promise<FilterRule> {
  const instruction = `You are a CRM filter engine for a fashion retail brand. Convert the user's natural language query into a JSON filter object. Only return valid JSON. No explanation. No markdown. No code blocks.
Schema: { minSpend?: number, maxSpend?: number, minOrders?: number, inactiveDays?: number, activeDays?: number, cities?: string[], categories?: string[], ageGroups?: string[], gender?: string }
Valid cities: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Jaipur. Valid categories: tops, bottoms, footwear, accessories, dresses. Valid ageGroups: 18-24, 25-34, 35-44, 45+. Valid gender: male, female, any.`;
  try {
    return JSON.parse((await generate(instruction, query)).replace(/```(?:json)?|```/g, "").trim()) as FilterRule;
  } catch {
    return {};
  }
}

export interface CopyParams {
  brandName: string;
  segmentDescription: string;
  channel: string;
  sampleCustomers: { name: string; city: string; lastCategory: string }[];
}

export async function generateMessageCopy(params: CopyParams) {
  return generate("You are a marketing copywriter for a fashion retail brand. Write a short, personalised WhatsApp/SMS campaign message. Use {{name}} for customer name, {{city}} for city. Keep it under 160 characters. Friendly, not pushy. Include a subtle CTA. Return only the message text. No explanation.", JSON.stringify(params));
}

export interface InsightStats {
  campaignName: string; totalSent: number; delivered: number; failed: number; opened: number; clicked: number;
  topCities: { city: string; count: number }[]; channel: string;
}

export async function generateCampaignInsights(stats: InsightStats) {
  return generate("You are a marketing analyst. Given campaign performance stats, write a 2-3 sentence plain-English insight summary a marketer would find useful. Mention standout metrics, what worked, and one actionable suggestion. Be concise and direct. No bullet points.", JSON.stringify(stats));
}
