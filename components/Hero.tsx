export default function Hero() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center py-[80px]">
      <div className="relative">
        <img 
          src="/illustationHeader.png" 
          alt="IELTS Preparation" 
          className="w-[170px] h-[170px] object-contain absolute -top-[80px] -left-[90px] -z-10"
        />
        <h1 className=" text-[50px] font-black ">
          Ace your{" "}
          <span className=" p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">IELTS</span>{" "}
          exam !
        </h1>
      </div>
      <p className="mt-3 leading-none text-center max-w-lg sm:text-xl/relaxed text-gray-600 font-semibold">
        The ultimate platform to prepare for your IELTS test. Access mock tests,
        practice questions, and expert tips to achieve your desired score.
      </p>
      <div className=" flex gap-3 mt-6">
        <button className="btn-primary ">Get Started</button>
        <button className="btn-secondary ">Learn More</button>
      </div>
    </section>
  );
}
