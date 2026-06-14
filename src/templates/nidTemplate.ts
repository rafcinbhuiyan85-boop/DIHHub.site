export const NID_FRONT_SVG = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320">
  <rect x="0" y="0" width="500" height="320" fill="#ffffff" stroke="#999999" stroke-width="0.5"/>
  
  <!-- Outer Border Pattern -->
  <rect x="5" y="5" width="490" height="310" fill="none" stroke="#cccccc" stroke-width="0.5" stroke-dasharray="1,1"/>

  <!-- Centered Watermark Seal -->
  <g transform="translate(250, 185) scale(2.2)" opacity="0.1">
    <circle cx="0" cy="0" r="45" fill="none" stroke="#eab308" stroke-width="2"/>
    <circle cx="0" cy="0" r="38" fill="none" stroke="#eab308" stroke-width="1"/>
    <text font-family="Arial, sans-serif" font-size="4" font-weight="900" fill="#eab308" text-anchor="middle" y="32">ELECTION COMMISSION BANGLADESH</text>
    <path fill="#eab308" d="M0,-25 L5,-5 L20,-5 L8,5 L12,25 L0,15 L-12,25 L-8,5 L-20,-5 L-5,-5 Z" opacity="0.5"/>
  </g>

  <!-- Header -->
  <g transform="translate(15, 12)">
    <circle cx="35" cy="35" r="32" fill="#006a4e"/>
    <circle cx="35" cy="35" r="22" fill="#f42a41"/>
    <!-- Stylized Map -->
    <path fill="#eab308" d="M35,22 C30,24 28,30 30,35 C32,40 35,45 40,40 C42,35 40,28 35,22 Z" />
    
    <g transform="translate(90, 8)">
      <text font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#000000" text-anchor="middle" x="185">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
      <text font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#006a4e" text-anchor="middle" x="185" y="22">Government of the People's Republic of Bangladesh</text>
      <text font-family="Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle" x="185" y="48">
        <tspan fill="#f42a41">National ID Card </tspan>
        <tspan fill="#000000"> / জাতীয় পরিচয়পত্র</tspan>
      </text>
    </g>
  </g>
  
  <line x1="10" y1="92" x2="490" y2="92" stroke="#000000" stroke-width="1.8"/>
  
  <!-- Fields -->
  <g transform="translate(30, 115)">
    <!-- Photo Frame -->
    <rect x="0" y="0" width="115" height="135" fill="none" stroke="#dddddd" stroke-width="1"/>
    
    <g transform="translate(130, 0)">
      <text font-family="Arial, sans-serif" font-size="18" font-weight="bold" y="22" fill="#000000">নাম: </text>
      <text font-family="Arial, sans-serif" font-size="16" font-weight="bold" y="55" fill="#000000">Name: </text>
      <text font-family="Arial, sans-serif" font-size="18" font-weight="bold" y="88" fill="#000000">পিতা: </text>
      <text font-family="Arial, sans-serif" font-size="18" font-weight="bold" y="121" fill="#000000">মাতা: </text>
      
      <g transform="translate(0, 160)">
        <text font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#000000">Date of Birth: </text>
      </g>
      <g transform="translate(0, 205)">
        <text font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#000000">ID NO: </text>
      </g>
    </g>
    
    <!-- Signature Line -->
    <g transform="translate(0, 145)">
       <line x1="0" y1="15" x2="115" y2="15" stroke="#999999" stroke-width="0.5" stroke-dasharray="2,1"/>
       <text x="57" y="28" font-family="Arial" font-size="10" fill="#999999" text-anchor="middle">Signature</text>
    </g>
  </g>
</svg>`;

export const NID_BACK_SVG = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320">
  <rect x="0" y="0" width="500" height="320" fill="#ffffff" stroke="#999999" stroke-width="0.5"/>
  
  <g transform="translate(20, 40)">
    <text font-family="Arial, sans-serif" font-size="11" font-weight="900" text-anchor="middle" x="230" fill="#000000">এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি ব্যবহারকারী ব্যতীত অন্য </text>
    <text font-family="Arial, sans-serif" font-size="11" font-weight="900" text-anchor="middle" x="230" y="18" fill="#000000">কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিসে জমা দেয়ার জন্য অনুরোধ করা হলো।</text>
  </g>
  
  <line x1="10" y1="80" x2="490" y2="80" stroke="#000000" stroke-width="1.5"/>
  
  <g transform="translate(30, 105)">
    <text font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#000000">ঠিকানা: </text>
    <text font-family="Arial, sans-serif" font-size="13" y="30" font-weight="900" fill="#333333">বাসা/হোল্ডিং: </text>
    <text font-family="Arial, sans-serif" font-size="13" y="55" font-weight="900" fill="#333333">ডাকঘর: </text>
  </g>
  
  <g transform="translate(30, 190)">
    <text font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#000000">রক্তের গ্রুপ / Blood Group: </text>
  </g>
  
  <line x1="20" y1="210" x2="480" y2="210" stroke="#000000" stroke-width="1"/>
  
  <g transform="translate(20, 260)">
    <text font-family="Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle" x="120" fill="#000000">প্রদানকারী কর্তৃপক্ষের স্বাক্ষর</text>
    <text font-family="Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle" x="380" fill="#000000">প্রদানের তারিখ: </text>
  </g>
  
  <!-- Barcode Pattern -->
  <g transform="translate(20, 285)">
    <rect x="0" y="0" width="460" height="25" fill="#ffffff" stroke="#000000" stroke-width="0.5"/>
    <g>
      ${Array.from({ length: 140 }).map((_, i) => `<rect x="${i * 3.3}" y="1" width="${Math.random() > 0.5 ? 2 : 1}" height="23" fill="#000000"/>`).join('')}
    </g>
  </g>
</svg>`;
