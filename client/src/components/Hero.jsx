const Hero = () => (
    <header className="pt-24 pb-12 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none">
            Get Social Media Ready <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Content in Minutes
            </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10">
            Unlock endless creative possibilities with our instant character swap.
            Effortlessly replace characters in any video with a single click.
        </p>
        <div className="flex justify-center gap-4">
            <button className="bg-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition">
                Try Free Now
            </button>
            <button className="border border-white/10 px-8 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition">
                View Gallery
            </button>
        </div>
    </header>
);

export default Hero;