package database

import (
	"context"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	"github.com/nanoteck137/sewaddle/utils"
)

type User struct {
	Id       string
	Username string
	Password string
	IsAdmin  bool
}

func (db *Database) CreateUser(ctx context.Context, username, password string) (User, error) {
	ds := dialect.
		Insert("users").
		Rows(goqu.Record{
			"id":       utils.CreateId(),
			"username": username,
			"password": password,
		}).
		Returning("id", "username", "password", "is_admin")

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return User{}, err
	}

	var item User
	err = row.Scan(&item.Id, &item.Username, &item.Password, &item.IsAdmin)
	if err != nil {
		return User{}, err
	}

	return item, nil
}

func (db *Database) GetUserById(ctx context.Context, id string) (User, error) {
	ds := dialect.
		From("users").
		Select("id", "username", "password", "is_admin").
		Where(goqu.C("id").Eq(id))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return User{}, err
	}

	var item User
	err = row.Scan(&item.Id, &item.Username, &item.Password, &item.IsAdmin)
	if err != nil {
		return User{}, err
	}

	return item, nil
}

func (db *Database) GetUserByUsername(ctx context.Context, username string) (User, error) {
	ds := dialect.
		From("users").
		Select("id", "username", "password", "is_admin").
		Where(goqu.C("username").Eq(username))
		// TODO(patrik): Prepared

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return User{}, err
	}

	var item User
	err = row.Scan(&item.Id, &item.Username, &item.Password, &item.IsAdmin)
	if err != nil {
		return User{}, err
	}

	return item, nil
}

func (db *Database) SetUserAdmin(ctx context.Context, id string, isAdmin bool) error {
	ds := dialect.
		Update("users").
		Set(goqu.Record{
			"is_admin": isAdmin,
		}).
		Where(goqu.C("id").Eq(id)).
		Prepared(true)

	res, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	fmt.Printf("res: %v\n", res)

	return nil
}
