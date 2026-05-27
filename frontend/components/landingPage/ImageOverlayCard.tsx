import Image from "next/image";

/*
This component displays a background image with reduced opacity
and a centered text overlay on top of it.
*/
type ImageOverlayCardProps = {
  image: string;
  text: string;
};

function ImageOverlayCard({ image, text }: ImageOverlayCardProps) {
  return (
    <div className="relative w-full h-100 rounded-xl overflow-hidden flex items-center justify-center text-center">
      
      {/* Background Image */}
      <Image
        src={image}
        alt={text}
        fill
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Optional dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Text */}
      <h2 className="relative z-10 text-white text-xl font-bold">
        {text}
      </h2>

    </div>
  );
}

export default ImageOverlayCard;
