create table ingredients
(
    id     int auto_increment
        primary key,
    title  varchar(100) null,
    qt     int          null,
    mesure varchar(2)   null,
    `desc` varchar(250) null
);

create table users
(
    id              int auto_increment
        primary key,
    name            varchar(255) null,
    email           varchar(255) null,
    hashed_password char(60)     null,
    created         datetime     null,
    active          tinyint      null
);

create table groupes
(
    id      int auto_increment
        primary key,
    name    varchar(100) null,
    created datetime     null,
    usr     int          null,
    constraint groupes_users_id_fk
        foreign key (usr) references users (id)
            on update cascade on delete cascade
);

create table recipes
(
    id          int auto_increment
        primary key,
    title       varchar(100) not null,
    descri      varchar(250) null,
    obs         varchar(250) null,
    categorie   varchar(25)  null,
    preparation int          null,
    typ         varchar(25)  null,
    cuisson     int          null,
    repos       int          null,
    lvl         varchar(25)  null,
    nbr_pers    int          null,
    cout        float        null,
    usr         int          null,
    share       varchar(25)  null,
    constraint recipes_users_id_fk
        foreign key (usr) references users (id)
            on update cascade on delete cascade
);

create table events
(
    id     int auto_increment
        primary key,
    date   date         null,
    `desc` varchar(250) null,
    recipe int          null,
    constraint events_recipes_id_fk
        foreign key (recipe) references recipes (id)
            on update cascade on delete cascade
);

create table images
(
    id     int auto_increment
        primary key,
    src    blob        null,
    typ    varchar(10) null,
    size   int         null,
    recipe int         null,
    constraint images_recipes_id_fk
        foreign key (recipe) references recipes (id)
            on update cascade on delete cascade
);

create table recipes_ingredients
(
    recipe_id     int not null,
    ingredient_id int not null,
    primary key (recipe_id, ingredient_id),
    constraint recipes_ingredients_ingredients_id_fk
        foreign key (ingredient_id) references ingredients (id)
            on update cascade on delete cascade,
    constraint recipes_ingredients_recipes_id_fk
        foreign key (recipe_id) references recipes (id)
            on update cascade on delete cascade
);

create table urls
(
    id     int auto_increment
        primary key,
    url    varchar(300) null,
    recipe int          null,
    constraint urls_recipes_id_fk
        foreign key (recipe) references recipes (id)
            on update cascade on delete cascade
);

create table users_groupes
(
    groupe_id int not null,
    user_id   int not null,
    primary key (user_id, groupe_id),
    constraint users_groupes_groupes_id_fk
        foreign key (groupe_id) references groupes (id)
            on update cascade on delete cascade,
    constraint users_groupes_users_id_fk
        foreign key (user_id) references users (id)
            on update cascade on delete cascade
);

