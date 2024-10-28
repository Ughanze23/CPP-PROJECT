import React from 'react'

import Form from "./LoginForm"

function Register() {
    return <Form route="/api/user/register/" method="register" />
}

export default Register