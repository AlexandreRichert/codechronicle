const fs = require('fs');
const path = require('path');
const fm = require('front-matter');

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
    <link rel="stylesheet" href="style.css">
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
    <link rel="stylesheet" href="style.css">
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