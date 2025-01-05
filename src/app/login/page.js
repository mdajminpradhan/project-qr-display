/* eslint-disable react-hooks/rules-of-hooks */
"use client"; // Ensures client-side functionality for React
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Hardcoded credentials
    const correctEmail = "ata@project-orange.com";
    const correctPassword = "ata1234";

    if (email === correctEmail && password === correctPassword) {
      localStorage.setItem("isOrangeLoggedIn", "true");

      router.push("/");
    } else {
      alert("Wrong email or password!");
    }
  };

  return (
    <section className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Column: Login Form */}
      <div className="flex flex-col justify-center w-full max-w-md p-8 mx-auto lg:w-1/2">
        <div className="w-4/5 mx-auto flex items-center mb-10">
          <div className="relative h-16 w-16">
            <Image
              src="/images/logo.jpg"
              objectFit="cover"
              layout="fill"
              alt="logo"
            />
          </div>
          <div className="ml-3.5 mt-1">
            <h1 className="font-medium text-xl leading-none">Project Orange</h1>
          </div>
          <span></span>
        </div>
        <div className="w-full bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-amber-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: Image */}
      <div
        className="hidden lg:flex w-full bg-cover bg-center bg-no-repeat lg:w-1/2"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/05/0c/be/050cbea2e947d918f7d3f94424d54bc8.jpg')",
        }}
      >
        {/* Placeholder content for the image */}
      </div>
    </section>
  );
};

export default page;
