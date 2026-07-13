# Casa do Baralho — Catálogo de Baralhos

Site estático (HTML + CSS + JS puro) pronto para o GitHub Pages. Sem back-end, banco de dados ou build.

Agora **tanto os produtos quanto as categorias** são controlados por arquivos JSON. Adicionar, remover, renomear ou reordenar uma categoria não exige tocar em HTML, CSS ou JS — só editar `data/categorias.json`.

## data/categorias.json — controla as categorias

```json
{
  "id": "novidades",
  "nome": "Novidades",
  "subtitulo": "Lançamentos recentes para renovar sua coleção.",
  "aviso": null,
  "cor": null
}
```

- **id** — identificador único da categoria (sem espaços/acentos). É o que liga os produtos a ela e vira o link de âncora do menu (`#id`). Se você renomear o `id` de uma categoria já existente, lembre de atualizar o campo `categoria` dos produtos que a usam.
- **nome** — texto exibido no menu, título da seção e rodapé. Pode ser trocado livremente sem afetar os produtos.
- **subtitulo** — frase abaixo do título (opcional, use `null` para omitir).
- **aviso** — caixa de aviso em destaque acima da seção (opcional). Foi pensado para casos como "conteúdo +18", mas serve para qualquer aviso. Quando presente, substitui o `subtitulo` visualmente.
- **cor** — cor de destaque em hexadecimal (opcional). Aplica um leve tingimento de fundo e colore o número da seção — sem precisar editar CSS. Use `null` para o visual padrão do site.

**A ordem dos objetos no array define a ordem das seções na página e a numeração automática (01, 02, 03...).**

### Para adicionar uma categoria nova
Inclua um novo objeto no array, em qualquer posição. A seção, o link no menu (cabeçalho e rodapé) e o carrossel/grade aparecem sozinhos.

### Para remover uma categoria
Apague o objeto correspondente. Produtos que ainda apontarem para aquele `id` deixam de aparecer no site (o console do navegador avisa sobre isso, útil para depuração).

### Para editar uma categoria
Só mudar o campo desejado (`nome`, `subtitulo`, `aviso` ou `cor`).

### Categoria sem produtos
Se uma categoria não tiver nenhum produto associado, a seção aparece normalmente com a mensagem "Novos produtos em breve nesta categoria." em vez de um carrossel vazio.

## data/produtos.json — controla os produtos

```json
{
  "id": 15,
  "nome": "Nome do baralho",
  "categoria": "novidades",
  "descricao": "Descrição curta do produto.",
  "imagem": "images/minha-imagem.webp",
  "marketplace": "Mercado Livre",
  "link": "https://link-do-anuncio.com"
}
```

O campo **categoria** deve ser exatamente igual ao **id** de alguma categoria em `categorias.json` (não o nome de exibição). Isso garante que renomear uma categoria (campo `nome`) nunca quebre os produtos já cadastrados.

## Imagens

As imagens em `images/` neste pacote são **placeholders em SVG** (artes geradas com a paleta do site) para visualizar o layout imediatamente. Troque pelas fotos reais dos produtos — de preferência em `.webp` — e atualize o campo `imagem` no JSON.

## Publicando no GitHub Pages

1. Envie todos os arquivos deste pacote para a raiz de um repositório no GitHub, mantendo a estrutura de pastas.
2. Vá em **Settings → Pages**.
3. Em "Source", selecione a branch `main` (ou `master`) e a pasta `/root`.
4. Salve. Em alguns minutos o site estará em `https://seu-usuario.github.io/nome-do-repositorio/`.

Antes de publicar, atualize:
- `<link rel="canonical">` e as meta tags `og:url`/`og:title` no `index.html` com a URL final.
- Os links de redes sociais no rodapé.
- Os links reais dos marketplaces no `produtos.json`.

## Estrutura

```
/
├── index.html
├── css/style.css
├── js/script.js
├── data/
│    categorias.json   ← categorias (nova!)
│    produtos.json     ← produtos
└── images/
```

## Funcionalidades incluídas

- Catálogo e categorias 100% dinâmicos via JSON — nenhuma edição de código necessária no dia a dia
- Pesquisa em tempo real
- Cabeçalho fixo com rolagem suave e menu gerado automaticamente
- Carrossel horizontal com swipe e "scroll snap" em celular (1 card) e tablet (2 cards)
- Grade tradicional automática em telas de desktop (≥1024px)
- Lazy loading de imagens, animações de entrada (scroll reveal), hover 3D nos cards
- Botão "voltar ao topo"
- SEO: meta description/keywords, Open Graph, Twitter Card, dados estruturados (Schema.org), favicon
