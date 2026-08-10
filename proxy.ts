// Login obrigatório: redireciona quem não está autenticado para /entrar.
//
// Esta é uma checagem OTIMISTA (só verifica a presença do cookie de sessão,
// sem consultar o banco) — adequada para o proxy, que roda em toda requisição.
// A autorização "de verdade" (quem pode ver/editar o quê) é feita junto aos
// dados, conforme as permissões por papel forem detalhadas.
import { NextResponse, type NextRequest } from "next/server";

// "Não exige login" e "não faz sentido para quem já está logado" são coisas
// diferentes, e por isso são duas listas.
//
// /f/[token] é o link público da ficha: dispensa login (primeira lista) mas
// tem de abrir para todo mundo — inclusive para o próprio dono, que clica no
// link que acabou de copiar. Se as duas ideias fossem a mesma lista, ele seria
// mandado para a home ao testar o próprio compartilhamento.
const SEM_LOGIN = ["/entrar", "/f"];
const SO_DESLOGADO = ["/entrar"];

const casa = (pathname: string, rotas: string[]) =>
  rotas.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Cookies de sessão do Auth.js (http em dev, __Secure- em produção/https).
  const temSessao =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  // Não logado tentando acessar área protegida → vai para o login.
  if (!temSessao && !casa(pathname, SEM_LOGIN)) {
    const url = new URL("/entrar", req.url);
    if (pathname !== "/") url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Já logado tentando acessar a página de login → vai para a home.
  if (temSessao && casa(pathname, SO_DESLOGADO)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Roda em tudo, exceto rotas de API (inclui /api/auth), assets do Next,
  // favicon e arquivos .svg.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
