import React from 'react';
import { Play, ImageIcon } from 'lucide-react';

const HowToSwap = () => {
  return (
    <div className="bg-[#0d0d0d] text-white py-20 px-8 font-sans border-t border-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-12">
          HOW TO SWAP CHARACTER IN THE VIDEO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-[#161616] rounded-3xl relative overflow-hidden flex items-center justify-center border border-gray-800">
                <div className="text-center z-10">
                  <Play className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase text-gray-300">Your Video</p>
                  <p className="text-[10px] text-gray-500">Video with character to replace</p>
                </div>
                {/* Visual overlap element */}
                <div className="absolute -bottom-4 -left-4 w-32 h-24 bg-gray-800 rounded-lg rotate-[-10deg] border-4 border-[#eaff33] overflow-hidden shadow-xl">
                    <img src="/api/placeholder/128/96" alt="Sample" className="w-full h-full object-cover opacity-50" />
                </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase">Upload Your Video</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Now, choose the video with a character to be replaced with our tool.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-[#161616] rounded-3xl relative overflow-hidden flex items-center justify-center border border-gray-800">
                <div className="text-center z-10">
                  <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase text-gray-300">Character Image</p>
                  <p className="text-[10px] text-gray-500">Upload the character you want to use</p>
                </div>
                {/* Visual overlap element */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-24 bg-gray-800 rounded-lg rotate-[5deg] border-4 border-[#eaff33] overflow-hidden shadow-xl">
                    <img src="/api/placeholder/128/96" alt="Character" className="w-full h-full object-cover" />
                </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase">Upload Character Image</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Select and upload a clear photo of the character you want to use as a main character in the output video.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-6">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-gray-800">
                <img 
                    src="/api/placeholder/400/300" 
                    alt="Final Output" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase leading-tight">Generate Desired Video and Beyond</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Click the "Generate" button and swap the character in the video. Edit more and visit our studio to have full control of the video.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToSwap;