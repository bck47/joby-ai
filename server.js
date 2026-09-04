const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// ==================================================
// PATHS
// ==================================================

const PROJECT_DIR = __dirname;
const INDEX_FILE = path.join(PROJECT_DIR, "index.html");
const TRAINING_FILE = path.join(
  PROJECT_DIR,
  "germany-scenarios.txt"
);

// ==================================================
// STARTUP INFO
// ==================================================

console.log("");
console.log("======================================");
console.log("           JOBY AI 🇩🇪");
console.log("======================================");
console.log("Project folder:");
console.log(PROJECT_DIR);
console.log("");
console.log("index.html:");
console.log(INDEX_FILE);
console.log("");
console.log(
  "index.html exists:",
  fs.existsSync(INDEX_FILE)
);
console.log("======================================");
console.log("");

// ==================================================
// GEMINI API KEY
// ==================================================

if (!process.env.GEMINI_API_KEY) {
  console.error("");
  console.error("❌ ERROR: GEMINI_API_KEY is missing.");
  console.error("");
  console.error("Your .env file must contain:");
  console.error("");
  console.error("GEMINI_API_KEY=YOUR_GEMINI_API_KEY");
  console.error("");
  process.exit(1);
}

// ==================================================
// GEMINI CLIENT
// ==================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3-flash-preview";

// ==================================================
// EXPRESS CONFIG
// ==================================================

app.use(
  express.json({
    limit: "1mb"
  })
);

// ==================================================
// ROOT PAGE
// ==================================================

app.get("/", (req, res) => {
  console.log("🌐 Browser requested /");

  if (!fs.existsSync(INDEX_FILE)) {
    console.error("");
    console.error("❌ index.html NOT FOUND");
    console.error("");
    console.error("Expected location:");
    console.error(INDEX_FILE);
    console.error("");

    return res.status(404).send(`
      <html>
        <body style="font-family:Arial;padding:40px">
          <h1>Joby - index.html not found</h1>
          <p>Express is running correctly.</p>
          <p>But index.html was not found here:</p>
          <pre>${INDEX_FILE}</pre>
        </body>
      </html>
    `);
  }

  res.sendFile(INDEX_FILE);
});

// ==================================================
// STATIC FILES
// ==================================================

app.use(
  express.static(PROJECT_DIR)
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", (req, res) => {
  console.log("✅ Health check received");

  res.json({
    success: true,
    ai: true,
    provider: "Google Gemini",
    message: "Joby AI server is running.",
    model: GEMINI_MODEL
  });
});

// ==================================================
// TRAINING DATA
// ==================================================

function loadTrainingData() {
  try {
    if (!fs.existsSync(TRAINING_FILE)) {
      console.warn(
        "⚠ germany-scenarios.txt was not found."
      );

      return "";
    }

    return fs.readFileSync(
      TRAINING_FILE,
      "utf8"
    );

  } catch (error) {
    console.error(
      "❌ Training file error:",
      error.message
    );

    return "";
  }
}

// ==================================================
// JOBY SYSTEM PROMPT
// ==================================================

function buildSystemPrompt(trainingData) {
  return `
You are Joby 🇩🇪.

You are a real AI assistant created for Word Bridge.

Your main purpose is helping people understand:

- Working in Germany
- Studying in Germany
- Ausbildung
- German jobs
- Professional qualifications
- Recognition of qualifications
- German language requirements
- CVs
- Job applications
- Visa pathways
- Residence pathways
- Living costs
- Moving to Germany
- Preparing for Germany
- Verifying job offers
- General Germany-related questions

==================================================
REAL AI
==================================================

You are a REAL AI assistant.

You are NOT a keyword chatbot.

Do not answer using simple keyword matching.

Understand:

- Context
- User intent
- Previous messages
- Follow-up questions
- Natural conversation
- Arabic
- Lebanese Arabic
- Arabizi
- English
- Mixed Arabic-English

The user can speak naturally.

Example:

User:
"I am a nurse."

Later:

"What opportunities are there?"

Understand that the question refers to opportunities for the nurse.

Do NOT ask again for information already provided.

==================================================
LANGUAGE
==================================================

You understand:

- English
- Arabic
- Lebanese Arabic
- Arabizi
- Mixed Arabic-English

Always answer naturally using the user's language.

If the user speaks Lebanese Arabic:
Reply in Lebanese Arabic.

If the user speaks English:
Reply in English.

If the user mixes Arabic and English:
Natural mixed language is allowed.

Do not force formal Arabic.

==================================================
PERSONALITY
==================================================

Be:

- Friendly
- Natural
- Helpful
- Practical
- Clear
- Patient
- Professional

Do not sound robotic.

Do not constantly mention that you are an AI.

You are Joby.

If someone says:

"مرحبا"

Reply naturally.

If someone says:

"كيفك"

Reply naturally.

Do NOT immediately give a long explanation about Germany.

==================================================
GERMANY
==================================================

Your primary focus is Germany.

Help users understand:

- Jobs
- Work
- Study
- Ausbildung
- Skilled worker opportunities
- Professional opportunities
- Job offers
- Recognition of qualifications
- German language
- Universities
- Vocational training
- CVs
- Job applications
- Visas
- Residence
- Relocation
- Living costs

==================================================
NO GUARANTEES
==================================================

Never guarantee:

- Visa approval
- Job acceptance
- University admission
- Ausbildung acceptance
- Residence approval
- Qualification recognition

Never say:

"You will definitely get accepted."

Instead explain:

- Possible pathway
- Requirements
- Risks
- What needs verification
- Practical next steps

==================================================
CURRENT INFORMATION
==================================================

German immigration rules, visa requirements,
salaries, university requirements and employment
regulations can change.

Do NOT invent current laws.

When current information is important,
tell the user that the latest official German
sources should be checked.

==================================================
USER PROFILE
==================================================

When relevant, understand:

- Profession
- Work experience
- Education
- Qualification
- German level
- English level
- Current country
- Age
- Job offer
- Study goal
- Work goal

Do not ask for everything at once.

Ask only what is necessary.

==================================================
TRAINING SCENARIOS
==================================================

The scenarios below are fictional examples.

They are NOT real people.

They are NOT guarantees.

Use them only to understand patterns.

---------------- TRAINING DATA ----------------

${trainingData}

-------------- END TRAINING DATA --------------

If a user's situation resembles a scenario,
you may explain the similarity.

Never claim the user will get the same result.

==================================================
SCAM PROTECTION
==================================================

If a user mentions a suspicious German job offer:

Warn them to be careful.

Recommend:

- Verify the employer
- Verify the company
- Verify the contract
- Check official information
- Do not pay unknown intermediaries
- Do not send sensitive documents before verification

Do not automatically accuse anyone of fraud.

Explain warning signs.

==================================================
CONVERSATION MEMORY
==================================================

Use the conversation history.

The user may ask follow-up questions without
repeating information.

Example:

User:
"I am a 25 year old electrician from Lebanon."

Later:

"Can I work in Germany?"

Understand that the question concerns
the electrician.

==================================================
ANSWER STYLE
==================================================

Simple question:
Give a simple answer.

Detailed question:
Give a structured answer.

Use bullet points when useful.

Do not make every answer extremely long.

Avoid unnecessary repetition.

When appropriate, finish with a practical next step.

==================================================

You are Joby 🇩🇪,
the Germany assistant for Word Bridge.
`;
}

