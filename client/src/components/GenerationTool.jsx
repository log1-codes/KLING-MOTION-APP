import { useNavigate } from "react-router-dom";
const GenerationTool = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-square border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 transition-colors cursor-pointer bg-black/40">
                    <span className="text-gray-500 mb-2">📸 Upload Image</span>
                    <p className="text-xs text-gray-600">Character to swap</p>
                </div>

                <div className="aspect-square border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 transition-colors cursor-pointer bg-black/40">
                    <span className="text-gray-500 mb-2">🎥 Upload Video</span>
                    <p className="text-xs text-gray-600">The target motion</p>
                </div>
            </div>

            <button
                className="w-full mt-8 bg-[#CCFF00] text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
                onClick={() => navigate('/swap')}
            >
                TRY NOW
            </button>
        </div>
    );
};

export default GenerationTool;