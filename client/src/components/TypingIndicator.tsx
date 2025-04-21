export default function TypingIndicator() {
  return (
    <div className="flex mb-4">
      <div className="chat-bubble-ai max-w-[80%] md:max-w-[70%] bg-white dark:bg-slate-800 p-3 rounded-lg shadow rounded-tl-none">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-typing"></div>
          <div 
            className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-typing" 
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-typing" 
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
