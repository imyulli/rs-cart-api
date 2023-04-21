create type status AS ENUM ('OPEN', 'ORDERED');

create extension if not exists "uuid-ossp";

create table carts(
	id uuid not null default uuid_generate_v4() primary key,
    user_id uuid not null,
    created_at date not null,
    updated_at date not null,
    status status 
);

create table cart_items(
	cart_id uuid not null,
    product_id uuid not null,
    count int not null,
    foreign key (cart_id) references carts(id)
);


