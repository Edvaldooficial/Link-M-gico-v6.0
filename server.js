import express from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: process.env.ORIGIN || "*" }));
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Função de extração universal
async function extractPageData(url) {
  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);

    const title = $("title").first().text() || "";
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";
    const h1 = $("h1").first().text() || "";
    const price =
      $('[class*="price"]').first().text() ||
      $("meta[itemprop=price]").attr("content") ||
      "";
    const cta =
      $("a:contains('Comprar')").attr("href") ||
      $("a:contains('Assine')").attr("href") ||
      "";

    const text =
      description ||
      $("p").first().text() ||
      $("body").text().slice(0, 500);

    return {
      title,
      description,
      h1,
      price,
      cta,
      summary: text,
      rawText: $("body").text().replace(/\s+/g, " ").trim().slice(0, 1000),
    };
  } catch (err) {
    return { error: "Falha ao extrair dados", details: err.message };
  }
}

// Rota de extração
app.get("/api/extract", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL obrigatória" });

  const data = await extractPageData(url);
  res.json(data);
});

// Simulação de chatbot
app.post("/api/chat", async (req, res) => {
  const { message, instructions } = req.body;
  let response = "🤖 Chatbot ativo. ";

  if (message) {
    response += `Você disse: "${message}".`;
  }
  if (instructions) {
    // apenas usa internamente, não exibe ao cliente
    console.log("Instruções recebidas:", instructions);
  }

  res.json({ reply: response });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
