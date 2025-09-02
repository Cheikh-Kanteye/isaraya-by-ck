import React, { useState } from 'react';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_PLACEHOLDER_IMAGE = '/placeholder.svg'; // Vous pouvez remplacer par votre propre image placeholder

const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  fallbackSrc = DEFAULT_PLACEHOLDER_IMAGE,
  alt,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Réinitialiser l'état si le src externe change
  React.useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  return <img src={currentSrc} alt={alt} onError={handleError} {...props} />;
};

export default FallbackImage;
