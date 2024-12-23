// NotificationModal.tsx
import { FC } from "react";

interface NotificationModalProps {
  onClose: () => void;
  state: 'entering' | 'entered' | 'exiting' | 'exited';
  notify: string;
  index: number;
}

const NotificationModal: FC<NotificationModalProps> = ({ onClose, state, notify, index }) => {
  const bottomPosition = 5 + (index * 70);

  return (
    <div
      id="notification-modal"
      tabIndex={-1}
      aria-hidden="true"
      className={`notification-modal flex fixed right-5 z-50 w-auto max-w-xs bg-white border border-[#ACACAC] rounded-lg shadow-lg p-3 
        transition-all duration-300 
        ${state === "entered" ? "notification-enter" : 
        state === "exiting" ? "notification-exit" : ""}
        `}
      style={{ bottom: `${bottomPosition}px` }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-1 text-sm text-gray-700">
          {notify}
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 bg-transparent rounded-full text-sm w-6 h-6 flex justify-center items-center transition-colors duration-200"
          onClick={onClose}
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
