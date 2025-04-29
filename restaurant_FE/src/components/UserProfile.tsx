import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import styles from "../CSS/EditProfile.module.css";
import Cookies from 'js-cookie';
import ViewRanks from "./ViewRanks"; // Đảm bảo đường dẫn đúng
import { toast } from "react-toastify";

interface UserProfileData {
    fullname: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
    rank: string;
    createdAt: string;
}

interface EditProfileProps {
    onChangePasswordClick: () => void;
    isChangePassword?: boolean;
}

const EditProfile: React.FC<EditProfileProps> = ({ onChangePasswordClick }) => {
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isChangePassword, setIsChangePassword] = useState<boolean>(false);
    const [isViewingRank, setIsViewingRank] = useState<boolean>(false); // State mới để điều khiển chế độ ViewRanks
    const [message, setMessage] = useState<string>("");

    const [editFullname, setEditFullname] = useState<string>("");
    const [editPhoneNumber, setEditPhoneNumber] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const [fullnameError, setFullnameError] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");

    const token = Cookies.get("token");

    useEffect(() => {
        if (!token) {
            setError("No token available, please log in.");
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch("http://localhost:3000/user/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Error fetching profile data!");
                }

                const data = await response.json();
                setProfile(data.user);
                setEditFullname(data.user.fullname);
                setEditPhoneNumber(data.user.phoneNumber || "");
                setPreviewUrl(data.user.profileImage || "");
            } catch (err: any) {
                setError(err.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const validateFullname = (name: string): string => {
        const regex = /^[A-Za-zÀ-Ỹà-ỹ]+(?:\s[A-Za-zÀ-Ỹà-ỹ]+)*$/;
        if (!regex.test(name.trim())) {
            return "Full Name must be 2-16 characters, only letters & spaces, with no leading/trailing spaces.";
        }
        if (name.trim().length < 2 || name.trim().length > 16) {
            return "Full Name must be between 2 and 16 characters.";
        }
        return "";
    };

    const validatePhoneNumber = (phone: string): string => {
        const regex = /^(03|05|07|08|09)[0-9]{8}$/;
        if (!regex.test(phone)) {
            return "Phone Number must be 10 digits and start with 03x, 05x, 07x, 08x, or 09x.";
        }
        return "";
    };

    const handleFullnameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditFullname(value);
        setFullnameError(validateFullname(value));
    };

    const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditPhoneNumber(value);
        setPhoneError(validatePhoneNumber(value));
    };

    const handleEditToggle = () => setIsEditing(true);

    const handleCancelEdit = () => {
        if (profile) {
            setEditFullname(profile.fullname);
            setEditPhoneNumber(profile.phoneNumber || "");
            setPreviewUrl(profile.profileImage || "");
            setImageFile(null);
        }
        setIsEditing(false);
    };

    const handleCancelChangePassword = () => {
        setIsChangePassword(false);
    };

    const handleCancelViewRank = () => {
        setIsViewingRank(false); // Quay lại giao diện profile
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) {
            setError("No token available, please log in.");
            return;
        }

        const finalFullnameError = validateFullname(editFullname);
        const finalPhoneError = validatePhoneNumber(editPhoneNumber);
        setFullnameError(finalFullnameError);
        setPhoneError(finalPhoneError);
        if (finalFullnameError || finalPhoneError) {
            return;
        }

        setLoading(true);
        setError(null);
        setMessage("");

        try {
            let imageUrl = previewUrl;
            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);
                const uploadResponse = await fetch("http://localhost:3000/user/upload-profile-image", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
                const uploadResult = await uploadResponse.json();
                if (!uploadResponse.ok) {
                    throw new Error(uploadResult.message || "Failed to upload image.");
                }
                imageUrl = uploadResult.profileImage;
            }

            const updateResponse = await fetch("http://localhost:3000/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fullname: editFullname,
                    phoneNumber: editPhoneNumber,
                    profileImage: imageUrl,
                    rank: profile?.rank,
                }),
            });

            const updateResult = await updateResponse.json();
            if (!updateResponse.ok) {
                throw new Error(updateResult.message || "Failed to update profile.");
            }

            setProfile((prevProfile) => ({
                ...prevProfile!,
                ...updateResult.user,
            }));

            setMessage("Profile updated successfully.");
            setIsEditing(false);

            await fetchProfile();
        } catch (err: any) {
            setError(err.message || "An error occurred while updating profile.");
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        if (!token) {
            setError("No token available, please log in.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/user/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching profile data!");
            }

            const data = await response.json();
            setProfile(data.user);
            setEditFullname(data.user.fullname);
            setEditPhoneNumber(data.user.phoneNumber || "");
            setPreviewUrl(data.user.profileImage || "");
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const handleChangePasswordClick = () => {
        setIsChangePassword(true);
    };

    const handleViewRankClick = () => {
        setIsViewingRank(true);
    };

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!profile) return <div>No profile data available.</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>User Profile</h2>

            {isChangePassword ? (
                <div className="change-password-container">
                    <h2 className="change-password-title">Change Password</h2>
                    <form onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault();

                        const oldPassword = (e.currentTarget.elements.namedItem('oldPassword') as HTMLInputElement).value;
                        const newPassword = (e.currentTarget.elements.namedItem('newPassword') as HTMLInputElement).value;
                        const confirmPassword = (e.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement).value;

                        if (newPassword !== confirmPassword) {
                            setError("New password and confirm password do not match.");
                            return;
                        }

                        const passwordError = (password: string) => {
                            if (/\s/.test(password)) return "Password must not contain spaces.";
                            if (password.length < 6 || password.length > 16) return "Password must be 6-16 characters.";
                            if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Password must contain at least one letter and one number.";
                            if (!/[!@#$%^&*()_+\[\]{}|;:'\",.<>?/]/.test(password)) return "Password must contain at least one special character.";
                            return null;
                        };

                        const error = passwordError(newPassword);
                        if (error) {
                            setError(error);
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
                                toast.error(data.message || "Failed to change password.");
                                return;
                            }

                            setMessage("Password changed successfully.");
                        } catch (err: any) {
                            setError(err.message || "An error occurred while changing password.");
                        } finally {
                            setLoading(false);
                        }
                    }}>
                        {error && <p className="error-message">Error: {error}</p>}
                        {message && <p className="success-message">{message}</p>}
                        <div className="form-group">
                            <label>Current Password:</label>
                            <input type="password" name="oldPassword" required />
                        </div>
                        <div className="form-group">
                            <label>New Password:</label>
                            <input type="password" name="newPassword" required />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password:</label>
                            <input type="password" name="confirmPassword" required />
                        </div>
                        <div className="button-group">
                            <button type="submit" disabled={loading} className="submit-btn">
                                {loading ? "Changing..." : "Change Password"}
                            </button>
                            <button type="button" className="cancel-btn" onClick={handleCancelChangePassword}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>
                            Upload Profile Image:
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                        </label>
                        {previewUrl && <img src={previewUrl} alt="Preview" className={styles.previewImage} />}
                    </div>
                    <div className={styles.inputGroup}>
                        <label>
                            Full Name:
                            <input type="text" value={editFullname} onChange={handleFullnameChange} required />
                        </label>
                        {fullnameError && <p className={styles.error}>{fullnameError}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                        <label>
                            Phone Number:
                            <input type="text" value={editPhoneNumber} onChange={handlePhoneNumberChange} required />
                        </label>
                        {phoneError && <p className={styles.error}>{phoneError}</p>}
                    </div>
                    <button type="submit" className={styles.saveButton}>Save Changes</button>
                    <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>Cancel</button>
                </form>
            ) : isViewingRank ? (
                <div className={styles.rankDetailsContainer}>
                    <button onClick={handleCancelViewRank} className={styles.cancelButton}>Back</button>
                    <ViewRanks />
                </div>
            ) : (
                <>
                    <div className={styles.profileDetails}>
                        {profile.profileImage && <img src={profile.profileImage} alt="Profile" className={styles.profileImage} />}
                        <div className={styles.profileDetails2}>
                            <p><strong>Full Name:</strong> {profile.fullname}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p>
                                <strong>Rank:</strong>{" "}
                                <span
                                    onClick={handleViewRankClick}
                                    style={{ cursor: "pointer", color: "#8d6b4e", textDecoration: "underline" }}
                                >
                                    {profile.rank || "No rank available"}
                                </span>
                            </p>
                            <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
                            <p><strong>Created At:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className={styles.editButtonContainer}>
                        <button onClick={handleEditToggle} className={styles.editButton}>Edit Profile</button>
                        <button onClick={handleChangePasswordClick} className={styles.changePassLink}>Change Password</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EditProfile;