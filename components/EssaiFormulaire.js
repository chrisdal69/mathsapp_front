import Image from "next/image";
import { useState } from "react";
import src from "../public/img1.jpg";

export default function EssaiFormulaire() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = () => {
    console.log(email, pass);
  };

  return (
    <section className="flex justify-between items-center h-screen">
      <div className="border w-1/2 flex justify-center ">
        <form className=" w-[400px] ">
          <button
            className="border-2 bg-[#00e] px-4 py-3 rounded-2xl text-white text-2xl "
            onClick={() => handleSubmit()}
          >
            Envoyer
          </button>
          <h1 className="font-bold text-2xl">Get Started</h1>
          <p className="font-light text-sm border-b-1 pb-4 ">
            Welcome to Planet Coffee - Let's create your account
          </p>
          <div className="flex flex-col">
            <label className="text-sm mt-5 font-bold">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="border-1 p-3 rounded-xl outline-red-500 hover:outline"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mt-5 font-bold">Password</label>
            <input
              onChange={(e) => setPass(e.target.value)}
              value={pass}
              type="password"
              className="border-1 p-3 rounded-xl outline-red-500 hover:outline"
            />
          </div>
        </form>
      </div>
      <div className="border w-1/2 h-full ">
        <Image
          alt="poubelle"
          className="h-full object-cover"
          src={src}
          placeholder="blur"
          sizes="(max-width: 768px) 500px, 160px"
        />
      </div>
    </section>
  );
}
