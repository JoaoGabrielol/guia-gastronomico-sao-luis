create table public.places (id bigint primary key, name text not null, category text not null check (category in ('Restaurante','Cafeteria','Bar','Sorveteria')), neighborhood text not null, description text not null, address text not null, hours text not null, price text not null);
create table public.reviews (id uuid primary key default gen_random_uuid(), place_id bigint not null references public.places(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, author_name text not null check (char_length(btrim(author_name)) between 1 and 50), rating integer not null check (rating between 1 and 5), comment text not null check (char_length(btrim(comment)) between 3 and 500), created_at timestamptz not null default now(), unique(place_id,user_id));
create index reviews_user_id_idx on public.reviews(user_id);
alter table public.places enable row level security;
alter table public.reviews enable row level security;
revoke all on public.places, public.reviews from anon, authenticated;
grant select on public.places, public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
create policy places_read on public.places for select to anon, authenticated using (true);
create policy reviews_read on public.reviews for select to anon, authenticated using (true);
create policy reviews_insert on public.reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy reviews_update on public.reviews for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy reviews_delete on public.reviews for delete to authenticated using ((select auth.uid()) = user_id);
-- Estabelecimentos são geridos exclusivamente pelo administrador no painel Supabase.
insert into public.places (id,name,category,neighborhood,description,address,hours,price) values
(1,'Café dos Azulejos','Cafeteria','Centro Histórico','Café coado, bolos caseiros e uma pausa entre os azulejos da cidade.','Rua dos Azulejos, 10 · Centro Histórico','Terça a domingo · 9h às 18h','R$ 20–40'),
(2,'Quintal da Ilha','Restaurante','Renascença','Sabores maranhenses e receitas de família para um almoço sem pressa.','Rua do Quintal, 25 · Renascença','Terça a domingo · 11h às 15h','R$ 40–70'),
(3,'Varanda do Mar','Bar','Calhau','Petiscos para compartilhar e conversa boa com clima de fim de tarde.','Avenida da Varanda, 80 · Calhau','Quarta a domingo · 17h às 23h','R$ 35–65'),
(4,'Doce Juçara','Sorveteria','Cohama','Sorvetes artesanais inspirados nos frutos e nas cores do Maranhão.','Rua dos Frutos, 12 · Cohama','Todos os dias · 13h às 21h','R$ 12–25'),
(5,'Casa do Cuxá','Restaurante','São Francisco','Arroz de cuxá e comida de afeto em um ambiente acolhedor.','Rua da Casa, 42 · São Francisco','Segunda a sábado · 11h às 16h','R$ 30–55'),
(6,'Café da Praça','Cafeteria','Vinhais','Pães, cafés e pequenos encontros para começar bem o dia.','Rua da Praça, 7 · Vinhais','Segunda a sábado · 7h às 19h','R$ 15–35');
