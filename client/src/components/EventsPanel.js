import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab, Listbox, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon, CheckIcon } from '@heroicons/react/24/outline';
import { TYPE_OPTIONS } from '../constants/eventOptions';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function EventsPanel({ events, userEvents, onEventClick, onEditEvent, onDeleteEvent, userLocation, user, selectedCategory, onCategoryChange }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);

    // Sort events by distance if userLocation is available
    const sortedEvents = [...events]
        .filter(event => !user || (event.creator._id !== user._id && event.creator !== user._id))
        .sort((a, b) => {
            if (!userLocation) return 0;
            const distA = Math.sqrt(Math.pow(a.location.lat - userLocation.lat, 2) + Math.pow(a.location.lng - userLocation.lng, 2));
            const distB = Math.sqrt(Math.pow(b.location.lat - userLocation.lat, 2) + Math.pow(b.location.lng - userLocation.lng, 2));
            return distA - distB;
        });

    return (
        <div className={`absolute left-4 top-4 bottom-4 transition-all duration-300 z-[1000] flex ${isOpen ? 'w-80' : 'w-0'}`}>
            <div className={`${isOpen ? 'w-80' : 'w-0'} overflow-hidden flex flex-col h-full bg-sidebar-bg rounded-3xl shadow-2xl ring-1 ring-black/5`}>
                <div className="p-6 pb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Events</h2>

                    {/* Category Filter Dropdown */}
                    <div className="relative w-40">
                        <Listbox value={selectedCategory} onChange={onCategoryChange}>
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6">
                                    <span className="block truncate">
                                        {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <FunnelIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        <Listbox.Option
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-green-100 text-green-900' : 'text-gray-900'
                                                }`
                                            }
                                            value="All"
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                        All Categories
                                                    </span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                        {TYPE_OPTIONS.map((type, typeIdx) => (
                                            <Listbox.Option
                                                key={typeIdx}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-green-100 text-green-900' : 'text-gray-900'
                                                    }`
                                                }
                                                value={type.name}
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
                </div>

                <Tab.Group className="flex-1 min-h-0 flex flex-col">
                    <Tab.List className="flex space-x-1 rounded-2xl bg-gray-200/50 p-1 mx-4 mb-2">
                        <Tab
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-white text-green-700 shadow-sm'
                                        : 'text-gray-500 hover:bg-white/50 hover:text-green-800'
                                )
                            }
                        >
                            Nearby
                        </Tab>
                        <Tab
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-white text-green-700 shadow-sm'
                                        : 'text-gray-500 hover:bg-white/50 hover:text-green-800'
                                )
                            }
                        >
                            My Events
                        </Tab>
                    </Tab.List>
                    <Tab.Panels className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar min-h-0">
                        <Tab.Panel className="space-y-3 pt-2">
                            {sortedEvents.map((event) => (
                                <div
                                    key={event._id}
                                    onClick={() => onEventClick(event)}
                                    className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="text-2xl bg-gray-50 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                            {event.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{event.title}</h3>
                                            <p className="text-xs font-medium text-green-600 mt-0.5 uppercase tracking-wide">
                                                {event.type}
                                            </p>
                                            {event.creator && (
                                                <div
                                                    className="flex items-center gap-1 mt-1.5 text-xs text-gray-600 hover:text-green-600 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/profile/${event.creator._id}`);
                                                    }}
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[8px] font-bold text-green-700 overflow-hidden">
                                                        {event.creator.profilePicture ? (
                                                            <img src={event.creator.profilePicture} alt={event.creator.firstName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            `${event.creator.firstName[0]}${event.creator.lastName[0]}`
                                                        )}
                                                    </div>
                                                    <span className="truncate">by {event.creator.firstName} {event.creator.lastName}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                <span>🕒</span>
                                                <span>{new Date(event.time).toLocaleDateString()}</span>
                                            </div>
                                            {event.address && (
                                                <div className="flex items-start gap-1 mt-1 text-xs text-gray-400">
                                                    <span className="mt-0.5">📍</span>
                                                    <span className="truncate">{event.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sortedEvents.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm">No events found nearby.</p>
                                </div>
                            )}
                        </Tab.Panel>
                        <Tab.Panel className="space-y-3 pt-2">
                            {userEvents.map((event) => (
                                <div
                                    key={event._id}
                                    className="bg-white rounded-2xl shadow-sm border border-transparent hover:border-green-100 transition-all duration-200 overflow-hidden"
                                >
                                    <div
                                        onClick={() => onEventClick(event)}
                                        className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{event.emoji}</div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{event.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(event.time).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditEvent(event);
                                            }}
                                            className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-blue-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteEvent(event._id);
                                            }}
                                            className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {userEvents.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm">You haven't created any events yet.</p>
                                </div>
                            )}
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute left-full top-8 ml-4 bg-white p-3 rounded-full shadow-lg text-gray-500 hover:text-green-600 hover:scale-110 transition-all duration-200"
            >
                {isOpen ? (
                    <ChevronLeftIcon className="h-5 w-5" />
                ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                )}
            </button>
        </div>
    );
}
