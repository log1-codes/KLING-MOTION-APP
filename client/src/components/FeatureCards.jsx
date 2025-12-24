import React from 'react';
import { Zap, Camera, Scan, Sparkles } from 'lucide-react';

const FeatureCards = () => {
    const features = [
        {
            title: "10X Faster Production",
            desc: "Generate cinematic videos in minutes, not hours, using advanced GPU clusters.",
            icon: <Zap className="text-[#CCFF00]" />,
        },
        {
            title: "Cinematic Motion Control",
            desc: "Control camera movements like a pro with 20+ preset cinematic paths.",
            icon: <Camera className="text-blue-500" />,
        },
        {
            title: "Character Consistency",
            desc: "Our AI maintains character features across different lighting and angles.",
            icon: <Scan className="text-[#CCFF00]" />,
        },
        {
            title: "VFX & Inpainting",
            desc: "Select an area, describe the change, and let AI handle the heavy lifting.",
            icon: <Sparkles className="text-blue-500" />,
        }
    ];

    return (
        <section id="features" className="py-24 max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f, i) => (
                    <div key={i} className="group p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/50 transition-all duration-300">
                        <div className="mb-6 p-3 bg-black rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            {f.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeatureCards;