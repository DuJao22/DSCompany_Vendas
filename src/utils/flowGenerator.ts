export const fillTemplate = (template: string, data: any, mapLink: string) => {
  let filled = template;
  
  // Replace ${data.xxx}
  const dataMatches = filled.match(/\$\{data\.[a-zA-Z0-9_]+\}/g);
  if (dataMatches) {
    dataMatches.forEach(match => {
      const key = match.replace('${data.', '').replace('}', '');
      filled = filled.replace(match, data[key] || '');
    });
  }
  
  // Replace ${mapLink}
  filled = filled.replace(/\$\{mapLink\}/g, mapLink);
  
  return filled;
};

export const generatePrompt = (data: any, mapLink: string) => {
  const instagramCTA = `
<div style="background: #000; color: #fff; padding: 40px 20px; text-align: center; font-family: sans-serif;">
  <p style="font-size: 14px; opacity: 0.7; margin-bottom: 10px;">Desenvolvido por</p>
  <h2 style="font-size: 24px; letter-spacing: 2px; margin-bottom: 20px;">DS COMPANY</h2>
  <a href="https://www.instagram.com/dscompany1_/" target="_blank" style="display: inline-block; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: #fff; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; transition: transform 0.3s ease;">
    SIGA NO INSTAGRAM @dscompany1_
  </a>
</div>`;

  const defaultTemplate = `Aja como um Arquiteto Front-end e Creative Developer sênior.

Desenvolva a melhor landing page do mundo para o "\${data.name}".

🚨 REQUISITO ABSOLUTO:
A experiência deve ser 100% responsiva seguindo estritamente a filosofia MOBILE FIRST.
Tudo deve funcionar perfeitamente em celular antes de desktop.

⚙️ REQUISITOS TÉCNICOS:
- HTML 100% standalone (CSS + JS internos)
- Alta performance
- Design moderno e persuasivo

📍 INFORMAÇÕES:
- Nome: \${data.name}
- Endereço: \${data.address}
- Cidade: \${data.city}
- WhatsApp: \${data.phone}
- Descrição: \${data.description}
- Serviços: \${data.services}

💎 CRÉDITOS E INSTAGRAM (OBRIGATÓRIO NO RODAPÉ):
Adicione este código HTML exatamente como está no final da página, antes de fechar o body:
${instagramCTA}

⚠️ REGRAS DE OURO (PROIBIDO VIOLAR):
1. RETORNE APENAS O CÓDIGO HTML.
2. NÃO ESCREVA NADA ANTES DO HTML (NEM "AQUI ESTÁ O CÓDIGO", NEM "ESTE É O CÓDIGO").
3. NÃO USE BLOCOS DE CÓDIGO MARKDOWN (NÃO USE \`\`\`html OU \`\`\`).
4. O RESULTADO DEVE COMEÇAR DIRETAMENTE COM <!DOCTYPE html> E TERMINAR COM </html>.
5. QUALQUER TEXTO FORA DAS TAGS HTML QUEBRARÁ O SISTEMA.`;
  
  return fillTemplate(defaultTemplate, data, mapLink);
};

export const generatePromptWithTemplate = (data: any, mapLink: string, template: string) => {
  return fillTemplate(template, data, mapLink);
};

export const generateFlowJson = (promptText: string, siteName: string = "DS Company", flowId?: string, inputData?: any, flowStructure?: string) => {
  const id = flowId || `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  if (flowStructure) {
    try {
      const structure = JSON.parse(flowStructure);
      
      // Replace placeholders in the structure
      const processNode = (node: any) => {
        if (node.data?.config?.body) {
          let bodyStr = JSON.stringify(node.data.config.body);
          bodyStr = bodyStr.replace(/\{\{prompt\}\}/g, promptText.replace(/"/g, '\\"').replace(/\n/g, '\\n'));
          bodyStr = bodyStr.replace(/\{\{siteName\}\}/g, siteName);
          node.data.config.body = JSON.parse(bodyStr);
        }
        if (node.data?.label) {
          node.data.label = node.data.label.replace(/\{\{siteName\}\}/g, siteName);
        }
        return node;
      };

      return {
        ...structure,
        id,
        nodes: structure.nodes.map(processNode),
        data: inputData || {}
      };
    } catch (e) {
      console.error("Error parsing flow structure:", e);
    }
  }

  // Fallback to original hardcoded flow
  return {
    "id": id,
    "nodes": [
      {
        "id": "node-start",
        "type": "custom",
        "position": {
          "x": -99.44802207135139,
          "y": 37.07234042553192
        },
        "data": {
          "label": "Início do Fluxo",
          "type": "start",
          "status": "SUCCESS",
          "config": {}
        },
        "width": 180,
        "height": 63,
        "selected": false,
        "positionAbsolute": {
          "x": -99.44802207135139,
          "y": 37.07234042553192
        },
        "dragging": false
      },
      {
        "id": "node-gemini-mobile-first",
        "type": "custom",
        "position": {
          "x": 65.61226131358058,
          "y": 142.3501340176197
        },
        "data": {
          "label": "Gerar Landing Page Mobile First",
          "type": "httpRequest",
          "status": "SUCCESS",
          "config": {
            "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={YOUR_API_KEY}",
            "method": "POST",
            "body": {
              "contents": [
                {
                  "parts": [
                    {
                      "text": promptText
                    }
                  ]
                }
              ],
              "systemInstruction": {
                "parts": [
                  {
                    "text": "Você é um gerador de código HTML puro. Retorne APENAS o código HTML completo, começando com <!DOCTYPE html> e terminando com </html>. NÃO use markdown. NÃO escreva nenhuma introdução, explicação ou comentário fora das tags HTML. Se houver qualquer texto fora do HTML, o sistema falhará."
                  }
                ]
              }
            }
          }
        },
        "width": 214,
        "height": 63,
        "selected": true,
        "positionAbsolute": {
          "x": 65.61226131358058,
          "y": 142.3501340176197
        },
        "dragging": false
      },
      {
        "id": "node-deploy-mobile",
        "type": "custom",
        "position": {
          "x": -91.20970848570477,
          "y": 269.9890936668883
        },
        "data": {
          "label": "Deploy Mobile First Experience",
          "type": "httpRequest",
          "status": "SUCCESS",
          "config": {
            "url": "https://flowpost.onrender.com/api/upload",
            "method": "POST",
            "body": {
              "name": `${siteName} - Mobile First Immersive`,
              "html": "{{input.text}}"
            }
          }
        },
        "width": 214,
        "height": 63,
        "selected": false,
        "positionAbsolute": {
          "x": -91.20970848570477,
          "y": 269.9890936668883
        },
        "dragging": false
      }
    ],
    "edges": [
      {
        "id": "e-start-gemini",
        "source": "node-start",
        "target": "node-gemini-mobile-first",
        "type": "smoothstep",
        "animated": true,
        "style": {
          "strokeWidth": 3,
          "stroke": "#3b82f6"
        },
        "markerEnd": {
          "type": "arrowclosed",
          "color": "#3b82f6"
        }
      },
      {
        "id": "e-gemini-deploy",
        "source": "node-gemini-mobile-first",
        "target": "node-deploy-mobile",
        "type": "smoothstep",
        "animated": true,
        "style": {
          "strokeWidth": 3,
          "stroke": "#3b82f6"
        },
        "markerEnd": {
          "type": "arrowclosed",
          "color": "#3b82f6"
        }
      }
    ],
    "data": inputData || {}
  };
};
