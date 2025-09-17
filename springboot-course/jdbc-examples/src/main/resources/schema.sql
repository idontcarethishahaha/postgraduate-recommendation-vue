create table if not exists `user`
(
    id          char(19) not null primary key,
    name        varchar(45),
    create_time datetime not null default current_timestamp,
    update_time datetime not null default current_timestamp on update current_timestamp
);

create table if not exists `address`
(
    id          char(19) not null primary key,
    detail      varchar(45),
    user_id     char(19),
    create_time datetime not null default current_timestamp,
    update_time datetime not null default current_timestamp on update current_timestamp,

    index (user_id)
);