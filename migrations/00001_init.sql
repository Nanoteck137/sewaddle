-- NOTE(patrik): FINAL

-- +goose Up
CREATE TABLE series (
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT NOT NULL,
    path TEXT NOT NULL,

    CONSTRAINT series_pk PRIMARY KEY(slug)
);

CREATE TABLE chapters (
    serie_slug TEXT NOT NULL,
    slug TEXT NOT NULL,
    number INTEGER NOT NULL,

    title TEXT NOT NULL,
    pages TEXT NOT NULL,

    path TEXT NOT NULL,

    CONSTRAINT chapters_pk PRIMARY KEY(slug, serie_slug),

    CONSTRAINT chapters_serie_slug_fk FOREIGN KEY (serie_slug)
        REFERENCES series(slug)
);

CREATE TABLE users (
    id TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,

    CONSTRAINT users_pk PRIMARY KEY(id)
);

CREATE TABLE user_chapter_marked(
    user_id TEXT NOT NULL,
    serie_slug TEXT NOT NULL,
    chapter_slug INTEGER NOT NULL,

    CONSTRAINT user_chapter_marked_pk PRIMARY KEY(user_id, serie_slug, chapter_slug),

    CONSTRAINT user_chapter_marked_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT user_chapter_marked_serie_slug_fk FOREIGN KEY (serie_slug)
        REFERENCES series(slug),

    CONSTRAINT user_chapter_marked_chapter_fk FOREIGN KEY (serie_slug, chapter_slug)
        REFERENCES chapters(serie_slug, slug)
);

CREATE TABLE user_bookmark(
    user_id TEXT NOT NULL,
    serie_slug TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    page INTEGER NOT NULL,

    CONSTRAINT user_bookmark_pk PRIMARY KEY(user_id, serie_slug),

    CONSTRAINT user_bookmark_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT user_bookmark_serie_slug_fk FOREIGN KEY (serie_slug)
        REFERENCES series(slug),

    CONSTRAINT user_bookmark_chapter_fk FOREIGN KEY (serie_slug, chapter_slug)
        REFERENCES chapters(serie_slug, slug)
);

-- +goose Down
DROP TABLE user_bookmark;
DROP TABLE user_chapter_marked;
DROP TABLE users;
DROP TABLE chapters;
DROP TABLE series;
