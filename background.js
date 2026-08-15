console.log("Background service worker started");

const GROQ_API_KEY = "YOUR_API_KEY";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background received:", msg);

  if (msg.type === "REQUEST_ACTION") {
    const action = msg.action;
    const text = msg.payload;

    let prompt;
    if (action === "define") {
     prompt = `Define the following term clearly and briefly. Give small definition and usage. Don't use any markdowns or highlights.:\n\n${text}`;
    } else if (action === "summarize") {
     prompt = `Summarize the following text in a concise way using points aligned to the left.:\n\n${text}`;
    } else if (action === "expand") {
     prompt = `Expand the following text with more detail in paragraphs. Highlight important words. Align to the center.:\n\n${text}`;
    } else if (action === "synonyms") {
     prompt = `Provide only synonyms for the following word in points aligned to the left.:\n\n${text}`;
    } else if (action === "simplify") {
     prompt = `Explain the text as if I am 5 with very easy words. Use points and align to left.:\n\n${text}`;
    } else if (action === "analogy") {
     prompt = `Explain the following text using everyday analogies. Align text to the left.\n\n${text}`;
    } else if (action === "steps") {
     prompt = `Write a step-by-step explanation with numbered steps only for the main headings. No bullets or numbering for sub text. Align to the left.\n\n${text}`;
}

    fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",   
        messages: [{ role: "user", content: prompt }]
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Groq API response:", data);
      const result = data.choices?.[0]?.message?.content || "No response from Groq.";
      sendResponse({ result });
    })
    .catch(err => {
      console.error("Groq API error:", err);
      sendResponse({ result: "Error calling Groq API." });
    });

    return true;
  }

  if (msg.type === "TEXT_SELECTED") {
    chrome.runtime.sendMessage({ type: "TEXT_SELECTED", payload: msg.payload });
    sendResponse({ status: "forwarded" });
    return true;
  }
});
