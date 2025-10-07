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
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter a valid email.");

      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      setSuccess(true);
    }, 2000);
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
            <div className="flex min-h-screen  justify-center">
              <div className="w-full max-w-md rounded-lg bg-white p-6">
                <h2 className="mb-8 text-center text-2xl font-semibold text-gray-800">
                  Forgot Password?
                </h2>

                {success ? (
                  <p className="mb-6 text-center text-green-600">
                    Email has been sent. Please check your inbox.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Email Input */}

                    <div className="mb-6">
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Email Address
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
                          value={email}
                          onChange={handleChange}
                          className={`w-full rounded-lg border px-4 py-2.5 pl-10 focus:ring-2 focus:ring-blue-200 ${
                            error
                              ? "border-red-500 ring-red-200"
                              : "border-gray-300"
                          }`}
                        />
                      </div>

                      {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                      )}
                    </div>

                    {/* Submit Button */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-10 w-full items-center justify-center rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-gray-300"
                    >
                      {loading ? (
                        <LoaderCircle className="animate-spin" size={20} />
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </form>
                )}

                {/* Back to Login */}

                <div className="mt-4 text-center">
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
