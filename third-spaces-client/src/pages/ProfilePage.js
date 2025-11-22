import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config/config';

export default function ProfilePage() {
    const { user, login } = useAuth();
    console.log('ProfilePage user:', user);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/profile`;
            const { data } = await axios.put(url, { firstName, lastName }, {
                headers: { 'x-auth-token': token }
            });

            // Update local storage user if necessary, or trigger a context update
            // For now, we might need to rely on the user refreshing or re-logging, 
            // but ideally AuthContext should expose a way to update user data.
            // If AuthContext stores user in state initialized from localStorage, we should update localStorage.
            // However, the best way is if login() accepts user data or if we have an updateUser() function.
            // Let's assume we can just update the user in localStorage and reload for now if context doesn't support update.

            // Actually, let's try to update the context if possible. 
            // If not, a simple reload or re-fetch logic in App.js would be needed.
            // For this implementation, I'll assume the user might need to refresh to see changes in Navbar 
            // unless we have a setUser in context.

            setMessage('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    if (!user) return <div className="p-8 text-center">Please log in to view this page.</div>;

    return (
        <div className="min-h-screen bg-dashboard-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <div className="px-8 py-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700 ring-4 ring-white shadow-md">
                                {user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                                <p className="text-gray-500 mt-1">Manage your personal information</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900">
                                        First name
                                    </label>
                                    <div className="mt-2.5">
                                        <input
                                            type="text"
                                            name="first-name"
                                            id="first-name"
                                            autoComplete="given-name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="block w-full rounded-xl border-0 bg-gray-50 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-900">
                                        Last name
                                    </label>
                                    <div className="mt-2.5">
                                        <input
                                            type="text"
                                            name="last-name"
                                            id="last-name"
                                            autoComplete="family-name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="block w-full rounded-xl border-0 bg-gray-50 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                                        Email address
                                    </label>
                                    <div className="mt-2.5">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={user.email}
                                            disabled
                                            className="block w-full rounded-xl border-0 bg-gray-100 py-3 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">{message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-full bg-green-600 px-8 py-3 text-sm font-semibold leading-6 text-white shadow-lg hover:bg-green-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:w-auto"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
