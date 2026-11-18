import { describe, it, expect } from "vitest";
import { classifyIntent } from "@/lib/services/chatbot";

describe("chatbot intent", () => {
  it.each([
    ["Hello there", "greeting"], ["What is the price?", "quote"], ["need office LAN cabling", "networking"],
    ["install cctv cameras", "cctv"], ["rack server and backup", "server"], ["your office address", "contact"],
    ["talk to a human", "human"], ["HP ProBook 450", "product"], ["দাম কত", "quote"],
  ])("%s → %s", (text, intent) => expect(classifyIntent(text)).toBe(intent));
});
