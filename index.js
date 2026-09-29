const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = "cfc8306440bf78154ad4dd1e4bbb33a";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Movie API Server</title>
    <style>
      :root { color-scheme: dark; font-family: system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #111827; color: #f9fafb; }
      main { width: min(680px, calc(100% - 40px)); padding: 40px; border: 1px solid #374151; border-radius: 18px; background: #1f2937; box-shadow: 0 20px 50px #0005; }
      h1 { margin-top: 0; }
      p { color: #d1d5db; line-height: 1.6; }
      code { padding: 3px 7px; border-radius: 6px; background: #111827; color: #93c5fd; }
      li { margin: 12px 0; }
      a { color: #93c5fd; }
    </style>
  </head>
  <body>
    <main>
      <h1>Movie API Server</h1>
      <p>The server is online and ready to use.</p>
      <ul>
        <li><a href="/api/trending"><code>GET /api/trending</code></a> — weekly trending movies</li>
        <li><a href="/api/stream/603"><code>GET /api/stream/:tmdb_id</code></a> — stream links for a movie</li>
      </ul>
    </main>
  </body>
</html>`);
});

app.get("/api/trending", async (_req, res) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({
        error: "TMDB request failed",
        details,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Trending movies error:", error);
    return res.status(502).json({
      error: "Unable to reach TMDB",
    });
  }
});

app.get("/api/stream/:tmdb_id", (req, res) => {
  const { tmdb_id: tmdbId } = req.params;

  if (!/^\d+$/.test(tmdbId)) {
    return res.status(400).json({
      error: "tmdb_id must be a numeric TMDB movie ID",
    });
  }

  return res.json({
    tmdb_id: Number(tmdbId),
    links: {
      vidsrc: `https://vidsrc.to/embed/movie/${tmdbId}`,
      "2embed": `https://www.2embed.org/embed/${tmdbId}`,
      autoembed: `https://autoembed.co/movie/tmdb/${tmdbId}`,
    },
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Movie API server listening on port ${PORT}`);
});