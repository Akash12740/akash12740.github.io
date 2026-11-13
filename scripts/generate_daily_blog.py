import json
import os
import urllib.request
from datetime import datetime, timezone
from email.utils import format_datetime

POSTS_FILE = "data/posts.json"
SITEMAP_FILE = "sitemap.xml"
RSS_FILE = "rss.xml"

TOPICS = [
    ("llm", "Large Language Models (LLMs)", "Verifier-Guided Decoding, Constitutional AI & Citation Grounding"),
    ("ml", "Machine Learning", "Spectral Regularization, Convex Optimization & Generalization Bounds"),
    ("ds", "Data Science", "Covariate Shift Detection, Drift Auditing & Causal Inference Pipelines"),
    ("da", "Data Analytics", "SQL Window Functions, Anomaly Detection & STL Seasonal Decomposition"),
    ("ai", "Artificial Intelligence", "Deterministic Guardrails & Multi-Step Reasoning Trace Verification"),
]

def call_gemini(api_key: str, topic_code: str, topic_label: str, angle: str, existing_titles: list) -> dict | None:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    prompt = (
        f"You are Akash Saini, an Integrated M.Sc. Mathematics graduate from BITS Pilani and AI/ML Engineer. "
        f"Write a concise, technically rigorous blog post in the category '{topic_label}' focusing on '{angle}'. "
        f"Avoid repeating these existing titles: {existing_titles}. "
        f"Return ONLY valid JSON with keys: "
        f"'title' (string), 'summary' (2-sentence hook), 'read_time' (e.g. '5 MIN READ'), "
        f"'architecture_flow' (single-line ASCII pipeline diagram using ->), "
        f"'sections' (array of 3 objects with 'heading' and 'body'), "
        f"'takeaway' (1-sentence practical engineering takeaway)."
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.7}
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            parsed["topic"] = topic_code
            parsed["topic_label"] = topic_label
            return parsed
    except Exception as exc:
        print(f"Gemini API call failed ({exc}); using curated fallback.")
        return None

def fallback_post(topic_code: str, topic_label: str, angle: str, idx: int) -> dict:
    return {
        "topic": topic_code,
        "topic_label": topic_label,
        "title": f"Applied {angle}: Mathematical Foundations & Production Patterns (#{idx})",
        "summary": f"A practical engineering breakdown of {angle.lower()} designed for high-reliability AI systems, bridging statistical rigor with production deployment.",
        "read_time": "5 MIN READ",
        "architecture_flow": "Raw Input -> Schema Validation -> Mathematical Transformation -> Verifier Gate -> Production Output",
        "sections": [
            {
                "heading": "Why Mathematical Rigor Matters in Production",
                "body": f"Deploying {angle.lower()} requires bounding variance and eliminating silent distribution shifts before predictions reach downstream users."
            },
            {
                "heading": "Deterministic Verification & Evaluation",
                "body": "Every probabilistic model output should pass through automated invariant checks, confidence thresholds, and stratified holdout validation."
            },
            {
                "heading": "Operationalizing for Low Latency",
                "body": "Separating offline feature/index computation from lightweight online inference ensures sub-100ms p95 latency at scale."
            }
        ],
        "takeaway": f"Combining formal mathematical constraints with automated verification transforms {topic_label} prototypes into dependable systems."
    }

def update_feeds(posts: list, today_str: str):
    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://akash12740.github.io/</loc><lastmod>{today_str}</lastmod><priority>1.0</priority></url>
  <url><loc>https://akash12740.github.io/blog.html</loc><lastmod>{today_str}</lastmod><priority>0.9</priority></url>
  <url><loc>https://akash12740.github.io/capabilities.html</loc><lastmod>{today_str}</lastmod><priority>0.8</priority></url>
</urlset>
"""
    with open(SITEMAP_FILE, "w", encoding="utf-8") as f:
        f.write(sitemap_xml)

    items_xml = []
    for p in posts[:15]:
        pub_date = format_datetime(datetime.now(timezone.utc))
        items_xml.append(f"""    <item>
      <title><![CDATA[{p['title']}]]></title>
      <link>https://akash12740.github.io/blog.html#{p['id']}</link>
      <guid>https://akash12740.github.io/blog.html#{p['id']}</guid>
      <pubDate>{pub_date}</pubDate>
      <description><![CDATA[{p['summary']}]]></description>
    </item>""")

    rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Akash Saini — AI, Mathematics & Data Science Notes</title>
    <link>https://akash12740.github.io/blog.html</link>
    <description>Technical notes on Artificial Intelligence, Machine Learning, Data Science, and Mathematics by Akash Saini (BITS Pilani).</description>
    <language>en-us</language>
{chr(10).join(items_xml)}
  </channel>
</rss>
"""
    with open(RSS_FILE, "w", encoding="utf-8") as f:
        f.write(rss_xml)

def main():
    with open(POSTS_FILE, "r", encoding="utf-8-sig") as f:
        posts = json.load(f)

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if any(p.get("date") == today_str for p in posts):
        print(f"Post for {today_str} already exists. Updating feeds only.")
        update_feeds(posts, today_str)
        return

    topic_code, topic_label, angle = TOPICS[len(posts) % len(TOPICS)]
    existing_titles = [p["title"] for p in posts]
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()

    article = call_gemini(api_key, topic_code, topic_label, angle, existing_titles) if api_key else None
    if not article:
        article = fallback_post(topic_code, topic_label, angle, len(posts) + 1)

    new_entry = {
        "id": f"post-{len(posts) + 1:03d}",
        "date": today_str,
        "topic": article["topic"],
        "topic_label": article["topic_label"],
        "read_time": article.get("read_time", "5 MIN READ"),
        "title": article["title"],
        "summary": article["summary"],
        "architecture_flow": article.get("architecture_flow", "Input -> Pipeline -> Output"),
        "sections": article.get("sections", []),
        "takeaway": article.get("takeaway", "")
    }

    posts.insert(0, new_entry)
    with open(POSTS_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    update_feeds(posts, today_str)
    print(f"Published: {new_entry['title']}")

if __name__ == "__main__":
    main()
