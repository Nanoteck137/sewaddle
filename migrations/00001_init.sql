-- +goose Up
CREATE TABLE series (
    id TEXT NOT NULL,
    name TEXT NOT NULL,

    cover_original TEXT,
    cover_large TEXT,
    cover_medium TEXT,
    cover_small TEXT,

    created INTEGER NOT NULL,
    updated INTEGER NOT NULL,

    CONSTRAINT series_pk PRIMARY KEY(id)
);

CREATE TABLE chapters (
    id TEXT NOT NULL,
    serie_id TEXT NOT NULL,

    title TEXT NOT NULL,
    pages TEXT NOT NULL,
    number INT,

    created INTEGER NOT NULL,
    updated INTEGER NOT NULL,

    CONSTRAINT chapters_pk PRIMARY KEY(id),

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
    chapter_id TEXT NOT NULL,

    CONSTRAINT user_chapter_marked_pk PRIMARY KEY(user_id, chapter_id),

    CONSTRAINT user_chapter_marked_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT user_chapter_marked_chapter_fk FOREIGN KEY (chapter_id)
        REFERENCES chapters(id)
);

CREATE TABLE user_bookmark(
    user_id TEXT NOT NULL,
    serie_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,

    CONSTRAINT user_bookmark_pk PRIMARY KEY(user_id, serie_id),

    CONSTRAINT user_bookmark_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT user_bookmark_serie_id FOREIGN KEY (serie_id)
        REFERENCES series(id),

    CONSTRAINT user_bookmark_chapter_fk FOREIGN KEY (chapter_id)
        REFERENCES chapters(id)
);

-- +goose Down
DROP TABLE user_bookmark;
DROP TABLE user_chapter_marked;
DROP TABLE users;
DROP TABLE chapters;
DROP TABLE series;
