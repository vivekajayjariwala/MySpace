import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config/config';
import { INTEREST_OPTIONS, ACTIVITY_OPTIONS, LOOKING_FOR_OPTIONS, AVAILABILITY_OPTIONS } from '../constants/profileOptions';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [interests, setInterests] = useState(user?.interests || []);
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [lookingFor, setLookingFor] = useState(user?.lookingFor || '');
    const [favoriteActivities, setFavoriteActivities] = useState(user?.favoriteActivities || []);
    const [availability, setAvailability] = useState(user?.availability || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(user?.profilePicture || '');
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentFriendRequests, setSentFriendRequests] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setBio(user.bio || '');
            setInterests(user.interests || []);
            setProfilePicture(user.profilePicture || '');
            setLookingFor(user.lookingFor || '');
            setFavoriteActivities(user.favoriteActivities || []);
            setAvailability(user.availability || '');
            setImagePreview(user.profilePicture || '');
        }
    }, [user]);

    const fetchFriendsAndRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/${user._id}`;
            const { data } = await axios.get(url, {
                headers: { 'x-auth-token': token }
            });
            setFriends(data.friends || []);
            setFriendRequests(data.friendRequests || []);
            setSentFriendRequests(data.sentFriendRequests || []);
        } catch (err) {
            console.error('Error fetching friends:', err);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchFriendsAndRequests();
        }
    }, [user, fetchFriendsAndRequests]);

    const handleAcceptFriend = async (friendId) => {
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/accept-friend/${friendId}`;
            await axios.post(url, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchFriendsAndRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept friend request');
        }
    };

    const handleInterestToggle = (interest) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else if (interests.length < 3) {
            setInterests([...interests, interest]);
        }
    };

    const handleActivityToggle = (activity) => {
        if (favoriteActivities.includes(activity)) {
            setFavoriteActivities(favoriteActivities.filter(a => a !== activity));
        } else {
            setFavoriteActivities([...favoriteActivities, activity]);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/profile`;
            await axios.put(url, {
                firstName,
                lastName,
                bio,
                interests,
                profilePicture,
                lookingFor,
                favoriteActivities,
                availability
            }, {
                headers: { 'x-auth-token': token }
            });

            setMessage('Profile updated successfully');

            // Update user context with new data
            updateUser({
                firstName,
                lastName,
                bio,
                interests,
                profilePicture,
                lookingFor,
                favoriteActivities,
                availability
            });
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    if (!user) return <div className="p-8 text-center">Please log in to view this page.</div>;

    return (
        <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <div className="px-8 py-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700 ring-4 ring-white shadow-md overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.email[0].toUpperCase()
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                                <p className="text-gray-500 mt-1">Manage your account and connections</p>
                            </div>
                        </div>

                        <Tab.Group>
                            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
                                {['Settings', 'Friends', 'Requests Received', 'Requests Sent'].map((category) => (
                                    <Tab
                                        key={category}
                                        className={({ selected }) =>
                                            classNames(
                                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2',
                                                selected
                                                    ? 'bg-white text-green-700 shadow'
                                                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-green-800'
                                            )
                                        }
                                    >
                                        {category}
                                        {category === 'Requests Received' && friendRequests.length > 0 && (
                                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                                {friendRequests.length}
                                            </span>
                                        )}
                                    </Tab>
                                ))}
                            </Tab.List>
                            <Tab.Panels>
                                {/* Settings Panel */}
                                <Tab.Panel>
                                    <div className="space-y-8">
                                        <div className="flex justify-end">
                                            {!isEditing ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(true)}
                                                    className="rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
                                                >
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            // Reset fields to original user data
                                                            if (user) {
                                                                setFirstName(user.firstName || '');
                                                                setLastName(user.lastName || '');
                                                                setBio(user.bio || '');
                                                                setInterests(user.interests || []);
                                                                setLookingFor(user.lookingFor || '');
                                                                setFavoriteActivities(user.favoriteActivities || []);
                                                                setAvailability(user.availability || '');
                                                            }
                                                        }}
                                                        className="rounded-full bg-gray-100 px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleSubmit}
                                                        className="rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-8">
                                            {/* Basic Info */}
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                                                        First Name
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            id="firstName"
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                            className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-700 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">{firstName}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                                                        Last Name
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            id="lastName"
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                            className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-700 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">{lastName}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bio */}
                                            <div>
                                                <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Bio
                                                </label>
                                                {isEditing ? (
                                                    <>
                                                        <textarea
                                                            id="bio"
                                                            rows={4}
                                                            maxLength={500}
                                                            value={bio}
                                                            onChange={(e) => setBio(e.target.value)}
                                                            className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
                                                            placeholder="Tell us about yourself..."
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
                                                    </>
                                                ) : (
                                                    <p className="text-gray-700 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[100px] whitespace-pre-wrap">{bio || 'No bio provided.'}</p>
                                                )}
                                            </div>

                                            {/* Interests */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                    Top 3 Interests ({interests.length}/3)
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {isEditing ? (
                                                        INTEREST_OPTIONS.map((interest) => (
                                                            <button
                                                                key={interest}
                                                                type="button"
                                                                onClick={() => handleInterestToggle(interest)}
                                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${interests.includes(interest)
                                                                    ? 'bg-green-600 text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    } ${interests.length >= 3 && !interests.includes(interest) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                disabled={interests.length >= 3 && !interests.includes(interest)}
                                                            >
                                                                {interest}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        interests.length > 0 ? (
                                                            interests.map((interest) => (
                                                                <span key={interest} className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                                    {interest}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-500 italic">No interests selected.</span>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Looking For */}
                                            <div>
                                                <label htmlFor="lookingFor" className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Looking For
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        id="lookingFor"
                                                        value={lookingFor}
                                                        onChange={(e) => setLookingFor(e.target.value)}
                                                        className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
                                                    >
                                                        <option value="">Select...</option>
                                                        {LOOKING_FOR_OPTIONS.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="text-gray-700 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">{lookingFor || 'Not specified'}</p>
                                                )}
                                            </div>

                                            {/* Favorite Activities */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                    Favorite Activities
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {isEditing ? (
                                                        ACTIVITY_OPTIONS.map((activity) => (
                                                            <button
                                                                key={activity}
                                                                type="button"
                                                                onClick={() => handleActivityToggle(activity)}
                                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${favoriteActivities.includes(activity)
                                                                    ? 'bg-green-600 text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {activity}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        favoriteActivities.length > 0 ? (
                                                            favoriteActivities.map((activity) => (
                                                                <span key={activity} className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                                    {activity}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-500 italic">No favorite activities selected.</span>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Availability */}
                                            <div>
                                                <label htmlFor="availability" className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Availability
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        id="availability"
                                                        value={availability}
                                                        onChange={(e) => setAvailability(e.target.value)}
                                                        className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
                                                    >
                                                        <option value="">Select...</option>
                                                        {AVAILABILITY_OPTIONS.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="text-gray-700 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">{availability || 'Not specified'}</p>
                                                )}
                                            </div>

                                            {message && <div className="text-green-600 text-center font-medium">{message}</div>}
                                            {error && <div className="text-red-600 text-center">{error}</div>}
                                        </form>
                                    </div>
                                </Tab.Panel>

                                {/* Friends Panel */}
                                <Tab.Panel>
                                    {friends.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {friends.map((friend) => (
                                                <div
                                                    key={friend._id}
                                                    onClick={() => navigate(`/profile/${friend._id}`)}
                                                    className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-700 mb-3 overflow-hidden">
                                                        {friend.profilePicture ? (
                                                            <img src={friend.profilePicture} alt={friend.firstName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            `${friend.firstName[0]}${friend.lastName[0]}`
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900 text-center truncate w-full">
                                                        {friend.firstName} {friend.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate w-full text-center">@{friend.username}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            You haven't added any friends yet.
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Requests Received Panel */}
                                <Tab.Panel>
                                    {friendRequests.length > 0 ? (
                                        <div className="space-y-3">
                                            {friendRequests.map((request) => (
                                                <div key={request._id || request} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-base font-bold text-green-700 overflow-hidden">
                                                            {request.profilePicture ? (
                                                                <img src={request.profilePicture} alt={request.firstName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                typeof request === 'string' ? '?' : `${request.firstName?.[0] || '?'}${request.lastName?.[0] || '?'}`
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {typeof request === 'string' ? 'User' : `${request.firstName} ${request.lastName}`}
                                                            </p>
                                                            {typeof request !== 'string' && request.username && (
                                                                <p className="text-xs text-gray-500">@{request.username}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAcceptFriend(typeof request === 'string' ? request : request._id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 transition-colors shadow-sm"
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            No pending friend requests.
                                        </div>
                                    )}
                                </Tab.Panel>

                                {/* Requests Sent Panel */}
                                <Tab.Panel>
                                    {sentFriendRequests.length > 0 ? (
                                        <div className="space-y-3">
                                            {sentFriendRequests.map((request) => (
                                                <div key={request._id || request} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-600 overflow-hidden">
                                                            {request.profilePicture ? (
                                                                <img src={request.profilePicture} alt={request.firstName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                typeof request === 'string' ? '?' : `${request.firstName?.[0] || '?'}${request.lastName?.[0] || '?'}`
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {typeof request === 'string' ? 'User' : `${request.firstName} ${request.lastName}`}
                                                            </p>
                                                            {typeof request !== 'string' && request.username && (
                                                                <p className="text-xs text-gray-500">@{request.username}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                        Pending
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            You haven't sent any friend requests.
                                        </div>
                                    )}
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>
        </div>
    );
}
