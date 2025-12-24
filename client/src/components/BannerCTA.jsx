import React from 'react';

const BannerCTA = () => (
    <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto rounded-[40px] p-16 text-center relative overflow-hidden bg-zinc-900 border border-white/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <h2 className="text-5xl font-black mb-6 relative z-10 uppercase italic">
                Swap the Reality Now!
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-10 relative z-10">
                Join professionals and creators who use our platform to generate stunning, high-fidelity results for their projects.
            </p>
            <button className="btn-neon relative z-10">
                Swap Now!
            </button>
        </div>
    </section>
);

export default BannerCTA;