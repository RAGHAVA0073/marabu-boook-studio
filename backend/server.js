const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "MARABU BOOK STUDIO AI backend is running 🚀"
  });
});

app.post("/generate-book", async (req, res) => {
  try {
    const { idea, type, language, style } = req.body;

    if (!idea || !idea.trim()) {
      return res.status(400).json({
        error: "Book idea is required."
      });
    }

    const prompt = `
You are the AI book planner for MARABU BOOK STUDIO.

Create a detailed Book Blueprint from the user's idea.

USER IDEA:
${idea}

BOOK TYPE:
${type || "Let AI Decide"}

LANGUAGE:
${language || "English"}

STYLE:
${style || "AI Choose Style"}

Return the blueprint in a clear format containing:

1. Book Title
2. Subtitle
3. Book Type
4. Genre
5. Target Audience
6. Core Premise
7. Main Characters
8. World / Setting
9. Tone and Writing Style
10. Main Conflict
11. Chapter Plan
12. Visual Direction
13. Continuity Rules
14. Suggested Page Structure

If the user did not specify a book type, intelligently choose the most suitable format.

Write the response in the requested language.

Do not copy or imitate an existing copyrighted book.
Create an original concept.
`;

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: prompt
    });

    const result = response.output_text;

    res.json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI generation failed. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MARABU backend running on port ${PORT}`);
});
