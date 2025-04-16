import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2, Wand2 } from 'lucide-react';

type ImageType = 'square' | 'portrait' | 'landscape' | 'ultrawide';
type StyleType = 'realistic' | 'cartoon' | 'abstract' | 'fantasy' | 'anime' | 'cyberpunk';


function App() {
  const [prompt, setPrompt] = useState('');
  const [imageType, setImageType] = useState<ImageType>('square');
  const [style, setStyle] = useState<StyleType>('realistic');
  const [loading, setLoading] = useState(false);
  const [, setImageUrl] = useState('');
  const [croppedUrl, setCroppedUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const startProgressSimulation = () => {
    setProgress(0);
    let currentProgress = 0;
    
    progressInterval.current = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) {
        currentProgress = 90;
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }
      setProgress(currentProgress);
    }, 500);
  };

  const finishProgress = () => {
    setProgress(100);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const cropImage = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match original image
      canvas.width = img.width;
      canvas.height = img.height;

      // Calculate crop dimensions (10% from each edge)
      const cropX = img.width * 0.1;
      const cropY = img.height * 0.1;
      const cropWidth = img.width * 0.8;
      const cropHeight = img.height * 0.8;

      // Draw the cropped portion
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight, // Source rectangle
        0, 0, canvas.width, canvas.height     // Destination rectangle
      );

      // Convert to data URL and set as cropped image
      const croppedDataUrl = canvas.toDataURL('image/png');
      setCroppedUrl(croppedDataUrl);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCroppedUrl('');
    startProgressSimulation();
    
    const formattedPrompt = `${style}, ${prompt}, high quality, detailed`;
    const encodedPrompt = encodeURIComponent(formattedPrompt);
    
    // Get dimensions based on image type
    let width, height;
    switch (imageType) {
      case 'square':
        width = 1024;
        height = 1024;
        break;
      case 'portrait':
        width = 768;
        height = 1024;
        break;
      case 'landscape':
        width = 1280;
        height = 720;
        break;
      case 'ultrawide':
        width = 1920;
        height = 823;
        break;
    }
    
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}`;
    
    setImageUrl(url);
    cropImage(url);
    finishProgress();
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!croppedUrl) return;
    
    const link = document.createElement('a');
    link.href = croppedUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="flex-1 p-6 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-emerald-500 to-green-700 bg-clip-text text-transparent">
          Generate AI Images in One Click
        </h1>

        <div className="flex-1 flex flex-col md:flex-row gap-8">
          {/* Left side - Form */}
          <div className="md:w-2/5 flex flex-col">
            <form onSubmit={handleSubmit} className={`space-y-4 bg-gray-800/20 p-6 rounded-lg ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
                  Enter your image prompt
                </label>
                <input
                  id="prompt"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition"
                  placeholder="A serene forest landscape at sunset..."
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Image Type</label>
                  <select
                    value={imageType}
                    onChange={(e) => setImageType(e.target.value as ImageType)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition"
                    disabled={loading}
                  >
                    <option value="square">Square</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="ultrawide">Ultra-wide</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as StyleType)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition"
                    disabled={loading}
                  >
                    <option value="realistic">Realistic</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="abstract">Abstract</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="anime">Anime</option>
                    <option value="cyberpunk">Cyberpunk</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'animate-pulse' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Generating Image...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    <span>Generate Image</span>
                  </>
                )}
              </button>

              {loading && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 text-center">
                    Generating your image... {Math.round(progress)}%
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right side - Image Display */}
          <div className="md:w-3/5 flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-gray-800/20 rounded-lg p-6">
              <canvas ref={canvasRef} className="hidden" />
              
              {loading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-gray-400 text-center">
                    Creating your masterpiece...
                  </div>
                </div>
              ) : croppedUrl ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="flex justify-center items-center">
                    <img
                      src={croppedUrl}
                      alt="Generated image"
                      className="rounded-lg max-h-[70vh] w-auto"
                    />
                  </div>
                  
                  <button
                    onClick={handleDownload}
                    className="w-full max-w-md py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium flex items-center justify-center space-x-2 transition"
                  >
                    <Download size={20} />
                    <span>Download Your Image</span>
                  </button>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  Your generated image will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-3 text-center text-sm text-gray-400 border-t border-gray-800 mt-auto">
        Powered by Pollinations AI • Made with ❤️ by forcreator.space
      </footer>
    </div>
  );
}

export default App;