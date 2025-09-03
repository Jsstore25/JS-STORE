import React from 'react';

const VisaIcon: React.FC = () => (
  <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="visa-icon-clip">
        <rect width="60" height="38" rx="4" fill="white"/>
      </clipPath>
    </defs>
    <g clipPath="url(#visa-icon-clip)">
      <rect width="60" height="38" fill="white"/>
      <rect width="60" height="14" fill="#142688"/>
      <rect y="24" width="60" height="14" fill="#F7B600"/>
      <text
        x="30"
        y="19"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fontStyle="italic"
        fill="#142688"
      >
        VISA
      </text>
    </g>
    <rect x="0.5" y="0.5" width="59" height="37" rx="3.5" fill="none" stroke="#E0E0E0" strokeWidth="1"/>
  </svg>
);

const MastercardIcon: React.FC = () => (
  <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="38" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="1"/>
    <circle cx="24" cy="19" r="9" fill="#EB001B"/>
    <circle cx="36" cy="19" r="9" fill="#F79E1B"/>
    <path d="M30 19C30 23.9706 27.3137 28 24 28C20.6863 28 18 23.9706 18 19C18 14.0294 20.6863 10 24 10C27.3137 10 30 14.0294 30 19Z" fill="#FF5F00"/>
  </svg>
);

const AmexIcon: React.FC = () => (
    <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="4" fill="#006FCF"/>
      <text x="30" y="17.5" textAnchor="middle" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="7" fill="white" fontWeight="700">AMERICAN</text>
      <text x="30" y="26.5" textAnchor="middle" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="7" fill="white" fontWeight="700">EXPRESS</text>
    </svg>
);

const DinersIcon: React.FC = () => (
    <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="1"/>
      <circle cx="16" cy="19" r="8" fill="#0079BE"/>
      <rect x="8" y="18" width="16" height="2" fill="white"/>
      <text x="30" y="22" fontFamily="Arial, sans-serif" fontSize="7" fill="#0079BE" fontWeight="bold">Diners Club</text>
    </svg>
);

const EloIcon: React.FC = () => (
    <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="38" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="1"/>
        <circle cx="30" cy="19" r="12" fill="#222222"/>
        <text x="30" y="20" dominantBaseline="middle" textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="10" fontWeight="bold" fill="white">elo</text>
    </svg>
);

const HipercardIcon: React.FC = () => (
    <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="38" rx="4" fill="#D7142D"/>
        <text x="30" y="23" fontFamily="Verdana, sans-serif" fontStyle="italic" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">Hipercard</text>
    </svg>
);

const PixIcon: React.FC = () => (
    <svg width="60" height="38" viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="4" fill="#32BCAD"/>
      
      {/* PIX Symbol */}
      <g transform="translate(6, 7)">
        <path d="M12 1.65685L22.3431 12L12 22.3431L1.65685 12L12 1.65685Z" fill="white"/>
        <path d="M12 6.65685C14.0711 6.65685 15.75 7.86802 16.5355 9.46447C16.9575 8.93251 17 8.26165 17 7.53553C17 4.49239 14.7614 2 12 2C9.23858 2 7 4.49239 7 7.53553C7 8.26165 7.04249 8.93251 7.46447 9.46447C8.25 7.86802 9.92893 6.65685 12 6.65685Z" fill="#32BCAD"/>
        <path d="M12 17.3431C9.92893 17.3431 8.25 16.132 7.46447 14.5355C7.04249 15.0675 7 15.7383 7 16.4645C7 19.5076 9.23858 22 12 22C14.7614 22 17 19.5076 17 16.4645C17 15.7383 16.9575 15.0675 16.5355 14.5355C15.75 16.132 14.0711 17.3431 12 17.3431Z" fill="#32BCAD"/>
      </g>
      
      {/* "pix" text using strokes */}
      <g transform="translate(1, 1)" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* p */}
        <path d="M33 23V13 C33 10.5 35 9 37.5 9 C40 9 42 10.5 42 13 V18 C42 20.5 40 22 37.5 22 H33"/>
        {/* i */}
        <line x1="45" y1="23" x2="45" y2="9"/>
        {/* x */}
        <path d="M49 9 C51.5 12, 51.5 20, 49 23"/>
        <path d="M55 9 C52.5 12, 52.5 20, 55 23"/>
      </g>
      {/* i dot */}
      <path d="M45 5.5 L46 6.5 L45 7.5 L44 6.5 Z" fill="white"/>
    </svg>
);


export const PaymentMethods: React.FC = () => {
    return (
        <div className="flex justify-center items-center flex-wrap gap-2">
            <span title="Visa" aria-label="Visa"><VisaIcon /></span>
            <span title="Mastercard" aria-label="Mastercard"><MastercardIcon /></span>
            <span title="American Express" aria-label="American Express"><AmexIcon /></span>
            <span title="Diners Club" aria-label="Diners Club"><DinersIcon /></span>
            <span title="Elo" aria-label="Elo"><EloIcon /></span>
            <span title="Hipercard" aria-label="Hipercard"><HipercardIcon /></span>
            <span title="PIX" aria-label="PIX"><PixIcon /></span>
        </div>
    );
};
