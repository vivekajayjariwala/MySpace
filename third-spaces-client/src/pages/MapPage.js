import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import EventModal from '../components/EventModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import config from '../config/config';
import { useAuth } from '../context/AuthContext';

export default function MapPage() {
    const [events, setEvents] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newEventLocation, setNewEventLocation] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.events}`;
            const { data } = await axios.get(url);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleMapClick = (latlng) => {
        if (!user) {
            alert('Please login to create an event');
            return;
        }
        setNewEventLocation(latlng);
        setIsCreating(true);
    };

    const handleCreateEvent = async (eventData) => {
        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.events}`;
            const token = localStorage.getItem('token');

            // Ensure headers are set correctly
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token
            };

            const { data } = await axios.post(url, eventData, { headers });
            setEvents([...events, data]);
            setIsCreating(false);
            setNewEventLocation(null);
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        }
    };

    const handleJoinEvent = async (eventId) => {
        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.events}/${eventId}/join`;
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            const { data } = await axios.post(url, {}, { headers });

            // Update local state
            setEvents(events.map(e => e._id === eventId ? data : e));
        } catch (error) {
            console.error('Error joining event:', error);
            alert(error.response?.data?.message || 'Failed to join event');
        }
    };

    const handleLeaveEvent = async (eventId) => {
        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.events}/${eventId}/leave`;
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            const { data } = await axios.post(url, {}, { headers });

            // Update local state
            setEvents(events.map(e => e._id === eventId ? data : e));
        } catch (error) {
            console.error('Error leaving event:', error);
            alert(error.response?.data?.message || 'Failed to leave event');
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full relative">
            <Map
                events={events}
                onMapClick={handleMapClick}
                onJoinEvent={handleJoinEvent}
                onLeaveEvent={handleLeaveEvent}
                user={user}
            />

            {user && (
                <button
                    className="absolute bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-500 transition-colors z-[1000]"
                    onClick={() => setIsCreating(true)}
                >
                    <PlusIcon className="h-6 w-6" />
                </button>
            )}

            <EventModal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                location={newEventLocation}
                onSubmit={handleCreateEvent}
            />
        </div>
    );
}
