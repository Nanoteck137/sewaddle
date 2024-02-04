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

    CONSTRAINT "chaptersPk" PRIMARY KEY("id"),

    CONSTRAINT "chaptersSerieId" FOREIGN KEY ("serieId")
        REFERENCES series("id")
);

CREATE TABLE pages (
    "page" INTEGER NOT NULL,
    "chapterId" TEXT NOT NULL,

    CONSTRAINT "pagesPk" PRIMARY KEY("page", "chapterId"),

    CONSTRAINT "pagesChapterIdFk" FOREIGN KEY ("chapterId")
        REFERENCES chapters("id")
);

-- +goose Down
DROP TABLE pages;
DROP TABLE chapters;
DROP TABLE series;
