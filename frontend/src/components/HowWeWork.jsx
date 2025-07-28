"use client";

import React, { useEffect, useRef, useState } from "react";

// Custom hook to track if the component has mounted on the client
const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};

// Custom hook for timeline progress
const useTimelineProgress = () => {
  const mounted = useMounted();
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!mounted) return;

    const calculateProgress = () => { // Extracted calculation logic
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const containerTop = rect.top;
        const containerHeight = rect.height;
        const windowHeight = window.innerHeight;

        const scrollProgress = Math.max(
          0,
          Math.min(
            1,
            (windowHeight - containerTop) / (containerHeight + windowHeight)
          )
        );
        setProgress(scrollProgress);
      }
    };

    // Option 1: Throttling (fires at most once every X ms)
    const throttle = (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };

    const throttledHandleScroll = throttle(calculateProgress, 16); // Aim for ~60fps (1000ms / 60 frames = 16.6ms)

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    calculateProgress(); // Initial call

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [mounted]);

  return [containerRef, progress];
};


// Custom hook for step visibility
const useStepVisibility = () => {
  // Removed stepIndex, totalSteps as they are not used here
  const mounted = useMounted(); // Use the mounted state
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!mounted) return; // Only run if mounted on client

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.3,
        rootMargin: "-50px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [mounted]); // Re-run effect when mounted changes

  return [ref, isVisible];
};

// Header Component (No changes needed, as it's static)
const Header = () => {
  return (
    <div className='text-center mb-16'>
      <div className='inline-flex items-center bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm mb-6 font-geist shadow-lg border border-gray-700'>
        How we work
      </div>
      <h1 className='text-5xl font-medium text-gray-900 mb-4 font-geist'>
        How sKrapy Works
      </h1>
      <p className='text-gray-500 text-lg font-geist'>
        Simple 6 step to turn your scrap into cash
      </p>
    </div>
  );
};

// Step Component
const Step = ({
  number,
  title,
  description,
  isLeft = false,
  // Removed stepIndex, totalSteps as they are not used in Step component anymore
}) => {
  const [ref, isVisible] = useStepVisibility(); // Call hook without unused props

  return (
    <div ref={ref} className={`flex items-center mb-16 md:mb-24`}>
      {isLeft ? (
        <>
          {/* Left side card - apply animation here */}
          <div
            className={`flex-1 pr-4 md:pr-12 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-x-0 scale-100"
                : `opacity-0 scale-95 translate-x-8`
            }`}
          >
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md font-geist'>
              <h3 className='text-2xl font-medium text-gray-900 mb-3 md:mb-9 font-geist'>
                Step #{number}
              </h3>
              <h4 className='text-xl font-medium text-gray-800 mb-4 font-geist'>
                {title}
              </h4>
              <p className='text-gray-600 font-normal leading-relaxed font-geist'>{description}</p>
            </div>
          </div>

          {/* Timeline dot - no animation */}
          <div className='relative flex-shrink-0'>
            <div className={`w-4 h-4 bg-gray-900 rounded-full scale-100`}></div>
          </div>

          {/* Right side empty */}
          <div className='flex-1 pl-4 md:pl-12'></div>
        </>
      ) : (
        <>
          {/* Left side empty */}
          <div className='flex-1 pr-4 md:pr-12'></div>

          {/* Timeline dot - no animation */}
          <div className='relative flex-shrink-0'>
            <div className={`w-4 h-4 bg-gray-900 rounded-full scale-100`}></div>
          </div>

          {/* Right side card - apply animation here */}
          <div
            className={`flex-1 pl-4 md:pl-12 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-x-0 scale-100"
                : `opacity-0 scale-95 -translate-x-8`
            }`}
          >
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md font-geist'>
              <h3 className='text-2xl font-medium text-gray-900 mb-3 md:mb-9 font-geist'>
                Step #{number}
              </h3>
              <h4 className='text-xl font-medium text-gray-800 mb-4 font-geist'>
                {title}
              </h4>
              <p className='text-gray-600 font-normal leading-relaxed font-geist'>{description}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Timeline Component
const Timeline = () => {
  const mounted = useMounted(); // Use the mounted state here as well
  const [containerRef, progress] = useTimelineProgress();

  const steps = [
    {
      number: 1,
      title: "Customer Request",
      description:
        "Receiving scrap requests from customers through our platform",
      isLeft: false,
    },
    {
      number: 2,
      title: "User Registration",
      description: "Quick and easy registration process for new users",
      isLeft: true,
    },
    {
      number: 3,
      title: "Vendor Matching",
      description: "AI powered matching with verified vendors in your area",
      isLeft: false,
    },
    {
      number: 4,
      title: "Scrap Handover",
      description: "Convenient doorstep pickup by the verified vendors",
      isLeft: true,
    },
    {
      number: 5,
      title: "Vendor Processing",
      description: "Professional handling and processing of collected scrap",
      isLeft: false,
    },
    {
      number: 6,
      title: "Completion & Feedback",
      description: "Secure payment processing and feedback collection",
      isLeft: true,
    },
  ];

  return (
    <div ref={containerRef} className='relative max-w-4xl mx-auto py-16'>
      {/* Animated Timeline Line */}
      <div className='absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5'>
        {/* Background line */}
        <div className='w-full h-full bg-gray-200'></div>

        {/* Animated progress line - only render if mounted on client to prevent mismatch */}
        {mounted && (
          <div
            className='absolute top-0 left-0 w-full bg-gray-900 transition-all duration-300 ease-out'
            style={{
              height: `${progress * 100}%`,
            }}
          ></div>
        )}
      </div>

      {/* Steps */}
      {steps.map(
        (
          step // Simplified map, no need for index unless explicitly used
        ) => (
          <Step
            key={step.number}
            number={step.number}
            title={step.title}
            description={step.description}
            isLeft={step.isLeft}
            // Removed stepIndex, totalSteps props here too
          />
        )
      )}
    </div>
  );
};

// Main Component
const HowSKrapyWorks = () => {
  return (
    <div className='min-h-screen bg-gray-50 py-16 px-4'>
      <div className='max-w-6xl mx-auto'>
        <Header />
        <Timeline />
      </div>
    </div>
  );
};

export default HowSKrapyWorks;
