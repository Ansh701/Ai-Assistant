export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
        <i className="ri-robot-line text-2xl text-primary"></i>
      </div>
      <h2 className="text-xl font-semibold mb-2">Welcome to Homework Helper</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
        Type a question, upload a photo, or use the camera scanner to get started.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <i className="ri-chat-1-line text-xl text-primary mb-2"></i>
          <span className="text-sm text-center">Type a question</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <i className="ri-image-line text-xl text-primary mb-2"></i>
          <span className="text-sm text-center">Upload an image</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <i className="ri-camera-line text-xl text-primary mb-2"></i>
          <span className="text-sm text-center">Scan with camera</span>
        </div>
      </div>
    </div>
  );
}
