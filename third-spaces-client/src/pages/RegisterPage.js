import { useState } from 'react'
import { Field, Label, Switch } from '@headlessui/react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import config from '../config/config'
import { sanitizeFormData } from '../utils/sanitizer';
import { INTEREST_OPTIONS, ACTIVITY_OPTIONS, LOOKING_FOR_OPTIONS, AVAILABILITY_OPTIONS } from '../constants/profileOptions';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [agreed, setAgreed] = useState(false)

    const [data, setData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        bio: '',
        interests: [],
        profilePicture: '',
        lookingFor: '',
        favoriteActivities: [],
        availability: ''
    })

    const [customInterest, setCustomInterest] = useState('');
    const [customActivity, setCustomActivity] = useState('');
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const [verificationUrl, setVerificationUrl] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value })
    }

    const handleInterestToggle = (interest) => {
        if (data.interests.includes(interest)) {
            setData({ ...data, interests: data.interests.filter(i => i !== interest) });
        } else if (data.interests.length < 3) {
            setData({ ...data, interests: [...data.interests, interest] });
        }
    }

    const handleAddCustomInterest = () => {
        if (customInterest.trim() && data.interests.length < 3 && !data.interests.includes(customInterest.trim())) {
            setData({ ...data, interests: [...data.interests, customInterest.trim()] });
            setCustomInterest('');
        }
    }

    const handleActivityToggle = (activity) => {
        if (data.favoriteActivities.includes(activity)) {
            setData({ ...data, favoriteActivities: data.favoriteActivities.filter(a => a !== activity) });
        } else {
            setData({ ...data, favoriteActivities: [...data.favoriteActivities, activity] });
        }
    }

    const handleAddCustomActivity = () => {
        if (customActivity.trim() && !data.favoriteActivities.includes(customActivity.trim())) {
            setData({ ...data, favoriteActivities: [...data.favoriteActivities, customActivity.trim()] });
            setCustomActivity('');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If we're on step 1, just go to next step instead of submitting
        if (step === 1) {
            nextStep();
            return;
        }

        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.users}`;
            const sanitizedData = sanitizeFormData(data);

            const { data: res } = await axios.post(url, sanitizedData)

            if (res.verificationUrl) {
                const verificationUrl = res.verificationUrl.replace('http://localhost:3000', config.api.baseUrl);
                setVerificationUrl(verificationUrl);
            } else {
                navigate('/login')
            }
        } catch (error) {
            if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                setError(error.response.data.message)
            } else {
                setError('An unexpected error occurred during registration')
            }
        }
    }

    const nextStep = () => {
        if (isNavigating) return;
        setError('');
        setIsNavigating(true);
        setStep(step + 1);
        setTimeout(() => setIsNavigating(false), 500);
    }

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    }

    return (
        <div className="isolate bg-white px-8 py-28 sm:py-36 lg:px-10">
            {verificationUrl ? (
                <div className="mx-auto mt-20 max-w-xl text-center">
                    <div className="rounded-3xl bg-green-50 p-8 ring-1 ring-green-200">
                        <h3 className="text-2xl font-bold text-green-800 mb-4">Registration Complete!</h3>
                        <p className="text-green-700 mb-6">
                            Your account has been created successfully. To activate your account, please verify your email address by clicking the link below:
                        </p>
                        <div className="break-all bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                            <a href={verificationUrl} className="text-green-600 hover:text-green-500 font-medium underline">
                                {verificationUrl}
                            </a>
                        </div>
                        <div className="mt-8">
                            <Link to="/login" className="text-sm font-semibold text-green-700 hover:text-green-600">
                                Proceed to Login &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Register an account</h2>
                        <p className="mt-4 text-lg/8 text-gray-600">
                            {step === 1 && "Let's start with the basics"}
                            {step === 2 && "Tell us about yourself"}
                        </p>
                        <div className="flex justify-center gap-2 mt-6">
                            {[1, 2].map((s) => (
                                <div key={s} className={`h-2 w-16 rounded-full ${s <= step ? 'bg-green-600' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="mx-auto mt-20 max-w-xl sm:mt-24">
                        {step === 1 && (
                            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm/6 font-semibold text-gray-900">
                                        First name
                                    </label>
                                    <div className="mt-3">
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            placeholder="First name"
                                            value={data.firstName}
                                            onChange={handleChange}
                                            type="text"
                                            required
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm/6 font-semibold text-gray-900">
                                        Last name
                                    </label>
                                    <div className="mt-3">
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            placeholder="Last name"
                                            value={data.lastName}
                                            onChange={handleChange}
                                            type="text"
                                            required
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="username" className="block text-sm/6 font-semibold text-gray-900">
                                        Username
                                    </label>
                                    <div className="mt-3">
                                        <input
                                            id="username"
                                            name="username"
                                            placeholder="Username"
                                            value={data.username}
                                            onChange={handleChange}
                                            type="text"
                                            required
                                            autoComplete="username"
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900">
                                        Email
                                    </label>
                                    <div className="mt-3">
                                        <input
                                            id="email"
                                            name="email"
                                            placeholder="Email"
                                            value={data.email}
                                            onChange={handleChange}
                                            type="email"
                                            required
                                            autoComplete="email"
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="password" className="block text-sm/6 font-semibold text-gray-900">
                                        Password
                                    </label>
                                    <div className="mt-3">
                                        <input
                                            id="password"
                                            name="password"
                                            placeholder="Password"
                                            value={data.password}
                                            onChange={handleChange}
                                            type="password"
                                            required
                                            autoComplete="password"
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <Field className="flex gap-x-4 sm:col-span-2">
                                    <div className="flex h-8 items-center">
                                        <Switch
                                            checked={agreed}
                                            onChange={setAgreed}
                                            className="group flex w-11 flex-none cursor-pointer rounded-full bg-gray-200 p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 data-[checked]:bg-green-600"
                                        >
                                            <span className="sr-only">Agree to policies</span>
                                            <span
                                                aria-hidden="true"
                                                className="h-5 w-5 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out group-data-[checked]:translate-x-6"
                                            />
                                        </Switch>
                                    </div>
                                    <Label className="text-sm/6 text-gray-600">
                                        By selecting this, you agree to our{' '}
                                        <button type="button" className="font-semibold text-green-600 hover:underline">
                                            privacy&nbsp;policy
                                        </button>
                                        .
                                    </Label>
                                </Field>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-900">
                                        Bio <span className="text-gray-500 font-normal">(optional)</span>
                                    </label>
                                    <div className="mt-3">
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            maxLength={500}
                                            value={data.bio}
                                            onChange={handleChange}
                                            placeholder="Tell us about yourself..."
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{data.bio.length}/500 characters</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        Top 3 Interests <span className="text-gray-500 font-normal">({data.interests.length}/3 selected)</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_OPTIONS.map((interest) => (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => handleInterestToggle(interest)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.interests.includes(interest)
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    } ${data.interests.length >= 3 && !data.interests.includes(interest) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={data.interests.length >= 3 && !data.interests.includes(interest)}
                                            >
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <input
                                            type="text"
                                            value={customInterest}
                                            onChange={(e) => setCustomInterest(e.target.value)}
                                            placeholder="Add custom interest"
                                            className="flex-1 rounded-md border-0 px-4 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600"
                                            disabled={data.interests.length >= 3}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomInterest}
                                            disabled={data.interests.length >= 3 || !customInterest.trim()}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="lookingFor" className="block text-sm font-semibold text-gray-900">
                                        Looking For <span className="text-gray-500 font-normal">(optional)</span>
                                    </label>
                                    <div className="mt-3">
                                        <select
                                            id="lookingFor"
                                            name="lookingFor"
                                            value={data.lookingFor}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        >
                                            <option value="">Select...</option>
                                            {LOOKING_FOR_OPTIONS.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        Favorite Activities <span className="text-gray-500 font-normal">(optional)</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ACTIVITY_OPTIONS.map((activity) => (
                                            <button
                                                key={activity}
                                                type="button"
                                                onClick={() => handleActivityToggle(activity)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.favoriteActivities.includes(activity)
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {activity}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <input
                                            type="text"
                                            value={customActivity}
                                            onChange={(e) => setCustomActivity(e.target.value)}
                                            placeholder="Add custom activity"
                                            className="flex-1 rounded-md border-0 px-4 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomActivity}
                                            disabled={!customActivity.trim()}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="availability" className="block text-sm font-semibold text-gray-900">
                                        Availability <span className="text-gray-500 font-normal">(optional)</span>
                                    </label>
                                    <div className="mt-3">
                                        <select
                                            id="availability"
                                            name="availability"
                                            value={data.availability}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm/6"
                                        >
                                            <option value="">Select...</option>
                                            {AVAILABILITY_OPTIONS.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && <div className="text-red-500 text-center mt-4">{error}</div>}

                        <div className="mt-12 flex gap-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 rounded-md bg-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 shadow-md hover:bg-gray-300"
                                >
                                    Back
                                </button>
                            )}
                            {step < 2 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={(!agreed && step === 1) || isNavigating}
                                    className="flex-1 rounded-md bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isNavigating}
                                    className="flex-1 rounded-md bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Complete Registration
                                </button>
                            )}
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-green-600 hover:text-green-500">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </form>
                </>
            )}
        </div>
    )
}
