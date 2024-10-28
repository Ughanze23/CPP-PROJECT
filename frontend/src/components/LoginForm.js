import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import { Snackbar, Alert } from "@mui/material";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                setSnackbarMessage("Login successful");
                setSnackbarSeverity("success");
                navigate("/");
            } else {
                setSnackbarMessage("Registration successful");
                setSnackbarSeverity("success");
                navigate("/login");
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setSnackbarMessage("Invalid login credentials. Please try again.");
            } else if (error.response && error.response.status === 400) {
                setSnackbarMessage("User already exists or invalid data. Please check and try again.");
            } else {
                setSnackbarMessage("An error occurred. Please try again.");
            }
            setSnackbarSeverity("error");
        } finally {
            setSnackbarOpen(true);
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
            {/* show link based on method */}
            {method === "login" ? (
                <p>
                    New User? <Link to="/register">Register Here..</Link>
                </p>
            ) : (
                <p>
                    Already have an account? <Link to="/login">Login Here..</Link>
                </p>
            )}

            {/* Snackbar for Alerts */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </form>
    );
}

export default Form;
