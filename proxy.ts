// Login obrigatório: redireciona quem não está autenticado para /entrar.
//
// Esta é uma checagem OTIMISTA (só verifica a presença do cookie de sessão,
// sem consultar o banco) — adequada para o proxy, que roda em toda requisição.
// A autorização "de verdade" (quem pode ver/editar o quê) é feita junto aos
// dados, conforme as permissões por papel forem detalhadas.
import { NextResponse, type NextRequest } from "next/server";

// Rotas acessíveis sem login.
const ROTAS_PUBLICAS = ["/entrar"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Cookies de sessão do Auth.js (http em dev, __Secure- em produção/https).
  const temSessao =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  const ehPublica = ROTAS_PUBLICAS.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  );

  // Não logado tentando acessar área protegida → vai para o login.
  if (!temSessao && !ehPublica) {
    const url = new URL("/entrar", req.url);
    if (pathname !== "/") url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Já logado tentando acessar a página de login → vai para a home.
  if (temSessao && ehPublica) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Roda em tudo, exceto rotas de API (inclui /api/auth), assets do Next,
  // favicon e arquivos .svg.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