// ==================================================
// GEMINI CHAT HISTORY
// ==================================================

function buildGeminiContents(history, message) {
  const contents = [];

  for (const item of history) {
    if (
      !item ||
      typeof item.content !== "string"
    ) {
      continue;
    }

    const text = item.content.trim();

    if (!text) {
      continue;
    }

    if (item.role === "user") {
      contents.push({
        role: "user",
        parts: [
          {
            text: text
          }
        ]
      });
    }

    if (item.role === "assistant") {
      contents.push({
        role: "model",
        parts: [
          {
            text: text
          }
        ]
      });
    }
  }

  contents.push({
    role: "user",
    parts: [
      {
        text: message
      }
    ]
  });

  return contents;
}

// ==================================================
// CHAT API
// ==================================================

app.post("/api/chat", async (req, res) => {
  try {

    const message =
      typeof req.body.message === "string"
        ? req.body.message.trim()
        : "";

    const history =
      Array.isArray(req.body.history)
        ? req.body.history
        : [];

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required."
      });
    }

    console.log("");
    console.log("================================");
    console.log("👤 JOBY USER");
    console.log("================================");
    console.log(message);
    console.log("");

    const trainingData =
      loadTrainingData();

    const safeHistory =
      history
        .filter(item => {
          return (
            item &&
            (
              item.role === "user" ||
              item.role === "assistant"
            ) &&
            typeof item.content === "string" &&
            item.content.trim()
          );
        })
        .slice(-20);

    const contents =
      buildGeminiContents(
        safeHistory,
        message
      );

    console.log(
      `🤖 Sending request to Gemini: ${GEMINI_MODEL}`
    );

    const response =
      await ai.models.generateContent({

        model: GEMINI_MODEL,

        contents: contents,

        config: {
          systemInstruction:
            buildSystemPrompt(
              trainingData
            ),

          maxOutputTokens: 1200,

          temperature: 0.7
        }

      });

    const reply =
      typeof response.text === "string"
        ? response.text.trim()
        : "";

    if (!reply) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    console.log("");
    console.log("================================");
    console.log("🤖 JOBY AI");
    console.log("================================");
    console.log(reply);
    console.log("");

    return res.json({
      success: true,
      reply: reply
    });

  } catch (error) {

    console.error("");
    console.error("================================");
    console.error("❌ JOBY GEMINI ERROR");
    console.error("================================");
    console.error(error);
    console.error("================================");
    console.error("");

    let errorMessage =
      error?.message ||
      "Joby could not connect to Gemini.";

    if (
      errorMessage.includes("429")
    ) {
      errorMessage =
        "Gemini free limit has been reached temporarily. Please try again later.";
    }

    if (
      errorMessage.includes("401") ||
      errorMessage.includes("403")
    ) {
      errorMessage =
        "Gemini API key is invalid or does not have access.";
    }

    if (
      errorMessage.includes("404")
    ) {
      errorMessage =
        `Gemini model "${GEMINI_MODEL}" is not available.`;
    }

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// ==================================================
// UNKNOWN API ROUTES
// ==================================================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error:
      `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use((error, req, res, next) => {

  console.error(
    "❌ Express error:",
    error
  );

  res.status(500).json({
    success: false,
    error: "Internal server error."
  });

});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, HOST, () => {

  console.log("");
  console.log("======================================");
  console.log("           JOBY AI 🇩🇪");
  console.log("======================================");
  console.log(
    `🌐 Website: http://${HOST}:${PORT}`
  );
  console.log(
    `❤️ Health: http://${HOST}:${PORT}/api/health`
  );
  console.log(
    `🤖 Model: ${GEMINI_MODEL}`
  );
  console.log(
    "🧠 Provider: Google Gemini"
  );
  console.log(
    "🇩🇪 Joby: READY"
  );
  console.log("======================================");
  console.log("");

});