import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QrCode = ({id_menu=null}) => {
  const value = window.location.hostname +"/menu/"+id_menu;
  return (
    <div className="p-4 flex justify-center items-center">
      <QRCodeSVG value={value} size={200} level="H" includeMargin />
    </div>
  );
};

export default QrCode;
