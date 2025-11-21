import axios from 'axios';

const PROFILE_BASE = '/api/artisan-dashboard/profile';

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await axios.put(PROFILE_BASE, data);
  return response.data?.data?.user;
};

export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await axios.put(`${PROFILE_BASE}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data?.user;
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await axios.post('/api/auth/change-password', payload);
  return response.data;
};
