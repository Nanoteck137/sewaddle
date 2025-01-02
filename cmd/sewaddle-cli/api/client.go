// DO NOT EDIT THIS: This file was generated by the Pyrin Golang Generator
package api

func (c *Client) GetSeries(options Options) (*GetSeries, error) {
	path := "/api/v1/series"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "GET",
		Token: c.token,
		Body: nil,
	}
	return Request[GetSeries](data)
}

func (c *Client) GetSerieById(id string, options Options) (*GetSerieById, error) {
	path := Sprintf("/api/v1/series/%v", id)
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "GET",
		Token: c.token,
		Body: nil,
	}
	return Request[GetSerieById](data)
}

func (c *Client) GetSerieChapters(id string, options Options) (*GetSerieChapters, error) {
	path := Sprintf("/api/v1/series/%v/chapters", id)
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "GET",
		Token: c.token,
		Body: nil,
	}
	return Request[GetSerieChapters](data)
}

func (c *Client) GetChapters(options Options) (*GetChapters, error) {
	path := "/api/v1/chapters"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "GET",
		Token: c.token,
		Body: nil,
	}
	return Request[GetChapters](data)
}

func (c *Client) GetChapterById(id string, options Options) (*GetChapterById, error) {
	path := Sprintf("/api/v1/chapters/%v", id)
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "GET",
		Token: c.token,
		Body: nil,
	}
	return Request[GetChapterById](data)
}

func (c *Client) MarkChapters(body PostUserMarkChaptersBody, options Options) (*any, error) {
	path := "/api/v1/user/markChapters"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "POST",
		Token: c.token,
		Body: body,
	}
	return Request[any](data)
}

func (c *Client) UnmarkChapters(body PostUserUnmarkChaptersBody, options Options) (*any, error) {
	path := "/api/v1/user/unmarkChapters"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "POST",
		Token: c.token,
		Body: body,
	}
	return Request[any](data)
}

func (c *Client) UpdateBookmark(body PostUserUpdateBookmarkBody, options Options) (*any, error) {
	path := "/api/v1/user/updateBookmark"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "POST",
		Token: c.token,
		Body: body,
	}
	return Request[any](data)
}

func (c *Client) GetSystemInfo(options Options) (*GetSystemInfo, error) {
	path := "/api/v1/system/info"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "GET",
		Token: c.token,
		Body: nil,
	}
	return Request[GetSystemInfo](data)
}

func (c *Client) Signup(body SignupBody, options Options) (*Signup, error) {
	path := "/api/v1/auth/signup"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "POST",
		Token: c.token,
		Body: body,
	}
	return Request[Signup](data)
}

func (c *Client) Signin(body SigninBody, options Options) (*Signin, error) {
	path := "/api/v1/auth/signin"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "POST",
		Token: c.token,
		Body: body,
	}
	return Request[Signin](data)
}

func (c *Client) ChangePassword(body ChangePasswordBody, options Options) (*any, error) {
	path := "/api/v1/auth/password"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "PATCH",
		Token: c.token,
		Body: body,
	}
	return Request[any](data)
}

func (c *Client) GetMe(options Options) (*GetMe, error) {
	path := "/api/v1/auth/me"
	url, err := createUrl(c.addr, path, options.QueryParams)
	if err != nil {
		return nil, err
	}

	data := RequestData{
		Url: url,
		Method: "GET",
		Token: c.token,
		Body: nil,
	}
	return Request[GetMe](data)
}