-- +goose Up

ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- +goose Down

ALTER TABLE users DROP COLUMN is_admin;
