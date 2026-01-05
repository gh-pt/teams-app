import Image from 'next/image'
import { BsThreeDots } from 'react-icons/bs'

export default function page() {
    return (
        <div className="h-full w-full bg-[#292929] rounded-lg">
         <div className="h-[61px] min-h-[61px] w-full flex items-center justify-between px-[20px] gap-2 border-b border-[#3F3F3F]">
           <div className="flex items-center gap-2">
             <Image
               src="/logos/logo-transparent-1.png"
               alt="Profile"
               width={32}
               height={32}
               className="bg-white rounded-full"
             />
             <div className="font-bold hover:cursor-pointer">Name</div>
           </div>
           <div className="h-full flex items-center">
             <div className="h-full relative flex items-center before:content-[''] before:w-px before:h-[24px] before:bg-[#3F3F3F] before:mr-4">
               <BsThreeDots size={16} className="hover:text-[#7F85F5] hover:cursor-pointer" />
             </div>
           </div>
         </div>
       </div>
  )
}
