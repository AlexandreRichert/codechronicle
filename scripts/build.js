const fs = require('fs');
const path = require('path');
const fm = require('front-matter');

const darkCss = `
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        background: #0d1117;
        color: #c9d1d9;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 1rem;
        line-height: 1.7;
        padding: 2rem 1rem;
      }

      header, nav, main, footer { max-width: 760px; margin: 0 auto; }

      header { border-bottom: 1px solid #21262d; padding-bottom: 1.5rem; margin-bottom: 2rem; }
      header h1 { font-size: 2rem; color: #e6edf3; letter-spacing: -0.5px; }
      header p  { color: #8b949e; margin-top: 0.4rem; }

      nav { margin-bottom: 2rem; }
      nav a { color: #58a6ff; text-decoration: none; font-size: 0.9rem; }
      nav a:hover { text-decoration: underline; }

      h1, h2, h3, h4 { color: #e6edf3; margin: 1.6rem 0 0.6rem; line-height: 1.3; }
      h2 { font-size: 1.4rem; border-bottom: 1px solid #21262d; padding-bottom: 0.4rem; }
      h3 { font-size: 1.15rem; }

      p { margin: 0.8rem 0; }

      a { color: #58a6ff; text-decoration: none; }
      a:hover { text-decoration: underline; }

      ul { padding-left: 1.4rem; margin: 0.8rem 0; }
      li { margin: 0.5rem 0; line-height: 1.6; }
      li a { font-weight: 600; }

      code {
        background: #161b22;
        border: 1px solid #21262d;
        border-radius: 4px;
        padding: 0.15em 0.4em;
        font-size: 0.88em;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
        color: #e6edf3;
      }

      pre {
        background: #161b22;
        border: 1px solid #21262d;
        border-radius: 8px;
        padding: 1.2rem;
        overflow-x: auto;
        margin: 1.2rem 0;
      }
      pre code { background: none; border: none; padding: 0; font-size: 0.9em; }

      article header { border-bottom: 1px solid #21262d; padding-bottom: 1rem; margin-bottom: 1.5rem; }
      article header h1 { font-size: 1.8rem; }
      article footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #21262d; color: #8b949e; font-size: 0.85rem; }

      body > footer, main + footer {
        max-width: 760px; margin: 2.5rem auto 0;
        border-top: 1px solid #21262d;
        padding-top: 1rem;
        color: #8b949e;
        font-size: 0.85rem;
        text-align: center;
      }
    </style>`;

async function build() {
    const { marked } = await import('marked');

    const blogDir = path.join(__dirname, '../blog');
    const publicDir = path.join(__dirname, '../public');

    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }

    const files = fs
        .readdirSync(blogDir)
        .filter(
            f =>
                f.endsWith('.md') &&
                fs.statSync(path.join(blogDir, f)).size > 0
        );

    let indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeChronicle - Blog Technique</title>
    ${darkCss}
</head>
<body>
    <header>
        <h1>CodeChronicle</h1>
        <p>Blog technique automatisé.</p>
    </header>
    <main>
        <h2>Articles récents</h2>
        <ul>`;

    files.forEach(file => {
        const data = fs.readFileSync(path.join(blogDir, file), 'utf8');
        const content = fm(data);
        const htmlBody = marked.parse(content.body);
        const fileName = file.replace('.md', '.html');

        const articleHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.attributes.title}</title>
    ${darkCss}
</head>
<body>
    <nav><a href="index.html">← Retour à l'accueil</a></nav>
    <main>
        <article>
            <header>
                <h1>${content.attributes.title}</h1>
                <p><strong>Résumé :</strong> <em>${content.attributes.summary}</em></p>
            </header>
            <section>
                ${htmlBody}
            </section>
            <footer>
                <p>Tags : ${content.attributes.tags ? content.attributes.tags.join(', ') : ''}</p>
            </footer>
        </article>
    </main>
</body>
</html>`;

        fs.writeFileSync(path.join(publicDir, fileName), articleHtml);

        indexHtml += `
            <li>
                <a href="${fileName}">${content.attributes.title}</a>
                - ${content.attributes.summary}
            </li>`;
    });

    indexHtml += `
        </ul>
    </main>
    <footer><p>&copy; 2026 CodeChronicle</p></footer>
</body>
</html>`;

    fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
}

build();