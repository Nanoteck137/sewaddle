-- +goose Up
CREATE TABLE series (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "seriesPk" PRIMARY KEY("id")
);

CREATE TABLE chapters (
    "id" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    "serieId" TEXT NOT NULL,

    "path" TEXT NOT NULL,

    "pages" TEXT NOT NULL,

    CONSTRAINT "chaptersPk" PRIMARY KEY("id"),

    CONSTRAINT "chaptersSerieId" FOREIGN KEY ("serieId")
        REFERENCES series("id")
);

CREATE TABLE users (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "usersPk" PRIMARY KEY("id")
);

CREATE TABLE user_chapter_marked(
    user_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,

    CONSTRAINT user_chapter_marked_pk PRIMARY KEY(user_id, chapter_id),

    CONSTRAINT user_chapter_marked_user_id FOREIGN KEY (user_id)
        REFERENCES users("id"),

    CONSTRAINT user_chapter_marked_chapter_id FOREIGN KEY (chapter_id)
        REFERENCES chapters("id")
);

CREATE TABLE user_bookmark(
    user_id TEXT NOT NULL,
    serie_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,

    CONSTRAINT user_bookmark_pk PRIMARY KEY(user_id, serie_id)
);

-- +goose Down
DROP TABLE user_bookmark;
DROP TABLE user_chapter_marked;
DROP TABLE users;
DROP TABLE chapters;
DROP TABLE series;
