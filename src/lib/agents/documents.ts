/**
 * D1 e D2 são documentos que vão para o cliente, não análise interna.
 * Saem em HTML — e chegam aqui do jeito que o modelo escreveu, que quase
 * sempre é dentro de uma cerca ```html.
 */

const DOCUMENT_KINDS = new Set(["D1", "D2"]);

export const isDocumentKind = (kind: string | null): boolean =>
  !!kind && DOCUMENT_KINDS.has(kind);

/**
 * Tira o HTML de dentro da resposta.
 *
 * O modelo costuma escrever uma linha de contexto antes ("Segue o D1:") e
 * cercar o documento. Guardar tudo faria a linha de contexto virar texto
 * solto no topo do documento entregue ao cliente.
 */
export function extractHtml(text: string): string | null {
  const fenced = text.match(/```(?:html)?\s*\n([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();

  // Sem nenhuma tag de bloco não é documento — é o modelo respondendo em
  // prosa. Melhor guardar como markdown do que gravar prosa como HTML.
  if (!/<(html|body|div|section|h1|h2|table|article)\b/i.test(candidate)) return null;

  return candidate;
}

/**
 * Envelopa o fragmento para exibição isolada.
 *
 * O documento vai para um iframe com sandbox: sem script, sem acesso ao
 * CRM em volta. O modelo gera HTML que ninguém revisou linha a linha, e
 * ele é renderizado dentro de uma tela autenticada — o sandbox é o que
 * separa "documento" de "código rodando na sessão do sócio".
 */
export function wrapForPreview(html: string, title: string): string {
  const hasDoctype = /<html\b/i.test(html);
  if (hasDoctype) return html;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replace(/[<>&]/g, "")}</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0; padding: 40px;
    font: 15px/1.65 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #1a1a1a; background: #fff;
  }
  h1, h2, h3 { line-height: 1.25; text-wrap: balance; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e5e5e5; padding: 8px 10px; text-align: left; }
  img { max-width: 100%; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}
