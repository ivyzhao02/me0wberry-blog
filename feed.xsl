<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>rss feed — me0wberry</title>
        <link rel="icon" type="image/x-icon" href="favicon.ico" />
        <style><![CDATA[
          @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Press+Start+2P&family=Quicksand:wght@600;700&display=swap');

          :root {
            --pink: #df7096;
            --pink-deep: #bd587e;
            --pink-soft: #f8d6e2;
            --sage: #94b987;
            --matcha: #dcefd4;
            --cream: #fff9fb;
            --ink: #665c62;
            --muted: #8b7d84;
          }

          * { box-sizing: border-box; }

          body {
            min-height: 100vh;
            margin: 0;
            padding: 36px 18px 56px;
            color: var(--ink);
            font-family: 'Nunito Sans', sans-serif;
            background:
              radial-gradient(circle at 12% 14%, rgba(255,255,255,0.94) 0 2px, transparent 3px),
              radial-gradient(circle at 83% 20%, rgba(255,255,255,0.8) 0 2px, transparent 3px),
              linear-gradient(135deg, #dff1d7 0%, #f8e7ed 54%, #f8d9e4 100%);
            background-attachment: fixed;
          }

          a { color: inherit; }

          .feed-shell {
            width: min(840px, 100%);
            margin: 0 auto;
            overflow: hidden;
            border: 1px solid rgba(193, 104, 137, 0.38);
            border-radius: 18px;
            background: rgba(255, 249, 251, 0.82);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.92),
              0 18px 42px rgba(110, 83, 94, 0.13);
            backdrop-filter: blur(12px);
          }

          .feed-titlebar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 13px 17px;
            color: var(--pink-deep);
            font-family: 'Press Start 2P', monospace;
            font-size: 9px;
            line-height: 1.6;
            background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,214,226,0.62));
            border-bottom: 1px solid rgba(193, 104, 137, 0.24);
          }

          .feed-titlebar a {
            color: var(--sage);
            text-decoration: none;
          }

          .feed-body { padding: 24px; }

          .feed-heading {
            margin: 0;
            color: var(--pink-deep);
            font-family: 'Quicksand', sans-serif;
            font-size: clamp(25px, 6vw, 38px);
            line-height: 1.15;
          }

          .feed-intro {
            max-width: 620px;
            margin: 8px 0 6px;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.65;
          }

          .feed-updated {
            margin: 0 0 22px;
            color: var(--sage);
            font-size: 12px;
            font-weight: 700;
          }

          .feed-list {
            display: grid;
            gap: 12px;
          }

          .feed-entry {
            padding: 16px;
            border: 1px solid rgba(148, 185, 135, 0.42);
            border-radius: 14px;
            background:
              linear-gradient(145deg, rgba(255,255,255,0.72), rgba(220,239,212,0.24)),
              linear-gradient(135deg, rgba(248,214,226,0.28), transparent);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 7px 17px rgba(98, 113, 89, 0.07);
          }

          .feed-entry-title {
            margin: 0;
            font-family: 'Quicksand', sans-serif;
            font-size: 18px;
            line-height: 1.35;
          }

          .feed-entry-title a {
            color: var(--pink-deep);
            text-decoration-color: rgba(223, 112, 150, 0.42);
            text-underline-offset: 3px;
          }

          .feed-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin: 7px 0 9px;
            color: var(--muted);
            font-size: 11px;
          }

          .feed-category {
            padding: 2px 8px;
            color: #6f8f64;
            border: 1px solid rgba(148, 185, 135, 0.45);
            border-radius: 999px;
            background: rgba(220, 239, 212, 0.6);
            font-weight: 700;
          }

          .feed-summary {
            margin: 0;
            color: var(--ink);
            font-size: 13px;
            line-height: 1.65;
          }

          @media (max-width: 560px) {
            body { padding: 12px 8px 28px; }
            .feed-titlebar { align-items: flex-start; flex-direction: column; }
            .feed-body { padding: 18px 13px; }
            .feed-entry { padding: 14px; }
          }
        ]]></style>
      </head>
      <body>
        <main class="feed-shell">
          <div class="feed-titlebar">
            <span>♪ rss reader</span>
            <a href="https://me0wberry.com/">me0wberry.com ↗</a>
          </div>
          <div class="feed-body">
            <h1 class="feed-heading"><xsl:value-of select="rss/channel/title" /> ♡</h1>
          <p class="feed-intro">this is the rss feed ! add this page address to a feed reader , or look through the latest posts below (˶ᵔ ᵕ ᵔ˶)</p>
            <p class="feed-updated">last built : <xsl:value-of select="rss/channel/lastBuildDate" /></p>
            <div class="feed-list">
              <xsl:for-each select="rss/channel/item">
                <article class="feed-entry">
                  <h2 class="feed-entry-title"><a href="{link}"><xsl:value-of select="title" /></a></h2>
                  <div class="feed-meta">
                    <span class="feed-category"><xsl:value-of select="category" /></span>
                    <span><xsl:value-of select="pubDate" /></span>
                  </div>
                  <p class="feed-summary"><xsl:value-of select="description" /></p>
                </article>
              </xsl:for-each>
            </div>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
