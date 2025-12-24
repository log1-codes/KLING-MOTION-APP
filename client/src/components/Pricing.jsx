const Pricing = () => {
    const plans = [
        { name: 'Free', price: '$0', limit: '10 credits / day', features: ['Standard quality', 'Community support'] },
        { name: 'Pro', price: '$17.4', limit: '3 Videos at once', features: ['4K Render', 'Priority support', 'No watermark'], active: true },
        { name: 'Ultimate', price: '$24.5', limit: '4 Videos at once', features: ['All models', 'Early access', 'Discount credits'] }
    ];

    return (
        <section className="py-24 px-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Choose your plan</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((p) => (
                    <div key={p.name} className={`p-8 rounded-3xl border transition ${p.active ? 'border-[#CCFF00] bg-zinc-900' : 'border-white/10 bg-black'}`}>
                        <h3 className="text-xl font-bold">{p.name}</h3>
                        <p className="text-3xl font-bold my-4">{p.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                        <p className="text-xs text-[#CCFF00] mb-6 uppercase tracking-widest">{p.limit}</p>
                        <ul className="space-y-3 mb-8 text-gray-400 text-sm">
                            {p.features.map(f => <li key={f}>• {f}</li>)}
                        </ul>
                        <button className={`w-full py-3 rounded-xl font-bold ${p.active ? 'bg-[#CCFF00] text-black' : 'bg-white text-black'}`}>
                            Select Plan
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};
export default Pricing;