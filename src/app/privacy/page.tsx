'use client'

import Link from "next/link";

const PrivacyPolicy = () => {
    return (
      <div className="container mx-auto mt-[66px] px-6 md:px-12 py-10">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="text-gray-700 mb-4">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our service.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We may collect personal information such as your name, email address, and usage data when you interact with our application.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
          We use the information to provide, maintain, and improve our services, as well as to personalize your experience.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">3. Data Protection</h2>
        <p className="text-gray-700 mb-4">
          We take reasonable measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">4. Third-Party Services</h2>
        <p className="text-gray-700 mb-4">
          We may use third-party services to enhance our application. These services have their own privacy policies, and we recommend reviewing them.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">5. Your Rights</h2>
        <p className="text-gray-700 mb-4">
          You have the right to access, update, or delete your personal data. Contact us if you have any concerns.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">6. Changes to This Policy</h2>
        <p className="text-gray-700 mb-4">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page.
        </p>
        
        <p className="text-gray-700 mt-6">If you have any questions, contact us using <Link href="/feedback" className="text-blue-600 hover:underline">feedback</Link>.</p>
      </div>
    );
  };
  
  export default PrivacyPolicy;
  