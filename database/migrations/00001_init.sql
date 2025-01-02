-- +goose Up
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL COLLATE NOCASE CHECK(username<>'') UNIQUE,
    password TEXT NOT NULL CHECK(password<>''),
    role TEXT NOT NULL,

    created INTEGER NOT NULL,
    updated INTEGER NOT NULL
);

CREATE TABLE users_settings (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT,

    quick_playlist TEXT REFERENCES playlists(id) ON DELETE SET NULL
);

CREATE TABLE api_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name TEXT NOT NULL CHECK(name<>''),

    created INTEGER NOT NULL,
    updated INTEGER NOT NULL
);

CREATE TABLE series (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK(name<>''),

    cover_art TEXT,

    mal_id TEXT,
    anilist_id TEXT,

    created INTEGER NOT NULL,
    updated INTEGER NOT NULL
);

CREATE TABLE chapters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK(name<>''),

    serie_id TEXT NOT NULL REFERENCES series(id),

    pages TEXT NOT NULL,
    number INTEGER NOT NULL,
    cover_art TEXT,

    created INTEGER NOT NULL,
    updated INTEGER NOT NULL
);

CREATE TABLE user_chapter_marked(
    user_id TEXT REFERENCES users(id),
    chapter_id TEXT REFERENCES chapters(id),

    PRIMARY KEY(user_id, chapter_id)
);

CREATE TABLE user_bookmark(
    user_id TEXT REFERENCES users(id),
    serie_id TEXT REFERENCES series(id),
    chapter_id TEXT REFERENCES chapters(id),

    PRIMARY KEY(user_id, serie_id)
);

-- +goose Down

DROP TABLE user_bookmark;
DROP TABLE user_chapter_marked;

DROP TABLE chapters;
DROP TABLE series;

DROP TABLE api_tokens;

DROP TABLE users_settings;
DROP TABLE users;
