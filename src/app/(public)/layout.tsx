/**
 * Páginas abertas: política de privacidade e termos de serviço.
 *
 * Existem porque o Google exige as duas para publicar o app OAuth, e
 * precisam abrir sem login — o Google as busca de fora, sem sessão.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#080F1C", minHeight: "100vh" }}>
      <div className="mx-auto px-6 py-14" style={{ maxWidth: "46rem" }}>
        {children}
        <footer
          className="mt-16 pt-6 text-[12px] flex flex-wrap gap-x-5 gap-y-1"
          style={{ borderTop: "1px solid rgba(11,135,195,0.15)", color: "#3D5A78" }}
        >
          <span>Nova Era AI · CNPJ 40.644.314/0001-41 · Uberlândia — MG</span>
          <a href="/privacidade" style={{ color: "#7BA3C6" }}>Privacidade</a>
          <a href="/termos" style={{ color: "#7BA3C6" }}>Termos</a>
        </footer>
      </div>
    </div>
  );
}
