import React, { useEffect } from 'react';

export default function ResumePage() {
  useEffect(() => {
    document.title = 'Michael-Rubin-Resume.PlsHireMe';
  }, []);

  return (
    <iframe
      src="/Michael_Rubin_Resume.pdf"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
      title="Michael Rubin Resume"
    />
  );
}
