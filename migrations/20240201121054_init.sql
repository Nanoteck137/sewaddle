-- +goose Up
CREATE TABLE series (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT NOT NULL,
    path TEXT NOT NULL,

    CONSTRAINT series_pk PRIMARY KEY(id)
);

CREATE TABLE chapters (
    serie_id TEXT NOT NULL,
    number INTEGER NOT NULL,

    title TEXT NOT NULL,
    pages TEXT NOT NULL,

    path TEXT NOT NULL,

    CONSTRAINT chapters_pk PRIMARY KEY(serie_id, number),

    CONSTRAINT chapters_serie_id_fk FOREIGN KEY (serie_id)
        REFERENCES series(id)
);

CREATE TABLE users (
    id TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,

    CONSTRAINT users_pk PRIMARY KEY(id)
);

CREATE TABLE user_chapter_marked(
    user_id TEXT NOT NULL,
    serie_id TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,

    CONSTRAINT user_chapter_marked_pk PRIMARY KEY(user_id, serie_id, chapter_number),

    CONSTRAINT user_chapter_marked_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT user_chapter_marked_serie_id_fk FOREIGN KEY (serie_id)
        REFERENCES series(id),

    CONSTRAINT user_chapter_marked_chapter_fk FOREIGN KEY (serie_id, chapter_number)
        REFERENCES chapters(serie_id, number)
);

CREATE TABLE user_bookmark(
    user_id TEXT NOT NULL,
    serie_id TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    page INTEGER NOT NULL,

    CONSTRAINT user_bookmark_pk PRIMARY KEY(user_id, serie_id),

    CONSTRAINT user_bookmark_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT user_bookmark_serie_id_fk FOREIGN KEY (serie_id)
        REFERENCES series(id),

    CONSTRAINT user_bookmark_chapter_fk FOREIGN KEY (serie_id, chapter_number)
        REFERENCES chapters(serie_id, number)
);

-- +goose Down
DROP TABLE user_bookmark;
DROP TABLE user_chapter_marked;
DROP TABLE users;
DROP TABLE chapters;
DROP TABLE series;
