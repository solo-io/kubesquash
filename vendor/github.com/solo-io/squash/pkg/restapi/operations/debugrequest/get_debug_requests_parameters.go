// Code generated by go-swagger; DO NOT EDIT.

package debugrequest

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"net/http"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime/middleware"
)

// NewGetDebugRequestsParams creates a new GetDebugRequestsParams object
// with the default values initialized.
func NewGetDebugRequestsParams() GetDebugRequestsParams {
	var ()
	return GetDebugRequestsParams{}
}

// GetDebugRequestsParams contains all the bound params for the get debug requests operation
// typically these are obtained from a http.Request
//
// swagger:parameters getDebugRequests
type GetDebugRequestsParams struct {

	// HTTP Request Object
	HTTPRequest *http.Request `json:"-"`
}

// BindRequest both binds and validates a request, it assumes that complex things implement a Validatable(strfmt.Registry) error interface
// for simple values it will use straight method calls
func (o *GetDebugRequestsParams) BindRequest(r *http.Request, route *middleware.MatchedRoute) error {
	var res []error
	o.HTTPRequest = r

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}
