const Navbar = () => (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/5 py-4 px-8 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter text-white">
            BE<span className="text-blue-500">HOOKED</span>.CO
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-400">
            <a href="#generate" className="hover:text-white transition">Tools</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>
        <button className="bg-[#CCFF00] text-black px-6 py-2 rounded-full font-bold text-sm hover:brightness-110 transition">
            Login
        </button>
    </nav>
);

export default Navbar;