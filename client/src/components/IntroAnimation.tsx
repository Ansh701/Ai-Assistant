export default function IntroAnimation() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 z-50">
      <div className="w-24 h-24 flex items-center justify-center relative mb-6">
        <svg
          className="w-20 h-20 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M17 2.43994V12.4199C17 14.3899 15.59 15.1599 13.86 14.1199L12.54 13.3299C12.24 13.1499 11.76 13.1499 11.46 13.3299L10.14 14.1199C8.41 15.1599 7 14.3899 7 12.4199V2.43994"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <div className="absolute inset-0 bg-primary rounded-full animate-pulse opacity-30"></div>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-primary-600 dark:text-primary-400">
        Homework Helper
      </h1>
      <div className="flex space-x-2">
        <div className="intro-animation-dot w-3 h-3 bg-primary rounded-full"></div>
        <div className="intro-animation-dot w-3 h-3 bg-primary rounded-full"></div>
        <div className="intro-animation-dot w-3 h-3 bg-primary rounded-full"></div>
      </div>
    </div>
  );
}
