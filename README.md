# Anelia D. Yordanova — portfolio and market notes

My personal site: projects where I apply AI to finance problems, a small finance lab built in JavaScript, and a blog with commentary on financial news.

Plain HTML, CSS and JavaScript. No build step: GitHub Pages serves the files as they are.

## Structure

```
index.html            Home: hero, selected work, latest posts, lab teaser, skills, about
blog.html             All posts, with topic filter
post.html             Renders one post from posts/<slug>.md
lab.html              CAPM and DCF calculators
projects/             One page per case study
posts/posts.json      List of posts (title, date, tag, summary)
posts/*.md            Post content in Markdown
assets/css/style.css  All styling (colors and fonts at the top)
assets/js/            main.js (shared), lab.js (calculators)
```

## Publish a new blog post

1. Copy `posts/_template.md` to a new file, e.g. `posts/norges-bank-rate-cut.md`. Use lowercase letters, numbers and dashes only.
2. Write the post in Markdown.
3. Add an entry to `posts/posts.json` with the same `slug`, a `title`, `date` (YYYY-MM-DD), `tag` and one-sentence `summary`.
4. Commit. The post is live within a couple of minutes.

You can do all of this in the GitHub website: open the `posts` folder, click **Add file → Create new file**, then edit `posts.json` with the pencil icon.

## Update a project

Each case study is a normal HTML file in `projects/`. Replace the "in progress" boxes with results and charts as the work is finished.

## Preview locally

```
python3 -m http.server
```

Then open http://localhost:8000. Opening the files directly (file://) won't load the blog posts, because browsers block `fetch` there.
