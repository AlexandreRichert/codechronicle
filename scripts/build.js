import { marked } from 'marked';

const fs = require('fs');
const path = require('path');
const fm = require('front-matter');

const blogDir = path.join(__dirname, '../blog');
const publicDir = path.join(__dirname, '../public');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') && fs.statSync(path.join(blogDir, f)).size > 0);

let indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeChronicle - Blog Technique</title>
</head>
<body>
    <header>
        <h1>CodeChronicle</h1>
    </header>
    <main>
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
    </head>
    <body>
        <nav><a href="index.html">← Retour à l'accueil</a></nav>
        <main>
            <article>
                <header>
                    <h1>${content.attributes.title}</h1>
                    <p><strong>Résumé:</strong> <em>${content.attributes.summary}</em></p>
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
    indexHtml += `<li><a href="${fileName}">${content.attributes.title}</a> - ${content.attributes.summary}</li>`;
});

indexHtml += `</ul>
    </main>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
console.log('Build terminé : Site généré dans /public');