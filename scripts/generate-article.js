const fs = require('fs')
const { OpenAI } = require('openai')
const openai = new OpenAI()

async function generate() {
  const blogDir = './blog'
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir)

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'))
  const target = files.find((f) => fs.readFileSync(`${blogDir}/${f}`, 'utf8').trim() === '')

  if (!target) {
    console.log('Aucun fichier vide trouvé.')
    return
  }

  const prompt = target
    .replace('.md', '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/-/g, ' ')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `Rédige un article technique sur : "${prompt}". 
      Réponds UNIQUEMENT avec un objet JSON valide, sans bloc de code ni texte autour, au format suivant :
      {
        "title": "le titre",
        "summary": "un résumé court",
        "tags": ["tag1", "tag2"],
        "body": "le contenu complet de l'article en Markdown"
      }`,
      },
    ],
  })

  const content = JSON.parse(response.choices[0].message.content)
  const article = [
    '---',
    `title: "${content.title.replace(/"/g, '\\"')}"`,
    `summary: "${content.summary.replace(/"/g, '\\"')}"`,
    `tags: ${JSON.stringify(content.tags)}`,
    '---',
    '',
    content.body,
  ].join('\n')

  fs.writeFileSync(`${blogDir}/${target}`, article, 'utf8') // utf8 explicite
  console.log(`Article généré dans ${target}`)
  const titleMatch = content.match(/title:\s*"(.*?)"/)
  const summaryMatch = content.match(/summary:\s*"(.*?)"/)

  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `ARTICLE_TITLE=${titleMatch ? titleMatch[1] : 'Titre non trouvé'}\n`)
    fs.appendFileSync(
      process.env.GITHUB_ENV,
      `ARTICLE_SUMMARY=${summaryMatch ? summaryMatch[1] : 'Résumé non trouvé'}\n`
    )
  }
}

generate()
