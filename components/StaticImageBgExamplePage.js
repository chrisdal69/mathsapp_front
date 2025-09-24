import Image from "next/image";
import src from "../public/arrakis.jpeg";

export default function StaticImageBgExamplePage() {
  return (
    <section className="relative w-screen h-screen flex justify-center items-center overflow-hidden">
      <h1 className="relative z-30 text-4xl sm:text-8xl text-center">
        Welcome to Arrakis
      </h1>
      <div className="absolute w-full h-full z-20 top-0 left-0 bottom-0 right-0 bg-black/10" />
      <div className="absolute w-full h-full z-10 top-0 left-0 bottom-0 right-0 overflow-hidden">
        <Image
          src={src}
          alt="desert"
          placeholder="blur" /* I'm using a static image, so I can use the blur placeholder out of the box */
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
}