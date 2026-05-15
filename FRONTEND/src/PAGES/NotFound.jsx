import { useEffect, useRef } from "react";

const NotFound = () => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const pos = `${x}px ${y}px`;

      if (overlayRef.current) {
        overlayRef.current.style.maskImage = 
          `radial-gradient(circle 120px at ${pos}, transparent 0%, black 150px)`;

        overlayRef.current.style.webkitMaskImage =
          overlayRef.current.style.maskImage;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-gray-900 text-white overflow-hidden">
      
      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <h2 className="text-6xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Go Home
        </a>
      </div>

      {/* Spotlight overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black z-20 pointer-events-none"
        style={{
          maskImage:
            "radial-gradient(circle 120px at 50% 50%, transparent 0%, black 150px)",
          WebkitMaskImage:
            "radial-gradient(circle 120px at 50% 50%, transparent 0%, black 150px)",
        }}
      ></div>
    </div>
  );
};

export default NotFound;