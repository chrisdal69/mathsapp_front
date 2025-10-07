import React from "react";
import { Layout, theme } from "antd";
const { Content } = Layout;
import { LoaderCircle, Lock, Mail } from "lucide-react";
import Link from "next/link";

import { ChangeEvent, FormEvent, useState } from "react";

export default function LoginPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [user, setUser] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = { email: "", password: "" };
    if (!user.email.trim()) newErrors.email = "Please enter a valid email.";
    if (!user.password.trim()) newErrors.password = "Password cannot be empty.";
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("password", user.password);
    console.log(formData);
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      console.log("Réponse du back:", data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur upload:", err);
      return;
    }
  };

  return (
    <Layout>
      <Content style={{ padding: "0 48px" }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
            marginTop: "20px",
          }}
        >
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              {/* Dummy Logo */}
              <h2 className="mb-8 text-center text-2xl font-semibold text-gray-800">
                Login
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Email */}

                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-500">
                      <Mail size={20} />
                    </span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={user.email}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 pl-10 focus:ring-2 focus:ring-blue-200 ${
                        errors.email
                          ? "border-red-500 ring-red-200"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}

                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-500">
                      <Lock size={20} />
                    </span>

                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={user.password}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 pl-10 focus:ring-2 focus:ring-blue-200 ${
                        errors.password
                          ? "border-red-500 ring-red-200"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}

                  <div className="mt-2 text-right">
                    <Link
                      href="/forgot"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-gray-300"
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin" size={20} />
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Sign up */}

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">New here? </span>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
