import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-100px)] sm:flex flex-col items-center justify-center text-center py-[100px] md:py-20">
      <div className="relative">
        <Image
          src="/illustrationHeader.png"
          alt="IELTS Preparation"
          width={176}
          height={176}
          className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain hidden sm:absolute -top-12 -left-16 sm:-top-16 sm:-left-20 md:-top-20 md:-left-24 -z-10"
        />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black">
          Ace your{" "}
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">
            IELTS
          </span>{" "}
          exam!
        </h1>
      </div>
      <p className="mt-4 max-w-md sm:max-w-lg md:max-w-xl text-base sm:text-lg md:text-xl text-gray-600 font-semibold">
        The ultimate platform to prepare for your IELTS test. Access mock tests,
        practice questions, and expert tips to achieve your desired score.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button className="btn-primary">Get Started</button>
        <button className="btn-secondary">Learn More</button>
      </div>
    </section>
  );
}
