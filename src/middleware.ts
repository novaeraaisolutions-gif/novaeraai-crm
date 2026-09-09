import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas de autenticação: abertas a quem não entrou, e que redirecionam
// para casa quem já entrou.
const AUTH_ROUTES = ["/login"];

// Rotas abertas de verdade: acessíveis com ou sem sessão, e que NÃO
// redirecionam ninguém. O Google busca a política de privacidade e os
// termos de fora, sem sessão nenhuma, para publicar o app OAuth — e um
// redirect para /login no lugar do documento reprova a publicação.
const OPEN_ROUTES = ["/privacidade", "/termos"];

// Rotas da própria conta, liberadas a qualquer papel: conectar o próprio
// Google Calendar não é administrar a organização, e tratar as duas
// coisas como a mesma deixava metade do time sem conseguir sincronizar.
// Os documentos abertos entram junto — ninguém deve ser barrado deles.
const SELF_SERVICE_PREFIXES = ["/integracoes", ...OPEN_ROUTES];

// Papéis com acesso restrito a um recorte do sistema. Admin e member
// continuam vendo tudo (não aparecem aqui).
//
// developer: área de Entrega (Projetos e Documentos) + Tarefas, porque é
//   pra lá que o email de "nova tarefa" aponta. Em /tasks ele só enxerga
//   as tarefas atribuídas a ele (filtro na página).
// comercial: bloco Comercial inteiro + Gestão (Tarefas e Agenda) +
//   Customer Success, esse último limitado à carteira dele.
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  developer: ["/projects", "/documents", "/tasks"],
  comercial: [
    "/leads", "/contacts", "/companies", "/proposals", "/catalog",
    "/tasks", "/calendar", "/customer-success", "/agentes",
  ],
};

const ROLE_HOME: Record<string, string> = {
  developer: "/projects",
  comercial: "/leads",
};

function isPublicRoute(pathname: string) {
  if (AUTH_ROUTES.includes(pathname)) return true;
  if (OPEN_ROUTES.includes(pathname)) return true;
  // Proposal public page
  if (pathname.match(/^\/proposals\/[^/]+\/public$/)) return true;
  return false;
}

function isAllowedForRole(role: string, pathname: string) {
  const prefixes = ROLE_ALLOWED_PREFIXES[role];
  if (!prefixes) return true; // papel sem restrição (admin, member)

  // As rotas de API não passam por este filtro. Toda uma delas já
  // autentica e escopa pelo próprio usuário — e o filtro aqui, pensado
  // para navegação, respondia a uma chamada de API com um redirect para
  // a home do papel. Do lado do cliente isso chega como HTML no lugar do
  // JSON: o botão não faz nada e não há erro nenhum para ver.
  //
  // Era o que quebrava "Conectar" no Google Calendar para comercial e
  // developer, e junto com ele a sincronização da agenda e a aba de
  // Agentes para o comercial.
  if (pathname.startsWith("/api/")) return true;

  return [...prefixes, ...SELF_SERVICE_PREFIXES].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "member";
    const home = ROLE_HOME[role] ?? "/dashboard";

    if (AUTH_ROUTES.includes(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    if (!isAllowedForRole(role, pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
