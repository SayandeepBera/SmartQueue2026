import React from 'react'
import ProfileContext from './ProfileContext';
import { GetMyProfile, UpdateProfileDetails, UpdateUsername, UpdatePassword, UpdateAvatar, DeleteAvatar } from '../../Api/ProfileAPI';
import { useState } from 'react';

const ProfileState = (props) => {
    const [profileData, setProfileData] = useState(null);

    // Function to fetch the user's profile data
    const getMyProfile = async (userId) => {
        try {
            const result = await GetMyProfile(userId);

            if (result.success) {
                setProfileData({
                    user: result.user,
                    profile: result.profile,
                    org: result.org ?? null
                });

                return { success: true, user: result.user, profile: result.profile, org: result.org };
            }

            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: "An error occurred while fetching profile data" };
        }
    }

    // Function to update profile details
    const updateProfileDetails = async (userId, updateData) => {
        try {
            const result = await UpdateProfileDetails(userId, updateData);

            if (result.success) {
                // Update the local profile data with the new details
                setProfileData(prevData => ({
                    ...prevData,
                    profile: result.profile
                }));

                return { success: true, profile: result.profile };
            }

            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: "An error occurred while updating profile details" };
        }
    }

    // Function to update username
    const updateUsername = async (userId, newUsername) => {
        try {
            const result = await UpdateUsername(userId, newUsername);

            if (result.success) {
                // Update the local profile data with the new username
                setProfileData(prevData => ({
                    ...prevData,
                    user: result.user
                }));

                return { success: true, user: result.user };
            }

            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: "An error occurred while updating username" };
        }
    }

    // Function to update password
    const updatePassword = async (userId, currentPassword, newPassword) => {
        try {
            const result = await UpdatePassword(userId, currentPassword, newPassword);

            if (result.success) {
                return { success: true, message: result.message };
            }

            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: "An error occurred while updating password" };
        }
    }

    // Function to update avatar
    const updateAvatar = async (userId, avatarFile) => {
        try {
            const result = await UpdateAvatar(userId, avatarFile);

            if (result.success) {
                // Update the local profile data with the new avatar details
                setProfileData(prevData => ({
                    ...prevData,
                    profile: {
                        ...prevData?.profile,
                        avatar: result.avatar
                    }
                }));

                return { success: true, avatar: result.avatar };
            }

            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: "An error occurred while updating avatar" };
        }
    }

    // Function to delete avatar
    const deleteAvatar = async (userId) => {
        try {
            const result = await DeleteAvatar(userId);

            if (result.success) {
                // Update the local profile data with the new avatar details
                setProfileData(prevData => ({
                    ...prevData,
                    profile: {
                        ...prevData?.profile,
                        avatar: {
                            url: null,
                            public_id: null
                        }
                    }
                }));

                return { success: true, message: result.message };
            }

            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: "An error occurred while deleting avatar" };
        }
    }

    // Value object to be provided to consuming components
    const value = {
        profileData,
        getMyProfile,
        updateProfileDetails,
        updateUsername,
        updatePassword,
        updateAvatar,
        deleteAvatar
    }

    return (
        <ProfileContext.Provider value={value}>
            {props.children}
        </ProfileContext.Provider>
    )
}

export default ProfileState
