import React from 'react'

import Form from "./Forms/LoginForm"

function Login() {
    return <Form route="/api/token/" method="login" />
}

export default Login