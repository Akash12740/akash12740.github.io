Website Link - https://akash12740.github.io

<div align="center">

<a href="https://akash12740.github.io">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=3200&pause=1000&color=00F2FE¢er=true&vCenter=true&width=820&lines=Akash+Saini+%7C+AI+%26+Machine+Learning+Engineer;BITS+Pilani+Integrated+M.Sc.+Mathematics+Graduate;LLM+Fine-Tuning+%E2%80%A2+RAG+Pipelines+%E2%80%A2+Reasoning+Evaluation;Live+Interactive+AI+Demos+%26+Applied+Math+Playgrounds" alt="Typing SVG" />
</a>

<p align="center">
  <strong>Production-Grade, Modular & JSON-Driven AI/ML Engineering Portfolio, Interactive Math Lab & Automated Technical Blog</strong>
</p>

<p align="center">
  <a href="https://akash12740.github.io" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Portfolio-akash12740.github.io-00f2fe?style=for-the-badge&logo=githubpages&logoColor=050811" alt="Live Portfolio" />
  </a>
  <a href="https://akash12740.github.io/blog.html" target="_blank">
    <img src="https://img.shields.io/badge/📝_Technical_Blog-Read_Articles-a855f7?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Technical Blog" />
  </a>
  <a href="https://huggingface.co/spaces/Akash12740/rag-document-qa-demo" target="_blank">
    <img src="https://img.shields.io/badge/🤗_Live_RAG_Demo-Hugging_Face_Space-FFD21E?style=for-the-badge&logo=huggingface&logoColor=050811" alt="Hugging Face RAG Demo" />
  </a>
  <a href="https://akash12740.github.io/capabilities.html" target="_blank">
    <img src="https://img.shields.io/badge/📄_Capabilities_Deck-1--Page_Brief-10b981?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="Capabilities Deck" />
  </a>
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/akash-saini-83a42a1b1/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-Akash_Saini-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://topmate.io/akash12740/" target="_blank">
    <img src="https://img.shields.io/badge/Topmate-1:1_Mentorship-FF5A5F?style=flat-square&logo=googlemeet&logoColor=white" alt="Topmate" />
  </a>
  <a href="https://cal.com/akash-saini-12740/15min" target="_blank">
    <img src="https://img.shields.io/badge/Cal.com-15--Min_AI_Consulting-111827?style=flat-square&logo=googlecalendar&logoColor=white" alt="Cal.com" />
  </a>
  <a href="https://akashsaini12740.gumroad.com" target="_blank">
    <img src="https://img.shields.io/badge/Gumroad-RAG_&_Math_Kits-FF90E8?style=flat-square&logo=gumroad&logoColor=050811" alt="Gumroad" />
  </a>
  <a href="https://substack.com/@akashsaini12740" target="_blank">
    <img src="https://img.shields.io/badge/Substack-AI_&_Math_Newsletter-FF6719?style=flat-square&logo=substack&logoColor=white" alt="Substack" />
  </a>
  <a href="https://akash12740.github.io/rss.xml" target="_blank">
    <img src="https://img.shields.io/badge/RSS-Auto_Feed-FFA500?style=flat-square&logo=rss&logoColor=white" alt="RSS Feed" />
  </a>
</p>

</div>

---

## 🌟 Overview & Live Links

