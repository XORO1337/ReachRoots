import axios from 'axios';

const BASE_URL = '/api';

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
}

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await axios.put(`${BASE_URL}/artisan/profile`, data);
  return response.data;
};

export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await axios.put(`${BASE_URL}/artisan/profile/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
