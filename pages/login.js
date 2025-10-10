import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";

// ✅ Schéma de validation Yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Adresse email invalide")
    .required("L'email est obligatoire"),
  password: yup.string().required("Mot de passe obligatoire"),
});

export default function SignupForm() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const json = await res.json();

      if (res.ok) {
        console.log(json);
      } else {
        console.error(json.error || json);
      }
    } catch (err) {
      console.error("Erreur serveur.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 rounded-xl shadow-lg p-6 bg-white">
      <h2 className="text-2xl font-semibold text-center mb-6">Se loguer</h2>

      {/* ✅ clé dynamique pour éviter réutilisation après navigation */}
      <form
        key={router.asPath}
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        noValidate
      >
        {/* Champs leurres pour neutraliser l'autofill */}
        <input
          type="text"
          name="fakeuser"
          autoComplete="off"
          style={{ display: "none" }}
        />
        <input
          type="password"
          name="fakepass"
          autoComplete="new-password"
          style={{ display: "none" }}
        />

        {/* EMAIL */}
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            autoComplete="new-email"
            className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mot de passe
          </label>

          <div className="relative">
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              {...register("password")}
              autoComplete="new-password"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 pr-10 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />

            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <div className="mt-2 text-right">
              <Link
                href="/forgot"
                className="text-sm text-blue-600 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isSubmitting ? "Envoi..." : "Se loguer"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Pas encore inscrit ? </span>
        <Link
          href="/signup"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Inscription
        </Link>
      </div>

      {/* 🔧 CSS pour neutraliser le fond jaune Chrome */}
      <style jsx global>{`
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px white inset !important;
          -webkit-text-fill-color: #000 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
