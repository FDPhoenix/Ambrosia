import React, { useState, FormEvent } from "react";
import "../CSS/ChangePassword.css";
import Cookies from "js-cookie";

const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");

    const token = Cookies.get("token");

    const validatePassword = (password: string) => {
        if (/\s/.test(password)) return "Password must not contain spaces.";
        if (password.length < 6 || password.length > 16) return "Password must be 6-16 characters.";
        if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Password must contain at least one letter and one number.";
        if (!/[!@#$%^&*()_+\[\]{}|;:'\",.<>?/]/.test(password)) return "Password must contain at least one special character.";
        return null;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (oldPassword === newPassword) {
            setError("New password cannot be the same as the old password.");
            return;
        }

        if (!token) {
            setError("No token available, please log in.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage("");

        try {
            const response = await fetch("http://localhost:3000/user/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to change password.");
            }

            setMessage("Password changed successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "An error occurred while changing password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <h2 className="change-password-title">Change Password</h2>
            {error && <p className="error-message">Error: {error}</p>}
            {message && <p className="success-message">{message}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Current Password:</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? "Changing..." : "Change Password"}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
