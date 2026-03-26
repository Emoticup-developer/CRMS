import React from "react";
import { FiFileText, FiMapPin, FiPaperclip } from "react-icons/fi";
import AdminSidebar from "../../../components/AdminSidebar";
import { MdOutlineInfo } from "react-icons/md";
import { LuUserPen } from "react-icons/lu";
import { FiUpload } from "react-icons/fi";
import { useRef, useState } from "react";

const CreateTicket = () => {
  const [priority, setPriority] = useState("MED");
  const fileInputRef = useRef(null);
const [files, setFiles] = useState([]);
const handleBrowseClick = () => {
  fileInputRef.current.click();
};

const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  setFiles((prev) => [...prev, ...selectedFiles]);
};

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[325px] z-40">
        <AdminSidebar />
      </div>

      <main className="flex-1 ml-0 lg:ml-[325px] mt-[62px] p-3 overflow-y-auto bg-gray-50 backdrop-blur-sm shadow-inner [&::-webkit-scrollbar]:hidden scrollbar-none">
         <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#18181a]">
          Create New Ticket
        </h1>
        <p className="text-[13px] text-[#7a7a7a]">
          Log a new service request or technical incident in the portal.
        </p>
      </div>

      {/* General Info */}
<div className="bg-[#f5f5f3] rounded-xl border border-[#e8e7e2] p-6 mb-5">

  {/* Title */}
  <div className="flex items-center gap-1 mb-3">
    <MdOutlineInfo className="text-gray-600 text-[16px]" />
    <h3 className="text-[15px] font-semibold text-[#18181a]">
      General Information
    </h3>
  </div>

  {/* Fields */}
  <div className="grid grid-cols-4 gap-6">

    {/* Ticket ID */}
    <div>
      <p className="text-[11px] tracking-wider text-gray-500 mb-2">TICKET ID</p>
      <div className="bg-[#e9e9e6] px-4 py-3 rounded-md text-sm font-medium text-gray-700">
        TK-88294
      </div>
    </div>

    {/* Type */}
    <div>
      <p className="text-[11px] tracking-wider text-gray-500 mb-2">TYPE</p>
      <select className="w-full bg-[#e9e9e6] px-4 py-3 rounded-md text-sm outline-none">
        <option>Technical Issue</option>
      </select>
    </div>

    {/* Source */}
    <div>
      <p className="text-[11px] tracking-wider text-gray-500 mb-2">SOURCE</p>
      <select className="w-full bg-[#e9e9e6] px-4 py-3 rounded-md text-sm outline-none">
        <option>Web Portal</option>
      </select>
    </div>

    {/* Priority */}
    <div>
  <p className="text-[11px] tracking-wider text-gray-500 mb-2">PRIORITY</p>

  <div className="flex gap-2">
    {["HIGH", "MED", "LOW"].map((item) => (
      <button
        key={item}
        onClick={() => setPriority(item)}
        className={`px-4 py-2 rounded-md text-xs font-semibold transition-all
          ${
            priority === item
              ? item === "HIGH"
                ? "bg-[#f5c6c6] text-red-700"
                : item === "MED"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
              : "bg-[#e5e5e5] text-gray-700 hover:bg-gray-300"
          }
        `}
      >
        {item}
      </button>
    ))}
  </div>
</div>
  </div>
</div>

     
        {/* Client */}
<div className="bg-[#f5f5f3] rounded-xl border border-[#e8e7e2] p-6 mb-6">

  {/* Title */}
  <div className="flex items-center gap-2 mb-6">
    <LuUserPen className="text-gray-600 text-[16px]" />
    <h3 className="text-[15px] font-semibold text-[#18181a]">
      Client Information
    </h3>
  </div>

  {/* Fields */}
  <div className="grid grid-cols-2 gap-6">

    {/* Client */}
    <div>
      <p className="text-[11px] tracking-wider text-gray-500 mb-2">CLIENT</p>
      <select className="w-full bg-[#e9e9e6] px-4 py-3 rounded-md text-sm outline-none">
        <option>Global Logistics Corp</option>
      </select>
    </div>

    {/* Handled By */}
    <div>
      <p className="text-[11px] tracking-wider text-gray-500 mb-2">HANDLED BY</p>
      <input
        className="w-full bg-[#e9e9e6] px-4 py-3 rounded-md text-sm outline-none"
        placeholder="Assign user"
      />
    </div>
  </div>
</div>
       

    

     {/* Ticket Content */}
<div className="bg-[#f5f5f3] rounded-xl border border-[#e8e7e2] p-6 mb-5">

  {/* Title */}
  <div className="flex items-center gap-2 mb-6">
      <FiFileText className="text-gray-600 text-[16px]" />
    <h3 className="text-[15px] font-semibold text-[#18181a]">
      Ticket Content
    </h3>
  </div>

  {/* Fields */}
  <div className="grid grid-cols-1 gap-6">

    {/* Subject */}
    <div>
      <p className="text-[11px] tracking-wider text-gray-500 mb-2">SUBJECT</p>
      <input
        className="w-full bg-[#e9e9e6] px-4 py-3 rounded-md text-sm outline-none"
        placeholder="Briefly describe the issue"
      />
    </div>

    {/* Description */}
    <div>
      <p className="text-[11px] tracking-wider text-gray-500 mb-2">
        DETAILED DESCRIPTION
      </p>
      <textarea
        className="w-full bg-[#e9e9e6] px-4 py-3 rounded-md text-sm outline-none h-[140px] resize-none"
        placeholder="Provide as much context as possible..."
      />
    </div>

  </div>
</div>
  {/* Attachments */}
<div className="bg-[#f5f5f3] rounded-xl border border-[#e8e7e2] p-6 mb-6">

  {/* Title */}
  <div className="flex items-center gap-2 mb-6">
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border shadow-sm">
      <FiPaperclip className="text-gray-700 text-[15px]" />
    </div>
    <h3 className="text-[15px] font-semibold text-[#18181a]">
      Attachments
    </h3>
  </div>

  {/* Upload Area */}
  <div className="border-2 border-dashed border-[#d6d6d2] rounded-lg p-8 text-center bg-white">

    <FiUpload className="mx-auto text-2xl text-gray-400 mb-3" />

    <p className="text-sm text-gray-500">
      Drag & drop files here or
    </p>

    <button
      onClick={handleBrowseClick}
      className="mt-3 bg-[#1f1f1f] hover:bg-black text-white px-5 py-2 rounded-md text-xs"
    >
      BROWSE FILES
    </button>

    {/* Hidden Input */}
    <input
      type="file"
      multiple
      ref={fileInputRef}
      onChange={handleFileChange}
      className="hidden"
    />
  </div>

  {/* File List */}
  {files.length > 0 && (
    <div className="mt-5 space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-white px-4 py-2 rounded-md border text-sm"
        >
          <span className="truncate">{file.name}</span>
          <span className="text-xs text-gray-400">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        </div>
      ))}
    </div>
  )}
</div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">Auto-saving as draft...</p>

        <div className="flex gap-3">
          <button className="text-sm px-4 py-2 text-gray-600">
            Discard
          </button>

          <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md text-sm">
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
      </main>
    </div>
   
  );
};

export default CreateTicket;