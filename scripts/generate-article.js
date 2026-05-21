const fs = require('fs');
const { OpenAI } = require('openai');
const openai = new OpenAI();

async function generate() {
  const files = fs.readdirSync('./blog').filter(f => f.endsWith('.md'));
  const target = files.find(f => fs.readFileSync(`./blog/${f}`, 'utf8').trim() === '');
  
  if (!target) return console.log("Aucun fichier vide trouvé.");

  const prompt = target.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ');

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `Rédige un article technique sur : "${prompt}". 
      Tu dois obligatoirement commencer par ce bloc YAML exact au tout début:
      ---
      title: "Titre de l'article"
      summary: "Résumé court"
      tags: ["tag1", "tag2"]
      ---
      Puis tu écris le contenu de l'article en Markdown juste en dessous.`
    }]
  });

  fs.writeFileSync(`./blog/${target}`, response.choices[0].message.content);
  console.log(`Article généré dans ${target}`);

  const titleMatch = response.choices[0].message.content.match(/title:\s*"(.*?)"/);
  const summaryMatch = response.choices[0].message.content.match(/summary:\s*"(.*?)"/);

  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `ARTICLE_TITLE=${titleMatch ? titleMatch[1] : 'Titre non trouvé'}\n`);
    fs.appendFileSync(process.env.GITHUB_ENV, `ARTICLE_SUMMARY=${summaryMatch ? summaryMatch[1] : 'Résumé non trouvé'}\n`);
  }
}

generate();