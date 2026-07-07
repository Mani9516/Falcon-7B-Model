import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Qubi"
      width={size}
      height={size}
      className={`rounded-xl object-cover ${className}`}
      priority
    />
  );
}
