import { Database } from '@sqlitecloud/drivers';
import crypto from 'crypto';

const connectionString = 'sqlitecloud://cmq6frwshz.g4.sqlite.cloud:8860/DsCompany_Prospeccao.db?apikey=Dor8OwUECYmrbcS5vWfsdGpjCpdm9ecSDJtywgvRw8k';
const db = new Database(connectionString);

// Initialize schema asynchronously
async function initializeSchema() {
  try {
    await db.sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'operator',
        api_key TEXT UNIQUE
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        description TEXT,
        services TEXT,
        map_link TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        status TEXT DEFAULT 'prospectado',
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        prompt_template TEXT NOT NULL,
        flow_structure TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add api_key column if it doesn't exist (for existing databases)
    try {
      await db.sql`ALTER TABLE users ADD COLUMN api_key TEXT`;
    } catch (e) {
      // Column already exists, ignore
    }

    // Add full_data column to sites if it doesn't exist
    try {
      await db.sql`ALTER TABLE sites ADD COLUMN full_data TEXT`;
    } catch (e) {
      // Column already exists, ignore
    }

    // Insert default template if none exist
    const templates = await db.sql`SELECT COUNT(*) as count FROM templates`;
    const templateCount = templates[0].count;
    
    if (templateCount === 0) {
      const defaultPrompt = `Aja como um Arquiteto Front-end e Creative Developer sênior.

Desenvolva a melhor landing page do mundo para o "\${data.name}".

🚨 REQUISITO ABSOLUTO:
A experiência deve ser 100% responsiva seguindo estritamente a filosofia MOBILE FIRST.
Tudo deve funcionar perfeitamente em celular antes de desktop.

🎬 INTRO SEQUENCE (OBRIGATÓRIO):
Crie uma introdução animada de 5 segundos antes da página carregar:
- Tipografia cinética com o nome "\${data.name}"
- Animação estilo abertura rústica (como portas de madeira se abrindo)
- Partículas 3D simulando brasas de fogão a lenha
- Sons sutis de ambiente rural (opcional)
- Transição cinematográfica para o conteúdo

⚙️ REQUISITOS TÉCNICOS:
- Three.js para background 3D interativo
- GSAP para animações principais
- ScrollTrigger para animações no scroll
- HTML 100% standalone (CSS + JS internos)
- Alta performance
- Código limpo e organizado

🎯 OBJETIVO:
Criar uma landing page extremamente persuasiva focada em atrair clientes para o negócio.

📍 INFORMAÇÕES DO LOCAL:
- Nome: \${data.name}
- Endereço: \${data.address}
- Cidade: \${data.city}
- Google Maps: \${mapLink}

📱 CONTATO:
- WhatsApp: \${data.phone} (botão clicável)

🍽️ DESCRIÇÃO:
\${data.description}

🌿 EXPERIÊNCIA DO AMBIENTE:
- Ambiente rústico e aconchegante
- Espaço arborizado
- Clima familiar
- Música ao vivo
- Contato com a natureza

🔥 DIFERENCIAIS:
- Comida feita no fogão a lenha
- Mais de 20 anos de tradição
- Espaço Kids
- Estacionamento gratuito
- Ideal para famílias e eventos

🍴 SERVIÇOS (OBRIGATÓRIO DESTACAR EM CARDS ANIMADOS):
\${data.services}

🎬 ANIMAÇÕES (OBRIGATÓRIO):
- Efeito de fumaça leve subindo (fogão a lenha)
- Elementos de comida aparecendo com fade + scale
- Scroll com parallax suave
- Cards com hover 3D
- Seção de serviços com animação stagger
- Botões com efeito glow suave

🎨 DESIGN:
- Estilo rústico premium + moderno
- Cores: marrom, bege, verde, tons de madeira
- Efeito glassmorphism leve
- Tipografia elegante e acolhedora
- Texturas suaves de madeira

🧠 SEÇÕES DA LANDING PAGE:
1. Hero Section (com animação inicial + CTA)
2. Sobre o Restaurante
3. Experiência do Ambiente
4. Serviços (cards animados)
5. Diferenciais
6. Galeria (com animação)
7. Localização (mapa embutido)
8. CTA final

📲 CTA FINAL (OBRIGATÓRIO):
- Botão grande WhatsApp
- Texto forte: “Venha viver a verdadeira experiência da culinária mineira!”
- Destaque para família e tradição

⚠️ REGRAS FINAIS:
- Página extremamente profissional
- Totalmente responsiva
- Alta conversão
- NÃO usar markdown
- Retornar APENAS HTML completo`;

      const defaultFlow = JSON.stringify({
        "nodes": [
          {
            "id": "node-start",
            "type": "custom",
            "data": { "label": "Início do Fluxo", "type": "start", "status": "SUCCESS", "config": {} }
          },
          {
            "id": "node-gemini-mobile-first",
            "type": "custom",
            "data": {
              "label": "Gerar Landing Page Mobile First",
              "type": "httpRequest",
              "status": "SUCCESS",
              "config": {
                "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={YOUR_API_KEY}",
                "method": "POST",
                "body": {
                  "contents": [{ "parts": [{ "text": "{{prompt}}" }] }]
                }
              }
            }
          },
          {
            "id": "node-deploy-mobile",
            "type": "custom",
            "data": {
              "label": "Deploy Mobile First Experience",
              "type": "httpRequest",
              "status": "SUCCESS",
              "config": {
                "url": "https://flowpost.onrender.com/api/upload",
                "method": "POST",
                "body": {
                  "name": "{{siteName}} - Mobile First Immersive",
                  "html": "{{input.text}}"
                }
              }
            }
          }
        ],
        "edges": [
          { "id": "e-start-gemini", "source": "node-start", "target": "node-gemini-mobile-first" },
          { "id": "e-gemini-deploy", "source": "node-gemini-mobile-first", "target": "node-deploy-mobile" }
        ]
      });

      await db.sql`INSERT INTO templates (name, prompt_template, flow_structure) VALUES ('Modelo Rústico Padrão', ${defaultPrompt}, ${defaultFlow})`;
      
      const modernPrompt = `Aja como um Arquiteto Front-end e Creative Developer sênior.
Desenvolva uma landing page ultra-moderna e minimalista para "\${data.name}".
Foco em tecnologia, design limpo e alta conversão.
Use Dark Mode por padrão com acentos em Neon.
Placeholder: \${data.name}, \${data.address}, \${data.city}, \${data.phone}, \${data.description}, \${data.services}, \${mapLink}.
Retorne APENAS HTML completo.`;

      const servicePrompt = `Aja como um Arquiteto Front-end e Creative Developer sênior.
Desenvolva uma landing page focada em serviços locais para "\${data.name}".
Design amigável, botões de agendamento claros e depoimentos.
Placeholder: \${data.name}, \${data.address}, \${data.city}, \${data.phone}, \${data.description}, \${data.services}, \${mapLink}.
Retorne APENAS HTML completo.`;

      await db.sql`INSERT INTO templates (name, prompt_template, flow_structure) VALUES ('Modelo Moderno Tech', ${modernPrompt}, ${defaultFlow})`;
      await db.sql`INSERT INTO templates (name, prompt_template, flow_structure) VALUES ('Modelo Serviços Locais', ${servicePrompt}, ${defaultFlow})`;
    }

    try {
      await db.sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key)`;
    } catch (e) {
      // ignore
    }

    // Generate API keys for users that don't have one
    const usersWithoutApiKey = await db.sql`SELECT id FROM users WHERE api_key IS NULL`;
    if (usersWithoutApiKey.length > 0) {
      for (const user of usersWithoutApiKey) {
        const apiKey = crypto.randomBytes(24).toString('hex');
        await db.sql`UPDATE users SET api_key = ${apiKey} WHERE id = ${user.id}`;
      }
    }
  } catch (error) {
    console.error('Error initializing SQLite Cloud schema:', error);
  }
}

// Start initialization
initializeSchema();

export default db;
