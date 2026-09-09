import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço — Nova Era AI CRM",
  description: "Condições de uso do CRM interno da Nova Era AI.",
};

const ATUALIZADO = "9 de setembro de 2026";

export default function TermosPage() {
  return (
    <article
      className="space-y-7"
      style={{ color: "#C3D4E8", fontSize: "15px", lineHeight: 1.7 }}
    >
      <header className="space-y-2">
        <h1
          className="font-display font-bold tracking-tight"
          style={{ color: "#E2EBF8", fontSize: "30px", lineHeight: 1.2 }}
        >
          Termos de Serviço
        </h1>
        <p style={{ color: "#7BA3C6", fontSize: "14px" }}>
          CRM da Nova Era AI · atualizados em {ATUALIZADO}
        </p>
      </header>

      <Secao titulo="1. O que é este sistema">
        <p>
          O CRM da Nova Era AI é uma ferramenta <strong>de uso interno</strong> da
          Nova Era AI (CNPJ 59.305.580/0001-78, Uberlândia — MG), destinada à
          gestão comercial, de projetos e administrativa da própria empresa.
        </p>
        <p>
          Não é um serviço aberto ao público nem oferecido comercialmente. Não há
          cadastro público: as contas são criadas pela empresa.
        </p>
      </Secao>

      <Secao titulo="2. Quem pode usar">
        <p>
          Apenas sócios e colaboradores da Nova Era AI, com conta criada pela
          administração. O acesso é pessoal e intransferível, e cessa quando
          termina o vínculo com a empresa.
        </p>
      </Secao>

      <Secao titulo="3. Uso aceitável">
        <p>Ao usar o sistema, você concorda em:</p>
        <ul className="space-y-2 pl-1">
          <Item>Não compartilhar suas credenciais de acesso.</Item>
          <Item>
            Não extrair, copiar ou divulgar dados de clientes para fora da
            empresa sem autorização.
          </Item>
          <Item>
            Usar o sistema apenas para as atividades da Nova Era AI.
          </Item>
          <Item>
            Não tentar contornar as permissões atribuídas ao seu papel.
          </Item>
        </ul>
      </Secao>

      <Secao titulo="4. Integração com o Google Calendar">
        <p>
          A conexão com o Google Calendar é opcional e feita por cada pessoa, na
          própria conta. Ela pode ser desfeita a qualquer momento na tela de
          Integrações ou em{" "}
          <a
            href="https://myaccount.google.com/permissions"
            style={{ color: "#0CA8F5" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            myaccount.google.com/permissions
          </a>
          .
        </p>
        <p>
          O tratamento dos dados obtidos por essa integração está descrito na{" "}
          <a href="/privacidade" style={{ color: "#0CA8F5" }}>
            Política de Privacidade
          </a>
          , que é parte integrante destes termos.
        </p>
      </Secao>

      <Secao titulo="5. Conteúdo gerado por inteligência artificial">
        <p>
          O sistema inclui assistentes que produzem diagnósticos, arquiteturas,
          propostas e minutas de contrato. Essas saídas são{" "}
          <strong>rascunhos de trabalho</strong>, sujeitas a revisão humana antes
          de qualquer uso externo.
        </p>
        <p>
          Nenhum documento gerado por assistente vale como peça final sem
          conferência e aprovação de uma pessoa responsável. Minutas de contrato,
          em particular, não substituem análise jurídica.
        </p>
      </Secao>

      <Secao titulo="6. Disponibilidade">
        <p>
          O sistema é fornecido no estado em que se encontra, para uso interno.
          Não há garantia de disponibilidade ininterrupta, e ele depende de
          serviços de terceiros (hospedagem, banco de dados, APIs do Google e de
          provedores de IA) cujas interrupções fogem ao controle da empresa.
        </p>
      </Secao>

      <Secao titulo="7. Propriedade">
        <p>
          O sistema, seu código-fonte e sua arquitetura são propriedade
          intelectual exclusiva da Nova Era AI. Os dados de clientes tratados nele
          seguem o disposto nos contratos firmados com cada cliente.
        </p>
      </Secao>

      <Secao titulo="8. Alterações">
        <p>
          Estes termos podem ser atualizados. A data de atualização no topo desta
          página indica a versão vigente.
        </p>
      </Secao>

      <Secao titulo="9. Foro">
        <p>
          Fica eleito o foro da Comarca de Uberlândia — Minas Gerais para dirimir
          questões decorrentes destes termos.
        </p>
      </Secao>

      <Secao titulo="10. Contato">
        <p>
          Nova Era AI · CNPJ 59.305.580/0001-78 · Uberlândia — Minas Gerais
          <br />
          <a href="mailto:contato@novaeraai.com.br" style={{ color: "#0CA8F5" }}>
            contato@novaeraai.com.br
          </a>
        </p>
      </Secao>
    </article>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2
        className="font-display font-semibold tracking-tight"
        style={{ color: "#E2EBF8", fontSize: "18px" }}
      >
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden style={{ color: "#0CA8F5" }}>·</span>
      <span>{children}</span>
    </li>
  );
}
