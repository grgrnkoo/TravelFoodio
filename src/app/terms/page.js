'use client'

import Link from "next/link";

const TermsOfService = () => {
    return (
      <div className="container mx-auto px-6 md:px-12 py-10 mt-[66px]">
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        
        <p className="text-gray-700 mb-4">
          Welcome to FoodSm.art. By using our service, you agree to comply with and be bound by the following terms and conditions.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing or using our application, you agree to these Terms of Service. If you do not agree, please do not use our service.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">2. Use of Our Services</h2>
        <p className="text-gray-700 mb-4">
          You agree to use our service only for lawful purposes and in compliance with all applicable laws and regulations.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">3. User Accounts</h2>
        <p className="text-gray-700 mb-4">
          If you create an account, you are responsible for maintaining its security and accuracy. You must not share your login credentials with others.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">4. Prohibited Activities</h2>
        <p className="text-gray-700 mb-4">
          You may not use our services for any unlawful, fraudulent, or malicious purposes. We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">5. Intellectual Property</h2>
        <p className="text-gray-700 mb-4">
          All content, trademarks, and intellectual property on this site belong to FoodSm.art. Unauthorized use is prohibited.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">6. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          We are not liable for any damages resulting from your use of our services. Use at your own risk.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">7. Modifications to Terms</h2>
        <p className="text-gray-700 mb-4">
          We may update these Terms of Service from time to time. Continued use of our service constitutes acceptance of any changes.
        </p>
        
        <p className="text-gray-700 mt-6">If you have any questions, contact us using <Link href="/feedback" className="text-blue-600 hover:underline">feedback</Link>.</p>
      </div>
    );
  };
  
  export default TermsOfService;
  