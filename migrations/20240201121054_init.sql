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

-- +goose Down
DROP TABLE users;
DROP TABLE chapters;
DROP TABLE series;
