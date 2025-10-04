interface LogoProps {
  dynamicSize: string;
}

export default function Logo({ dynamicSize }: LogoProps) {
  return (
    <div
      className={`font-(family-name:--font-do_hyeon) flex justify-center items-center w-full select-none`}
    >
      <p
        style={{
          textShadow: "0 0 60px rgba(255, 122, 48, 0.6)",
        }}
        className={`${dynamicSize} bg-gradient-to-r from-[#FF7A30] to-[#465C88] bg-clip-text text-transparent `}
      >
        Octillion
      </p>
    </div>
  );
}
