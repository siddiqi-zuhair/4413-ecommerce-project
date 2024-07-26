import { useState } from "react";

interface DropdownProps {
  label: string;
  options: string[];
  setChosenSort: (value: string) => void;
}

const Dropdown = ({ label, options, setChosenSort }: DropdownProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button className="bg-stone-50 hover:bg-gray-300 p-2 rounded-lg">
        {label}
      </button>
      {visible && (
        <div className="absolute bg-stone-50 border rounded-lg z-10">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setChosenSort(option)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-300"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