Welcome to the source repository for **[https://akash12740.github.io](https://akash12740.github.io)** — a decoupled, modular, and self-updating AI/ML engineering platform built to bridge **graduate-level mathematical rigor (BITS Pilani)** with **production AI systems**.

| Destination | Direct URL | What You'll Find |
| :--- | :--- | :--- |
| **🏠 Main Portfolio** | **[akash12740.github.io](https://akash12740.github.io)** | 60-Second Executive Brief, Live AI Playgrounds, Math Lab, Playable Math Games, Benchmarks & Experience |
| **📚 Engineering Blog** | **[akash12740.github.io/blog.html](https://akash12740.github.io/blog.html)** | Searchable, topic-filtered articles on AI, ML, Data Science, Data Analytics & LLMs with BibTeX citations |
| **🤗 Live RAG Engine** | **[Hugging Face Space](https://huggingface.co/spaces/Akash12740/rag-document-qa-demo)** | Zero-latency interactive document Q&A with semantic chunking, cosine similarity gates & citations |
| **📄 Capabilities Sheet** | **[akash12740.github.io/capabilities.html](https://akash12740.github.io/capabilities.html)** | Printable 1-page consulting & AI/ML engineering capabilities deck |
| **📡 RSS Syndication** | **[akash12740.github.io/rss.xml](https://akash12740.github.io/rss.xml)** | Auto-updated XML feed for Substack, LinkedIn automation & RSS readers |

---

## 🏗️ Decoupled System Architecture

Unlike static portfolios that require rewriting HTML/CSS for every update, this platform separates **presentation**, **logic**, and **content**:

```mermaid
flowchart LR
    subgraph Automation["⚙️ Daily Content Pipeline (GitHub Actions)"]
        CRON["Cron Trigger<br/>08:00 UTC Daily"] --> PY["scripts/generate_daily_blog.py<br/>(Gemini API + Fallback)"]
        PY --> JSON["data/posts.json"]
        PY --> SEO["sitemap.xml & rss.xml"]
    end

    subgraph DataLayer["🗄️ Single Source of Truth (/data)"]
        JSON
        PROJ["data/projects.json"]
        TEST["data/testimonials.json"]
    end

    subgraph Frontend["🖥️ Client-Side App (GitHub Pages CDN)"]
        APP["assets/js/app.js"]
        CSS["assets/css/style.css<br/>(Dark / Light Theme)"]
        HTML["index.html & blog.html"]
        HF["🤗 Hugging Face Static RAG Space"]
    end

    JSON --> APP
    PROJ --> APP
    TEST --> APP
    APP --> HTML
    CSS --> HTML
    HF -.->|Embedded Iframe| HTML
```

```text
```

```text
akash12740.github.io/
├── .github/
│   └── workflows/
│       └── daily-blog.yml        # Automated daily cron workflow (08:00 UTC)
├── scripts/
│   └── generate_daily_blog.py    # Generates new posts & updates posts.json, sitemap.xml & rss.xml
├── data/
│   ├── posts.json                # Single source of truth for homepage & blog.html articles
│   ├── projects.json             # Single source of truth for project cards & architecture modals
│   └── testimonials.json         # Single source of truth for collaborator & mentee endorsements
├── assets/
│   ├── css/
│   │   └── style.css             # Responsive glassmorphism UI with Dark / Light theme variables
│   └── js/
│       └── app.js                # Dynamic JSON renderer, BibTeX generator, Math Lab & Mini-Games
├── index.html                    # Main portfolio & interactive labs
├── blog.html                     # Searchable, filterable technical blog archive with quick TOC
├── capabilities.html             # Printable 1-page AI/ML consulting & capabilities deck
├── 404.html                      # Custom branded FAISS-themed 404 error page
├── rss.xml                       # Auto-generated RSS 2.0 syndication feed
├── sitemap.xml                   # Auto-updated XML sitemap for search engine indexing
├── robots.txt                    # Crawler directives
├── IMG_Akash_Saini.jpg           # Profile portrait
└── resume_AkashSaini.pdf         # Curriculum Vitae


🤝 Connect & Collaborate
🌐 Live Website: https://akash12740.github.io

💼 LinkedIn: linkedin.com/in/akash-saini-83a42a1b1

🎯 1:1 Mentorship & Mock Interviews: topmate.io/akash12740

📅 15-Min AI/ML Consulting Call: cal.com/akash-saini-12740/15min

📦 RAG & Math Starter Kits: akashsaini12740.gumroad.com

✉️ Email: aksainibits@gmail.com

Built with mathematical rigor by Akash Saini • Integrated M.Sc. Mathematics, BITS Pilani
