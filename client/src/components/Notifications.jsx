import toast from 'react-hot-toast';

const showRichToast = (title, message, type = 'success') => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-[1.5rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-800`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {type === 'success' ? (
              <i className="ri-checkbox-circle-fill text-2xl text-emerald-500"></i>
            ) : (
              <i className="ri-error-warning-fill text-2xl text-red-500"></i>
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-snug">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 dark:border-gray-800">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          Đóng
        </button>
      </div>
    </div>
  ));
};
export default showRichToast;