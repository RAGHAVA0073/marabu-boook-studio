import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok"
  });
});

app.post("/api/generate-book", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OpenAI API key is not configured in Render"
      });
    }

    const {
      idea,
      title,
      genre,
      audience,
      tone,
      chapters
    } = req.body;

    if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Please enter at least 10 characters for your book idea"
      });
    }

    if (idea.length > 10000) {
      return res.status(400).json({
        success: false,
        error: "Your book idea is too long"
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
You are an expert book writer for MARABU BOOK STUDIO.

Create a polished, original e-book using these requirements:

Book idea:
${idea}

Preferred title:
${title || "Choose a suitable title"}

Genre:
${genre || "General"}

Target audience:
${audience || "General readers"}

Tone:
${tone || "Professional"}

Number of chapters:
${chapters || 5}

Return ONLY valid JSON. Do not use markdown code fences.

Use exactly this structure:
{
  "title": "Book title",
  "subtitle": "Book subtitle",
  "author": "MARABU BOOK STUDIO",
  "introduction": "A useful introduction",
  "tableOfContents": [
    "Chapter 1 title",
    "Chapter 2 title"
  ],
  "chapters": [
    {
      "title": "Chapter title",
      "content": "Detailed chapter content with paragraphs"
    }
  ],
  "conclusion": "A meaningful conclusion"
}

Make the book useful, coherent, well-organized, and suitable for the target audience.
`;

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt
    });

    const output = response.output_text?.trim();

    if (!output) {
      return res.status(502).json({
        success: false,
        error: "AI returned an empty response"
      });
    }

    let book;

    try {
      book = JSON.parse(output);
    } catch {
      return res.status(502).json({
        success: false,
        error: "AI returned an invalid book format"
      });
    }

    return res.json({
      success: true,
      book
    });
  } catch (error) {
    console.error("Book generation failed:", error.message);

    if (error.status === 401) {
      return res.status(500).json({
        success: false,
        error: "OpenAI API key is invalid"
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: "OpenAI rate limit or billing limit reached"
      });
    }

    return res.status(500).json({
      success: false,
      error: "Unable to generate the book right now"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MARABU BOOK STUDIO running on port ${PORT}`);
});
