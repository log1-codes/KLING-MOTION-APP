import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import GenerationTool from './components/GenerationTool';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

const Home = () => {
    return (
        <div className="bg-black text-white min-h-screen font-sans selection:bg-blue-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent blur-3xl -z-10" />
            <Navbar />
            <main className="max-w-7xl mx-auto px-6">
                <Hero />
                <section id="tool" className="py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Swap Characters In Any Video</h2>
                        <p className="text-gray-400">Upload your content and let our AI transform your characters instantly.</p>
                    </div>
                    <GenerationTool />
                </section>
                <FeatureCards />
                <Pricing />
            </main>
            <Footer />
        </div>
    );
};

export default Home;