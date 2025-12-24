const FAQ = () => {
    const questions = [
        "How does the Video Character Swap work?",
        "Can I use generated content for commercial purposes?",
        "Do I need any editing skills to use this?",
        "Is this the same as a deepfake?"
    ];

    return (
        <section className="py-24 max-w-3xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Got Any Questions Left?</h2>
            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div key={i} className="border-b border-white/10 pb-4 flex justify-between items-center cursor-pointer group">
                        <span className="text-gray-400 group-hover:text-white transition">{q}</span>
                        <span className="text-xl">+</span>
                    </div>
                ))}
            </div>
        </section>
    );
};


export default FAQ;