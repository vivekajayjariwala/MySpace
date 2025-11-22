
import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPinIcon } from '@heroicons/react/24/solid';

import config from '../config/config';

export default function MapComponent({ events, onMapClick, onJoinEvent, onLeaveEvent, user, tempMarker }) {
    const [viewState, setViewState] = useState({
        latitude: 51.505,
        longitude: -0.09,
        zoom: 13
    });
    const [selectedEvent, setSelectedEvent] = useState(null);


    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setViewState(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        zoom: 14
                    }));
                },
                (error) => console.error("Error getting location:", error)
            );
        }
    }, []);

    const handleMapClick = useCallback((event) => {
        const { lng, lat } = event.lngLat;

        onMapClick({ lat, lng }); // Adapt to match previous interface
        setSelectedEvent(null); // Close popup if open
    }, [onMapClick]);

    return (
        <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={config.mapboxToken}
            onClick={handleMapClick}
        >
            <GeolocateControl position="top-left" />
            <NavigationControl position="top-left" />

            {/* Event Markers */}
            {events.map((event) => {


                return (
                    <Marker
                        key={event._id}
                        latitude={event.location.lat}
                        longitude={event.location.lng}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setSelectedEvent(event);

                        }}
                    >
                        <div className="cursor-pointer hover:scale-110 transition-transform drop-shadow-md text-3xl">
                            {event.emoji || '📍'}
                        </div>
                    </Marker>
                );
            })}

            {/* Temporary Marker for creation */}
            {tempMarker && (
                <Marker
                    latitude={tempMarker.lat}
                    longitude={tempMarker.lng}
                    anchor="bottom"
                >
                    <MapPinIcon className="h-8 w-8 text-gray-400 opacity-70" />
                </Marker>
            )}

            {/* Popup */}
            {selectedEvent && (
                <Popup
                    latitude={selectedEvent.location.lat}
                    longitude={selectedEvent.location.lng}
                    anchor="top"
                    onClose={() => setSelectedEvent(null)}
                    closeOnClick={false}
                    closeButton={false}
                    className="custom-event-popup z-50"
                    maxWidth="300px"
                >
                    <div className="p-0 rounded-3xl overflow-hidden bg-white shadow-2xl ring-1 ring-black/5">
                        {/* Header with Emoji and Title */}
                        <div className="bg-gray-50/80 p-5 pr-10 flex items-start gap-4 border-b border-gray-100 relative backdrop-blur-sm">
                            <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm ring-1 ring-black/5">
                                {selectedEvent.emoji || '📍'}
                            </div>
                            <div className="flex-1 pt-1">
                                <h3 className="font-bold text-xl leading-tight text-gray-900">{selectedEvent.title}</h3>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1.5">{selectedEvent.type}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(null);
                                }}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white shadow-sm hover:shadow transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Time & Location */}
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">🕒</span>
                                    <span>{new Date(selectedEvent.time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {selectedEvent.address && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">📍</span>
                                        <span>{selectedEvent.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {selectedEvent.description && (
                                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl">
                                    {selectedEvent.description}
                                </p>
                            )}

                            {/* Footer: Participants & Actions */}
                            <div className="pt-2 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <span className="text-sm font-semibold text-gray-700">
                                        👥 {selectedEvent.participants.length}
                                        {selectedEvent.participantsLimit ? <span className="text-gray-400 font-normal"> / {selectedEvent.participantsLimit}</span> : ''}
                                    </span>
                                </div>

                                {(() => {
                                    const isParticipant = user && selectedEvent.participants.some(p => p._id === user._id || p === user._id);
                                    const isCreator = user && (selectedEvent.creator._id === user._id || selectedEvent.creator === user._id);

                                    return (
                                        <div className="flex gap-2">
                                            {user && !isParticipant && (
                                                <button
                                                    onClick={() => onJoinEvent(selectedEvent._id)}
                                                    className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-full hover:bg-green-500 font-semibold shadow-sm hover:shadow transition-all"
                                                >
                                                    Join
                                                </button>
                                            )}
                                            {isParticipant && !isCreator && (
                                                <button
                                                    onClick={() => onLeaveEvent(selectedEvent._id)}
                                                    className="text-sm bg-red-50 text-red-600 px-4 py-1.5 rounded-full hover:bg-red-100 font-semibold transition-colors border border-red-100"
                                                >
                                                    Leave
                                                </button>
                                            )}
                                            {isCreator && (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-semibold border border-blue-100">
                                                    Hosting
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
        </Map>
    );
}
