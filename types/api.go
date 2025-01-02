package types

const (
	RoleSuperUser = "super_user"
	RoleAdmin     = "admin"
)

type Images struct {
	Small    string `json:"small"`
	Medium   string `json:"medium"`
	Large    string `json:"large"`
}
