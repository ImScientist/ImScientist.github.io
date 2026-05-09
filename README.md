# I ♥ DS

A personal blog built with [Jekyll](https://jekyllrb.com/) and deployed via [GitHub Pages](https://pages.github.com/) at **https://ImScientist.github.io**.

## Local Development

### Prerequisites
- Ruby ≥ 2.7
- Bundler (`gem install bundler`)

### Setup & Run

```bash
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000/` in your browser.

## Customization

Edit `_config.yml` to update your name, bio, LinkedIn URL, and GitHub URL:

```yaml
author:
  name: "ImScientist"
  bio: ""
  profile_image: /assets/images/me.jpeg
  linkedin: "https://www.linkedin.com/in/..."
  github: "https://github.com/ImScientist"
```

## Writing Posts

Add HTML or Markdown files to `_posts/` following the naming convention `YYYY-MM-DD-title.md`:

```markdown
---
layout: post
title: "My Post Title"
date: 2026-01-01
image: /assets/images/my-image.jpg
excerpt: "One sentence summary shown on the home tile."
mathjax: true
---

Post content here...
```

Use `mathjax: true` in the front matter to enable equation rendering via MathJax v3.

## Deploying to GitHub Pages

This repo is set up for deployment as a **user GitHub Pages site** (`ImScientist.github.io`):

1. Push this repository to the `ImScientist/ImScientist.github.io` GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Choose **main** branch and **/ (root)** folder. Click **Save**.
5. Your blog will be live at `https://ImScientist.github.io`.

