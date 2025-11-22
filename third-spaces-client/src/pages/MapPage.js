import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import EventModal from '../components/EventModal';
import EventsPanel from '../components/EventsPanel';
import { PlusIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import config from '../config/config';
import { useAuth } from '../context/AuthContext';

export default function MapPage() {
    const [events, setEvents] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newEventLocation, setNewEventLocation] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
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

            if (editingEvent) {
                const { data } = await axios.put(`${url}/${editingEvent._id}`, eventData, { headers });
                setEvents(events.map(e => e._id === editingEvent._id ? data : e));
                setEditingEvent(null);
            } else {
                const { data } = await axios.post(url, eventData, { headers });
                setEvents([...events, data]);
            }

            setIsCreating(false);
            setNewEventLocation(null);
        } catch (error) {
            console.error('Error creating/updating event:', error);
            alert('Failed to save event');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.events}/${eventId}`;
            const token = localStorage.getItem('token');
            await axios.delete(url, { headers: { 'x-auth-token': token } });
            setEvents(events.filter(e => e._id !== eventId));
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        }
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setNewEventLocation(event.location);
        setIsCreating(true);
    };

    const handlePanelEventClick = (event) => {
        // We can pass a selected event to the map to fly to it or open popup
        // For now, let's just fly to it if we had a ref, or we can update map view state
        // Since Map is controlled, we might need to lift viewState up or expose a method
        // But for simplicity, let's just rely on the user finding it or maybe we can set a "focusedEvent" state
        // that the Map component listens to.
        // Let's add a prop to Map to focus on an event.
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
        <div className="h-[calc(100vh-64px)] w-full relative bg-dashboard-bg p-4">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5">
                <EventsPanel
                    events={events}
                    userEvents={events.filter(e => e.creator._id === user?._id || e.creator === user?._id)}
                    onEventClick={handlePanelEventClick}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                    userLocation={null}
                    user={user}
                />

                <Map
                    events={events}
                    onMapClick={handleMapClick}
                    onJoinEvent={handleJoinEvent}
                    onLeaveEvent={handleLeaveEvent}
                    user={user}
                    tempMarker={newEventLocation}
                />

                {user && (
                    <button
                        className="absolute bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-500 transition-colors z-[1000]"
                        onClick={() => setIsCreating(true)}
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                )}
            </div>

            <EventModal
                isOpen={isCreating}
                onClose={() => {
                    setIsCreating(false);
                    setEditingEvent(null);
                    setNewEventLocation(null);
                }}
                location={newEventLocation}
                initialData={editingEvent}
                onLocationChange={setNewEventLocation}
                onSubmit={handleCreateEvent}
            />
        </div>
    );
}
