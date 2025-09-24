import Image from 'next/image'
import src from "../public/arrakis.jpeg";

export default function ExempleImageNext() {
  return (
    <main className="flex justify-center items-center">
      <Image
        alt="desert"
        className="md:w-80 w-screen"
        src={src}
        placeholder="blur"
        sizes="(max-width: 768px) 100vw, 160px"
      />
    </main>
  )
}
