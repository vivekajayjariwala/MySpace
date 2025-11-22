import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { XMarkIcon, ChevronUpDownIcon, CheckIcon, MapPinIcon, UserPlusIcon, UserMinusIcon, PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/outline';
import EmojiPicker from 'emoji-picker-react';
import { searchAddress, reverseGeocode } from '../utils/geocoding';
import axios from 'axios';
import config from '../config/config';
import { useAuth } from '../context/AuthContext';

const TYPE_OPTIONS = [
    { name: 'Sports', emoji: '⚽' },
    { name: 'Video Games', emoji: '🎮' },
    { name: 'Movies', emoji: '🎬' },
    { name: 'Music', emoji: '🎵' },
    { name: 'Food & Drinks', emoji: '🍽️' },
    { name: 'Study/Work', emoji: '📚' },
    { name: 'Outdoor', emoji: '🏞️' },
    { name: 'Board Games', emoji: '🎲' },
    { name: 'Party', emoji: '🎉' },
    { name: 'Fitness', emoji: '💪' },
    { name: 'Art & Crafts', emoji: '🎨' },
    { name: 'Networking', emoji: '🤝' },
    { name: 'Birthday', emoji: '🎂' },
    { name: 'Custom', emoji: '✨' },
];

export default function EventModal({ isOpen, onClose, location, onLocationChange, onSubmit, initialData }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0); // 0: Manual, 1: AI
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [title, setTitle] = useState('');
    const [selectedType, setSelectedType] = useState(TYPE_OPTIONS[0]);
    const [customType, setCustomType] = useState('');
    const [emoji, setEmoji] = useState('📍');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('');
    const [participantsLimit, setParticipantsLimit] = useState(10);
    const [hasParticipantLimit, setHasParticipantLimit] = useState(false);

    // Social State
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [creator, setCreator] = useState(null);
    const [isFriend, setIsFriend] = useState(false);
    const [friendRequestSent, setFriendRequestSent] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            const typeOption = TYPE_OPTIONS.find(t => t.name === initialData.type) || { name: 'Custom', emoji: '✨' };
            setSelectedType(typeOption);
            if (typeOption.name === 'Custom') setCustomType(initialData.type);
            setEmoji(initialData.emoji);
            setAddress(initialData.address || '');
            setDescription(initialData.description || '');
            setTime(new Date(initialData.time).toISOString().slice(0, 16));
            setHasParticipantLimit(!!initialData.participantsLimit);
            setParticipantsLimit(initialData.participantsLimit || 10);
            setComments(initialData.comments || []);
            setCreator(initialData.creator);

            // Check if following
            if (user && initialData.creator && initialData.creator._id !== user._id) {
                setIsFollowing(user.following && user.following.includes(initialData.creator._id));
                // Check if friend
                setIsFriend(user.friends && user.friends.includes(initialData.creator._id));
            }
        } else {
            resetForm();
        }
    }, [initialData, isOpen, user]);

    const handleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}/api/social/${isFollowing ? 'unfollow' : 'follow'}/${creator._id}`;
            await axios.post(url, {}, { headers: { 'x-auth-token': token } });
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleFriendRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}/api/users/friend-request/${creator._id}`;
            await axios.post(url, {}, { headers: { 'x-auth-token': token } });
            setFriendRequestSent(true);
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}/api/social/events/${initialData._id}/comment`;
            const { data } = await axios.post(url, { text: newComment }, { headers: { 'x-auth-token': token } });
            setComments([...comments, data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const url = `${config.api.baseUrl}/api/social/events/${initialData._id}/comment/${commentId}`;
            await axios.delete(url, { headers: { 'x-auth-token': token } });
            setComments(comments.filter(c => c._id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // Reverse geocode when location changes (e.g. from map click)
    React.useEffect(() => {
        const getAddress = async () => {
            if (location) {
                const addr = await reverseGeocode(location.lat, location.lng);
                if (addr) {
                    setAddress(addr);
                }
            }
        };
        getAddress();
    }, [location]);

    const handleAddressChange = async (e) => {
        const value = e.target.value;
        setAddress(value);
        if (value.length > 2) {
            const results = await searchAddress(value);
            setSuggestions(results);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setAddress(suggestion.place_name);
        setSuggestions([]);
        setShowSuggestions(false);

        const [lng, lat] = suggestion.center;
        onLocationChange({ lat, lng });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            title,
            type: selectedType.name === 'Custom' ? customType : selectedType.name,
            emoji,
            address,
            description,
            time,
            participantsLimit: hasParticipantLimit ? participantsLimit : undefined,
            location
        });
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setSelectedType(TYPE_OPTIONS[0]);
        setCustomType('');
        setEmoji('📍');
        setAddress('');
        setDescription('');
        setTime('');
        setParticipantsLimit(10);
        setHasParticipantLimit(false);
        setAiPrompt('');
        setSelectedTab(0);
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        if (type.name !== 'Custom') {
            setEmoji(type.emoji);
        }
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const response = await axios.post(`${config.api.baseUrl}/api/ai/generate-event`, { prompt: aiPrompt });
            const { title, description, type, emoji } = response.data;

            setTitle(title || '');
            setDescription(description || '');
            setEmoji(emoji || '📍');

            const typeOption = TYPE_OPTIONS.find(t => t.name === type) || { name: 'Custom', emoji: '✨' };
            setSelectedType(typeOption);
            if (typeOption.name === 'Custom') setCustomType(type || '');

            setSelectedTab(0); // Switch back to Manual tab
        } catch (error) {
            console.error('AI Generation failed:', error);
            alert('Failed to generate event. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[2000]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-visible rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                                            {initialData ? 'Edit Event' : 'Create New Event'}
                                        </Dialog.Title>

                                        {/* Creator Info Section (Only show when viewing existing event) */}
                                        {initialData && creator && (
                                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 -ml-2 transition-colors"
                                                        onClick={() => navigate(`/profile/${creator._id}`)}
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-700 overflow-hidden flex-shrink-0">
                                                            {creator.profilePicture ? (
                                                                <img src={creator.profilePicture} alt={creator.firstName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                `${creator.firstName[0]}${creator.lastName[0]}`
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {creator.firstName} {creator.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">@{creator.username}</p>
                                                        </div>
                                                    </div>
                                                    {user && creator._id !== user._id && (
                                                        <div className="flex gap-2">
                                                            {isFriend ? (
                                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                                    Friends
                                                                </span>
                                                            ) : friendRequestSent ? (
                                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                                                                    Request Sent
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={handleFriendRequest}
                                                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-500 transition-colors"
                                                                >
                                                                    <UserPlusIcon className="h-3 w-3" />
                                                                    Add Friend
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!initialData && (
                                            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                                                <button
                                                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2 ${selectedTab === 0
                                                        ? 'bg-white text-green-700 shadow'
                                                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-green-800'
                                                        }`}
                                                    onClick={() => setSelectedTab(0)}
                                                >
                                                    🛠️ Manual
                                                </button>
                                                <button
                                                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2 ${selectedTab === 1
                                                        ? 'bg-white text-green-700 shadow'
                                                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-green-800'
                                                        }`}
                                                    onClick={() => setSelectedTab(1)}
                                                >
                                                    ✨ AI Generate
                                                </button>
                                            </div>
                                        )}

                                        {selectedTab === 1 && !initialData ? (
                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-500">
                                                    Describe your event, and we'll generate the details for you!
                                                </p>
                                                <textarea
                                                    rows={4}
                                                    className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                    placeholder="e.g., A casual board game night at my place this Friday with pizza."
                                                    value={aiPrompt}
                                                    onChange={(e) => setAiPrompt(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAiGenerate}
                                                    disabled={isGenerating || !aiPrompt.trim()}
                                                    className="w-full rounded-xl bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                                >
                                                    {isGenerating ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>✨ Generate Event</>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                {/* Emoji & Title Row */}
                                                <div className="flex gap-4">
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                            className="h-[50px] w-[50px] flex items-center justify-center text-3xl bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100"
                                                        >
                                                            {emoji}
                                                        </button>
                                                        {showEmojiPicker && (
                                                            <div className="absolute top-14 left-0 z-50">
                                                                <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                                                                <div className="relative z-50">
                                                                    <EmojiPicker
                                                                        onEmojiClick={(e) => {
                                                                            setEmoji(e.emoji);
                                                                            setShowEmojiPicker(false);
                                                                        }}
                                                                        width={300}
                                                                        height={400}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            required
                                                            className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                            placeholder="Event Title"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Type Dropdown */}
                                                <div className="relative">
                                                    <Listbox value={selectedType} onChange={handleTypeChange}>
                                                        <div className="relative mt-1">
                                                            <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-3 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6">
                                                                <span className="block truncate">{selectedType.emoji} {selectedType.name}</span>
                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                </span>
                                                            </Listbox.Button>
                                                            <Transition
                                                                as={Fragment}
                                                                leave="transition ease-in duration-100"
                                                                leaveFrom="opacity-100"
                                                                leaveTo="opacity-0"
                                                            >
                                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                    {TYPE_OPTIONS.map((type, typeIdx) => (
                                                                        <Listbox.Option
                                                                            key={typeIdx}
                                                                            className={({ active }) =>
                                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-green-100 text-green-900' : 'text-gray-900'
                                                                                }`
                                                                            }
                                                                            value={type}
                                                                        >
                                                                            {({ selected }) => (
                                                                                <>
                                                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                                        {type.emoji} {type.name}
                                                                                    </span>
                                                                                    {selected ? (
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    ))}
                                                                </Listbox.Options>
                                                            </Transition>
                                                        </div>
                                                    </Listbox>
                                                </div>

                                                {/* Custom Type Input */}
                                                {selectedType.name === 'Custom' && (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                            placeholder="Enter custom event type..."
                                                            value={customType}
                                                            onChange={(e) => setCustomType(e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {/* Address */}
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        required
                                                        className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                        placeholder="Address / Location Name"
                                                        value={address}
                                                        onChange={handleAddressChange}
                                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                    />
                                                    {showSuggestions && suggestions.length > 0 && (
                                                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                            {suggestions.map((suggestion) => (
                                                                <div
                                                                    key={suggestion.id}
                                                                    className="cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-green-50 text-gray-900"
                                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                                        <span className="block truncate">{suggestion.place_name}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Time */}
                                                <div>
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                        value={time}
                                                        onChange={(e) => setTime(e.target.value)}
                                                    />
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <textarea
                                                        rows={3}
                                                        className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                        placeholder="Description..."
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                    />
                                                </div>

                                                {/* Participants Limit */}
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={hasParticipantLimit}
                                                            onChange={(e) => setHasParticipantLimit(e.target.checked)}
                                                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">Limit number of participants</span>
                                                    </label>

                                                    {hasParticipantLimit && (
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setParticipantsLimit(Math.max(1, participantsLimit - 1))}
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                                                            >
                                                                −
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={participantsLimit}
                                                                onChange={(e) => setParticipantsLimit(Math.max(1, parseInt(e.target.value) || 1))}
                                                                className="flex-1 text-center rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setParticipantsLimit(participantsLimit + 1)}
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Submit Button */}
                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="inline-flex w-full justify-center rounded-xl bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                                                    >
                                                        {initialData ? 'Update Event' : 'Create Event'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                        onClick={onClose}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Comments Section (Only in Edit Mode) */}
                                        {initialData && (
                                            <div className="mt-8 border-t border-gray-200 pt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">Comments</h4>
                                                    {creator && user && creator._id !== user._id && (
                                                        <button
                                                            onClick={handleFollow}
                                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${isFollowing
                                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                                }`}
                                                        >
                                                            {isFollowing ? (
                                                                <>
                                                                    <UserMinusIcon className="h-3 w-3" /> Unfollow Host
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserPlusIcon className="h-3 w-3" /> Follow Host
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                                                    {comments.map((comment) => (
                                                        <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-xs font-semibold text-gray-900">
                                                                    {comment.user.firstName} {comment.user.lastName}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                                                            {(user && (user._id === comment.user._id || user._id === comment.user)) && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment._id)}
                                                                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {comments.length === 0 && (
                                                        <p className="text-sm text-gray-500 text-center italic">No comments yet.</p>
                                                    )}
                                                </div>

                                                {user && (
                                                    <form onSubmit={handleAddComment} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            placeholder="Add a comment..."
                                                            className="block w-full rounded-lg border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={!newComment.trim()}
                                                            className="rounded-lg bg-green-600 p-2 text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <PaperAirplaneIcon className="h-5 w-5" />
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
