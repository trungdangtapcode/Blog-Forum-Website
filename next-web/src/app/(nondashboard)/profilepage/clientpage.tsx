// app/profile/ProfilePageClient.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PencilIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { SSR_request } from './SSR_request';
import { motion } from 'framer-motion';

interface AccountProfile {
  avatar: string;
  email: string;
  fullName: string;
  bio: string;
  age: number;
  location: string;
  occupation: string;
  credit: number;
  _id: string;
}

interface ProfilePageClientProps {
  initialProfile: AccountProfile;
}

async function updateProfile(profile: AccountProfile) {
  await SSR_request(profile);
}

const ProfilePageClient = ({ initialProfile }: ProfilePageClientProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<AccountProfile>(initialProfile);
  const [tempProfile, setTempProfile] = useState<AccountProfile>({ ...initialProfile });

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        await updateProfile(tempProfile);
        setProfile({ ...tempProfile });
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <motion.div 
		initial={{opacity: 0, y: 20}}
		animate={{opacity: 1, y: 0}}
		transition={{duration: 0.5}}
		className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <PencilIcon className="h-5 w-5 mr-1" />
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleEditToggle}
                  className="flex items-center text-green-600 hover:text-green-800 cursor-pointer"
                >
                  <CheckIcon className="h-5 w-5 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center text-red-600 hover:text-red-800 cursor-pointer"
                >
                  <XCircleIcon className="h-5 w-5 mr-1" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Image
              src={tempProfile.avatar}
              alt="Avatar"
              width={120}
              height={120}
              className="rounded-full object-cover aspect-square"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer">
                <PencilIcon className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>

          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={tempProfile.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={tempProfile.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md border-gray-300 p-2 ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={tempProfile.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md border-gray-300 p-2 ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={tempProfile.age}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md border-gray-300 p-2 ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={tempProfile.location}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md border-gray-300 p-2 ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={tempProfile.occupation}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-md border-gray-300 p-2 ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePageClient;