// A coruja da marca, como desenho — e não como emoji.
//
// O emoji 🦉 é pintado pela fonte do sistema e é sempre marrom/âmbar: não há
// CSS que o recolora. Enquanto o acento do tema era âmbar isso passava, mas com
// o acento violeta o emoji ficava sendo a única coisa quente na tela.
//
// O desenho imita o emoji de propósito, para a troca não parecer outra marca:
// corpo em ovo (e não círculo), olhos grandes e encostados um no outro, tufos
// macios, asas laterais e barriga. As asas e a barriga são o mesmo
// `currentColor` com opacidade, então a coruja continua sendo de UMA cor só e
// segue o tema sem precisar de paleta própria.
//
// A cor vem de `currentColor`: a coruja assume a cor do texto de quem a coloca
// — violeta na marca, cinza no lugar de avatar.
//
// O mesmo desenho existe em app/icon.svg, o favicon, lá com as cores fixas
// (um favicon não enxerga as variáveis do tema). Mexeu aqui, mexa lá também.
//
// Os vazados (olhos e bico) são pintados com a cor do fundo em vez de serem
// recortes de verdade. Um recorte exigiria `mask` com `id` único por instância,
// e a página da mesa desenha uma coruja por membro. Como todas as superfícies
// do tema são quase pretas (#0b0f14 a #1b242f), a diferença é invisível no
// tamanho em que a coruja aparece.

export function Coruja({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      {/* tufos de orelha: pontudos, saindo do alto da cabeça */}
      <path d="M16 22 L17 8 L28 18 Z" />
      <path d="M48 22 L47 8 L36 18 Z" />

      {/* corpo em ovo: mais alto que largo, afinando embaixo */}
      <ellipse cx="32" cy="34" rx="21" ry="24" />

      {/* Asas: não dá para "clarear" uma área pintando a MESMA cor por cima com
          opacidade — o resultado é idêntico ao que já estava lá. Então elas são
          sugeridas por um traço da cor do fundo, que recorta e separa a asa do
          corpo. */}
      <path
        d="M17 26 Q11 38 18 51"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M47 26 Q53 38 46 51"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* olhos grandes e quase encostados, que é o que mais marca o emoji */}
      <circle cx="22.5" cy="28" r="9.5" fill="var(--background)" />
      <circle cx="41.5" cy="28" r="9.5" fill="var(--background)" />
      <circle cx="22.5" cy="28" r="4.6" />
      <circle cx="41.5" cy="28" r="4.6" />

      {/* bico curto, entre os olhos */}
      <path d="M32 33 L28 39 L36 39 Z" fill="var(--background)" />
    </svg>
  );
}
