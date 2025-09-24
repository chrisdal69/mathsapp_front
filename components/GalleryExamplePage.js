import Image from "next/image";

function Card({ src, alt, title, description }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md dark:bg-gray-950">
      <div className="w-full h-48 xl:h-72 relative">
        <Image
          alt={alt}
          className="object-cover"
          fill
          src={src}
          /* Here we define the sizes of the image in the different tailwind breakpoints according to the grid layout */
          /* With this configuration, the browser will download the (closest) image dimension to the according rendered image size */
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function Grid({ children }) {
  return (
    <section className="border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-8 md:px-6 md:py-12">
      {children}
    </section>
  );
}

export default function GalleryExamplePage() {
  return (
    <>
      <Grid>
        <Card
          alt="A beatufil parc"
          description="This is a beautiful parc, in Arrakis. You can see the sand and the sun and the sandworms sometimes."
          src="/desert.jpeg"
          title="Desert view"
        />
        <Card
          alt="A nice floor"
          description="This is the floor of my house, it's a nice floor, I like it."
          src="/sand.jpeg"
          title="Sand"
        />
        <Card
          alt="Water"
          description="In Arrakis, water is very rare, but sometimes you can find some."
          src="/water.jpeg"
          title="Something very rare"
        />
        <Card
          alt="Lisan al Gaib"
          description="As it was written."
          src="/rat.jpeg"
          title="Lisan al Gaib"
        />
      </Grid>
      <div class="my-10 mx-auto border-red-300 border-4 w-max ">
        <button class=" bg-blue-500 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 ">
          {" "}
          Save Changes
        </button>
      </div>
    </>
  );
}
