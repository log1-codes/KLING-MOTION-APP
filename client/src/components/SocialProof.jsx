const SocialProof = () => {
    const testimonials = [
        { name: "Jessica Moore", text: "It's gone from a side tool to something I rely on daily." },
        { name: "Daniel Harris", text: "Delivered a project two days early thanks to this AI." }
    ];

    return (
        <section className="py-24 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                    <p className="text-neon-green uppercase tracking-widest text-xs font-bold mb-4">Loved by People</p>
                    <h2 className="text-4xl font-bold">A Platform Trusted By 15 Million Creators</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="p-10 rounded-3xl bg-zinc-900/30 border border-white/5 italic text-lg text-gray-300">
                            "{t.text}"
                            <p className="mt-6 not-italic font-bold text-sm text-white">— {t.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


export default SocialProof;