# Sabores da Ilha

Guia Gastronômico de São Luís · Desenvolvimento de Sistemas Web · UFMA · 2026.2.

[Aplicativo online](https://joaogabrielol.github.io/guia-gastronomico-sao-luis/) · [Repositório](https://github.com/JoaoGabrielol/guia-gastronomico-sao-luis)

Aplicação acadêmica em **HTML, CSS e JavaScript, sem frameworks**, com API REST do Supabase (PostgreSQL e Auth). A proposta citava React/Next.js; a implementação usa JavaScript puro para atender ao requisito explícito da Etapa 2.

![Página inicial](docs/desktop.png)

## Funcionalidades

- Busca por nome, sem diferenciar acentos, e filtro por categoria.
- Detalhes com descrição, endereço, horário e faixa de preço.
- Cadastro por e-mail/senha, confirmação por e-mail e login.
- Avaliações públicas com nota de 1 a 5 e comentário de 3 a 500 caracteres.
- Uma avaliação por usuário/lugar; edição e exclusão apenas pelo autor.
- Layout responsivo, labels, diálogos, mensagens de erro e busca vazia.
- Plano B: catálogo local em data.js quando a API não responde.

**O catálogo tem seis estabelecimentos fictícios, incluindo endereços e horários.** Não é uma indicação de visita real. As avaliações são criadas pelos usuários; não há notas inventadas. O aplicativo não realiza reservas, pedidos ou pagamentos. O administrador gerencia os lugares pelo painel Supabase, sem painel administrativo dentro do aplicativo.

## Rodar localmente

1. Copie `config.example.js` para `config.js`.
2. Preencha `url` e `key` com a URL do projeto e sua chave **publishable**. Nunca use `service_role` ou uma chave secreta.
3. Em um projeto Supabase novo, execute `schema.sql` uma única vez no SQL Editor. O banco desta entrega já foi configurado.
4. Na pasta do aplicativo, execute:

```sh
python -m http.server 8000
```

No Windows também pode usar `py -m http.server 8000`, ou Live Server no VS Code. Abra http://localhost:8000. Não abra pelo protocolo file://.

Sem configuração, o catálogo local funciona em modo de demonstração. Login e publicação de avaliações exigem o serviço online; não são simulados offline.

## Estrutura e funcionamento

| Arquivo | Responsabilidade |
| --- | --- |
| index.html | Estrutura semântica, formulários e diálogos |
| styles.css | Identidade visual e responsividade |
| app.js | Eventos, DOM, fetch, autenticação e avaliações |
| data.js | Catálogo fictício do plano B |
| schema.sql | Tabelas, validações, RLS e catálogo inicial |
| config.example.js | Modelo de configuração sem chave |
| docs/ | Capturas, verificação e roteiro de apresentação |

## Evidência da aba Rede

**Pendência antes da entrega:** anexar a captura real da aba Rede em `docs/rede.png` e inserir a imagem aqui. A captura da página inicial não substitui esse requisito.

Abra F12 → Rede/Network, recarregue a página e selecione `places?select=*&order=id.asc`. Em Cabeçalhos/Headers, capture **Request URL**, **Request Method: GET** e **Status Code: 200**. Não capture senhas ou tokens de login.

A requisição GET consulta a API REST externa do Supabase para obter o catálogo. O status 200 indica sucesso; a resposta JSON é transformada em cartões pelo JavaScript. As operações de login e avaliação são feitas por outras requisições.

## Verificação

Testados no navegador: catálogo online, busca sem acento, filtro, estado sem resultado, detalhes, formulários e layout móvel em 390 px. A API passou por testes de leitura pública, bloqueio anônimo, login, criação de avaliação, duplicata, nota inválida, edição, proteção do catálogo, exclusão e logout. A conta técnica utilizada é descartável e não faz parte da entrega. O recebimento de confirmação de cadastro exige e-mail real e não foi comprovado pelo teste técnico.

## Uso de IA

Foi utilizado ChatGPT/Codex para interpretar a atividade e a proposta, ajudar ao longe da implementação, e auxiliar revisando o código. 
