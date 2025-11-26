import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config/config';

export default function PublicProfilePage() {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFriend, setIsFriend] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/${userId}`;
            const { data } = await axios.get(url);
            setUser(data);

            if (currentUser) {
                setIsFriend(data.friends.some(f => f._id === currentUser._id));
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to load user profile');
            setLoading(false);
        }
    };

    const handleFriendRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/friend-request/${userId}`;
            await axios.post(url, {}, {
                headers: { 'x-auth-token': token }
            });
            setRequestSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send friend request');
        }
    };

    const handleRemoveFriend = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/remove-friend/${userId}`;
            await axios.delete(url, {
                headers: { 'x-auth-token': token }
            });
            setIsFriend(false);
            fetchUserProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove friend');
        }
    };

    if (loading) return <div className="min-h-screen bg-dashboard-bg flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>;
    if (error && !user) return <div className="min-h-screen bg-dashboard-bg flex items-center justify-center"><div className="text-red-600">{error}</div></div>;
    if (!user) return null;

    const isOwnProfile = currentUser && currentUser._id === userId;

    return (
        <div className="min-h-screen bg-dashboard-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto pb-12">
                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                    {/* Profile Content */}
                    <div className="px-8 py-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                            <div className="w-32 h-32 rounded-full bg-white ring-4 ring-gray-100 shadow-xl overflow-hidden flex-shrink-0">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-green-100 flex items-center justify-center text-4xl font-bold text-green-700">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                                <p className="text-gray-500 mt-1">@{user.username}</p>
                                {user.lookingFor && (
                                    <p className="text-sm text-green-600 mt-2">Looking for: {user.lookingFor}</p>
                                )}
                            </div>
                            {!isOwnProfile && currentUser && (
                                <div className="flex gap-3">
                                    {isFriend ? (
                                        <button
                                            onClick={handleRemoveFriend}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
                                        >
                                            Remove Friend
                                        </button>
                                    ) : requestSent ? (
                                        <button
                                            disabled
                                            className="px-6 py-2 bg-gray-200 text-gray-500 rounded-full font-medium cursor-not-allowed"
                                        >
                                            Request Sent
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleFriendRequest}
                                            className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-500 transition-colors shadow-md"
                                        >
                                            Add Friend
                                        </button>
                                    )}
                                </div>
                            )}
                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-500 transition-colors shadow-md"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                            </div>
                        )}

                        {/* Interests */}
                        {user.interests && user.interests.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Interests</h2>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest, index) => (
                                        <span key={index} className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Favorite Activities */}
                        {user.favoriteActivities && user.favoriteActivities.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Favorite Activities</h2>
                                <div className="flex flex-wrap gap-2">
                                    {user.favoriteActivities.map((activity, index) => (
                                        <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Availability */}
                        {user.availability && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Availability</h2>
                                <p className="text-gray-700">{user.availability}</p>
                            </div>
                        )}

                        {/* Friends */}
                        {user.friends && user.friends.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Friends ({user.friends.length})</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {user.friends.slice(0, 8).map((friend) => (
                                        <div
                                            key={friend._id}
                                            onClick={() => navigate(`/profile/${friend._id}`)}
                                            className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-700 mb-2 overflow-hidden">
                                                {friend.profilePicture ? (
                                                    <img src={friend.profilePicture} alt={friend.firstName} className="w-full h-full object-cover" />
                                                ) : (
                                                    `${friend.firstName[0]}${friend.lastName[0]}`
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 text-center">{friend.firstName} {friend.lastName}</p>
                                            <p className="text-xs text-gray-500">@{friend.username}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
