import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="bg-dashboard-bg min-h-screen relative overflow-hidden">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-green-200 to-green-400 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>

                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl mb-8">
                            Find your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">third space</span>
                        </h1>
                        <p className="mt-6 text-xl leading-8 text-gray-600 max-w-xl mx-auto">
                            Escape the algorithm. Find your people. MySpace is the digital bridge to real-world connection, helping you discover the spaces where community happens.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/register"
                                className="rounded-full bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-green-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                            >
                                Join the Movement
                            </Link>
                            <Link to="/login" className="text-base font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50">
                                Log in <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-green-200 to-green-400 opacity-40 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>
            </div>
        </div>
    );
}
