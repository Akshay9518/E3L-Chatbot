import { BsArrowRightCircleFill } from "react-icons/bs";

const OneClarityCard = () => {
  return (
    <div className="lg:col-span-5 relative">
      <div className="w-full h-full bg-[#1f1f1f] text-center rounded-3xl shadow-lg p-6 overflow-y-auto no-scrollbar flex flex-col relative z-0">
        <span className="text-4xl font-semibold text-gray-200">
          OneClarity
        </span>
        <div className="flex-grow" />
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Ask anything..."
            className="w-full p-4 pr-12 bg-transparent border border-gray-600 rounded-2xl text-gray-200 placeholder-gray-400 focus:outline-none"
            disabled
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-not-allowed"
            disabled
          >
            <BsArrowRightCircleFill className="w-8 h-8" />
          </button>
        </div>
      </div>
      <div className="absolute inset-0 rounded-3xl m-1 backdrop-blur-[3px] bg-black/50 flex items-center justify-center z-10">
        <span className="text-white text-lg font-semibold tracking-wide">
          This feature is coming soon...
        </span>
      </div>
    </div>
  );
};

export default OneClarityCard;