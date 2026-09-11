import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Nova Era AI CRM",
  description:
    "Como o CRM da Nova Era AI trata os dados de quem o usa, incluindo os dados do Google Calendar.",
};

const ATUALIZADO = "9 de setembro de 2026";

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p style={{ color: "#7BA3C6", fontSize: "14px" }}>
          CRM da Nova Era AI · atualizada em {ATUALIZADO}
        </p>
      </header>

      <Secao titulo="Do que trata este documento">
        <p>
          O CRM da Nova Era AI é um sistema <strong>de uso interno</strong> da Nova
          Era AI (CNPJ 40.644.314/0001-41, Uberlândia — MG). Ele não é oferecido ao
          público: o acesso é criado pela própria empresa para seus sócios e
          colaboradores.
        </p>
        <p>
          Esta política descreve quais dados o sistema guarda, por que, e o que
          acontece com eles — em especial os dados do Google Calendar, que só
          entram quando a própria pessoa autoriza.
        </p>
      </Secao>

      <Secao titulo="Dados do Google que o sistema acessa">
        <p>
          A conexão com o Google Calendar é <strong>opcional e individual</strong>.
          Cada pessoa conecta a própria conta e pode desconectá-la quando quiser.
          Ninguém conecta a conta de outra pessoa.
        </p>
        <p>Ao autorizar, o sistema pede duas permissões:</p>
        <ul className="space-y-2 pl-1">
          <Item termo="Ver e editar eventos do calendário">
            para enviar ao seu Google Calendar os compromissos criados no CRM e
            para ler seus horários ocupados, de modo que a agenda comercial não
            marque reunião em cima de um compromisso que já existe.
          </Item>
          <Item termo="Ver seu endereço de e-mail">
            apenas para exibir qual conta Google está conectada, evitando que
            alguém sincronize a agenda errada sem perceber.
          </Item>
        </ul>
      </Secao>

      <Secao titulo="O que é efetivamente armazenado">
        <p>Do seu Google Calendar, o sistema guarda:</p>
        <ul className="space-y-2 pl-1">
          <Item termo="Blocos de ocupação">
            data, hora de início e fim, e o título do compromisso, numa janela de
            até 120 dias à frente. É o que permite dizer &quot;este horário está
            ocupado&quot;.
          </Item>
          <Item termo="Credenciais de acesso">
            os tokens que autorizam a sincronização, guardados de forma restrita e
            usados apenas para isso.
          </Item>
        </ul>
        <Aviso>
          Sobre o título dos compromissos pessoais: ele é armazenado e fica
          visível para quem tem acesso à organização no CRM, junto do horário
          ocupado. Se você mantém compromissos pessoais no mesmo calendário e
          prefere que os títulos não apareçam, use um calendário separado para
          o trabalho ou marque os eventos pessoais como privados.
        </Aviso>
        <p>
          O sistema <strong>não</strong> lê o conteúdo de e-mails, não acessa
          contatos, não acessa arquivos do Drive e não modifica compromissos que
          não tenham sido criados por ele.
        </p>
      </Secao>

      <Secao titulo="O que o sistema envia ao Google">
        <p>
          Somente os compromissos criados dentro do CRM: título, pauta, resultado
          registrado, link da reunião, data e horário. Nada além disso é escrito
          no seu calendário.
        </p>
      </Secao>

      <Secao titulo="Uso dos dados">
        <p>
          Os dados são usados exclusivamente para operar o CRM: agenda, tarefas,
          projetos, finanças e os assistentes internos da empresa.
        </p>
        <p>
          Os dados obtidos das APIs do Google <strong>não são</strong> vendidos,
          cedidos, usados para publicidade, nem usados para treinar modelos de
          inteligência artificial. O uso segue a{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            style={{ color: "#0CA8F5" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de Uso Limitado.
        </p>
      </Secao>

      <Secao titulo="Compartilhamento">
        <p>
          Não há compartilhamento com terceiros para fins comerciais. O sistema se
          apoia em fornecedores de infraestrutura que processam dados apenas para
          fazê-lo funcionar:
        </p>
        <ul className="space-y-2 pl-1">
          <Item termo="Supabase">banco de dados e autenticação.</Item>
          <Item termo="Vercel">hospedagem da aplicação.</Item>
          <Item termo="Google">sincronização de calendário, quando autorizada.</Item>
          <Item termo="Resend">envio de notificações por e-mail.</Item>
          <Item termo="Anthropic">
            assistentes internos. Recebem material comercial da própria empresa —
            transcrições de reunião e documentos de proposta — e não recebem dados
            do Google Calendar.
          </Item>
        </ul>
      </Secao>

      <Secao titulo="Retenção e exclusão">
        <p>
          Ao clicar em <strong>Desconectar</strong> na tela de Integrações, as
          credenciais do Google são apagadas do sistema e a sincronização para na
          hora.
        </p>
        <p>
          Você também pode revogar o acesso diretamente em{" "}
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
          Os demais dados são mantidos enquanto durar o vínculo com a empresa. Para
          solicitar exclusão, escreva para o contato abaixo.
        </p>
      </Secao>

      <Secao titulo="Segurança">
        <p>
          O acesso exige autenticação individual. Cada pessoa enxerga apenas o que
          seu papel permite, com as regras aplicadas no próprio banco de dados. As
          credenciais do Google ficam restritas ao dono da conexão. O tráfego é
          criptografado em trânsito.
        </p>
      </Secao>

      <Secao titulo="Seus direitos (LGPD)">
        <p>
          Nos termos da Lei nº 13.709/2018, você pode solicitar confirmação de
          tratamento, acesso, correção, portabilidade, anonimização ou exclusão
          dos seus dados, e revogar consentimentos a qualquer momento.
        </p>
      </Secao>

      <Secao titulo="Contato">
        <p>
          Nova Era AI · CNPJ 40.644.314/0001-41 · Uberlândia — Minas Gerais
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

function Item({ termo, children }: { termo: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden style={{ color: "#0CA8F5" }}>·</span>
      <span>
        <strong style={{ color: "#E2EBF8" }}>{termo}</strong> — {children}
      </span>
    </li>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-lg px-4 py-3"
      style={{
        background: "rgba(245,158,11,0.07)",
        border: "1px solid rgba(245,158,11,0.25)",
        color: "#e5c07b",
        fontSize: "14px",
      }}
    >
      {children}
    </p>
  );
}
