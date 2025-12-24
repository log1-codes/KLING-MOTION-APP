const Footer = () => (
    <footer className="border-t border-white/5 bg-black pt-16 pb-8 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
                <div className="text-xl font-black mb-6">BE<span className="text-blue-500">HOOKED</span></div>
                <p className="text-gray-500 text-sm">The ultimate AI-powered camera control for filmmakers and creators.</p>
            </div>
            <div>
                <h4 className="font-bold mb-6">Product</h4>
                <ul className="text-gray-500 text-sm space-y-4">
                    <li className="hover:text-[#CCFF00] cursor-pointer">Video Swap</li>
                    <li className="hover:text-[#CCFF00] cursor-pointer">Image Gen</li>
                    <li className="hover:text-[#CCFF00] cursor-pointer">Pricing</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-6">Company</h4>
                <ul className="text-gray-500 text-sm space-y-4">
                    <li className="hover:text-[#CCFF00] cursor-pointer">About</li>
                    <li className="hover:text-[#CCFF00] cursor-pointer">Blog</li>
                    <li className="hover:text-[#CCFF00] cursor-pointer">Careers</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-6">Legal</h4>
                <ul className="text-gray-500 text-sm space-y-4">
                    <li className="hover:text-[#CCFF00] cursor-pointer">Privacy</li>
                    <li className="hover:text-[#CCFF00] cursor-pointer">Terms</li>
                </ul>
            </div>
        </div>
        <div className="text-center text-gray-600 text-xs border-t border-white/5 pt-8">
            © 2025 BEHOOKED.CO. All rights reserved.
        </div>
    </footer>
);

export default Footer;