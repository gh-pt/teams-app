import { PiChatCircleTextFill } from "react-icons/pi";
import { Tooltip } from "@heroui/tooltip";
// import { HiMiniVideoCamera, HiOutlineVideoCamera } from "react-icons/hi2";

export default function MainSideBar() {
  return (
    <div className="flex flex-col bg-[#0A0A0A] items-center h-full">
      <Tooltip
        content="Chat"
        placement="right"
        className="bg-[#1F1F1F] rounded-lg"
      >
        <div className="w-full h-[70px] flex items-center justify-center hover:cursor-pointer hover:bg-[#1F1F1F]">
          <button className="w-fit h-full text-center">
            <div className="flex flex-col items-center">
              <PiChatCircleTextFill size={24} className="text-[#767FEE] mb-1" />
              <span className="text-[10px] text-[#767FEE]">Chat</span>
            </div>
          </button>
        </div>
      </Tooltip>
      {/* <Tooltip
        content="Chat"
        placement="right"
        className="bg-[#1F1F1F] rounded-lg"
      >
        <div className="group w-full h-[70px] flex items-center justify-center hover:cursor-pointer hover:bg-[#1F1F1F]">
          <button className="w-fit h-full text-center">
            <div className="flex flex-col items-center">
              <HiOutlineVideoCamera
                size={18}
                className="group-hover:hidden transition-colors duration-200"
              />
              <HiMiniVideoCamera
                size={18}
                className="hidden group-hover:block text-[#7F85F5] transition-colors duration-200"
              />
              <span className="text-[10px] group-hover:text-[#767FEE]">Chat</span>
            </div>
          </button>
        </div>
      </Tooltip> */}
    </div>
  );
}
