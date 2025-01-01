package types

const (
	RoleSuperUser = "super_user"
	RoleAdmin = "admin"
)

type Images struct {
	Original string `json:"original"`
	Small    string `json:"small"`
	Medium   string `json:"medium"`
	Large    string `json:"large"`
}
