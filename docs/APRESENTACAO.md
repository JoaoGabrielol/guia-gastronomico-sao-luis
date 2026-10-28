# Roteiro de apresentação

1. Explique o objetivo: descobrir estabelecimentos e compartilhar experiências em São Luís. O catálogo é fictício para demonstração acadêmica.
2. Busque "cafe": aparecem as duas cafeterias mesmo sem acento. Limpe e filtre Cafeteria.
3. Faça uma busca vazia e outra com nome inexistente. Mostre as mensagens.
4. Abra Café dos Azulejos e mostre descrição, endereço, horário, preço e avaliações.
5. Crie uma conta com e-mail real, confirme o e-mail e entre. Publique nota 5 e um comentário. Publique novamente: a avaliação é editada, não duplicada. Exclua sua avaliação.
6. Na aba Rede, mostre GET, URL da API e status 200. Explique que o navegador recebe JSON e cria elementos com textContent.
7. Explique RLS: esconder botões não basta; o banco compara auth.uid() e user_id. UNIQUE impede duplicatas.
8. Mostre README, histórico de commits e declaração de uso de IA.

## Perguntas prováveis

- Por que não usou React? A atividade exige HTML/CSS/JavaScript sem frameworks; a tecnologia da proposta foi ajustada.
- Onde estão os dados? PostgreSQL no Supabase. data.js contém apenas o plano B.
- Como funciona a busca? fetch carrega o catálogo e o JavaScript filtra nome e categoria; normalize remove acentos.
- Como evita XSS? textContent exibe o texto sem interpretá-lo como HTML.
- Quem pode cadastrar lugares? O administrador pelo painel Supabase. Usuários comuns não têm permissão de escrita nessa tabela.
- E sem internet? O catálogo local aparece; login e avaliações exigem conexão.

## Modelo de e-mail (não enviado automaticamente)

Assunto: ATV19/10 DSW Etapa 2 - João Gabriel de Oliveira Lopes - 2020002740

Professor, boa noite.

Segue o repositório do aplicativo Guia Gastronômico de São Luís (Sabores da Ilha), referente à Etapa 2:

https://github.com/JoaoGabrielol/guia-gastronomico-sao-luis

A implementação utiliza HTML, CSS e JavaScript sem frameworks, com Supabase para dados e autenticação. O README documenta o funcionamento, como executar e o uso de IA.

Atenciosamente,
João Gabriel de Oliveira Lopes
Matrícula 2020002740
