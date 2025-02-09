"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

export default function SignupPage() {
    const countryCodes = [
        { code: "+1", country: "United States" },
        { code: "+44", country: "United Kingdom" },
        { code: "+90", country: "Turkey" },
        { code: "+49", country: "Germany" },
        // Add more countries as needed
    ];

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [country_code, setCountryCode] = useState("");
    const router = useRouter();


    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signUp(email, password, phoneNumber, country_code, firstname, lastname);

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        alert("Signup successful! Check your email for verification.");
        router.push("/login");
    };

    return (
        <main className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />
                <input
                    type="firstname"
                    placeholder="First Name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"

                />
                <input
                    type="lastname"
                    placeholder="Last Name"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"

                />
                <input
                    type="phoneNumber"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"

                />
                <select
                    value={country_code}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                >
                    {countryCodes.map(({ code, country }) => (
                        <option key={code} value={code}>
                            {country} ({code})
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
            <p className="text-center mt-4">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 underline">
                    Login
                </a>
            </p>
        </main>
    );
}
