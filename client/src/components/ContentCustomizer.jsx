import React from 'react';
import { User, Mic, Globe, Image as ImageIcon } from 'lucide-react';

const ContentCustomizer = () => {
    const elements = [
        { title: "Character", icon: <User />, desc: "Swap your character into any cinematic world." },
        { title: "Voice", icon: <Mic />, desc: "Clone your own voice or choose from our studio library." },
        { title: "Language", icon: <Globe />, desc: "Break barriers with instant AI-powered lip-sync." },
        { title: "Background", icon: <ImageIcon />, desc: "Instantly swap environments to fit your vision." }
    ];

    return (
        <div className="py-20 px-8 max-w-7xl mx-auto">
            <h2 className="text-center text-4xl font-bold mb-4">Craft Your Perfect Video</h2>
            <p className="text-center text-gray-400 mb-12">Element by Element</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {elements.map((el, i) => (
                    <div key={i} className="glass-effect p-8 rounded-3xl hover:border-primary-blue transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-primary-blue">
                            {el.icon}
                        </div>
                        <h3 className="font-bold text-xl mb-2">{el.title}</h3>
                        <p className="text-sm text-gray-500">{el.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContentCustomizer;