interface LogoProps {
  dynamicSize: string;
}

export default function Logo({ dynamicSize }: LogoProps) {
  return (
    <div
      className={`font-(family-name:--font-do_hyeon) flex justify-center items-center w-full select-none`}
    >
      <p
        style={
          {
            //textShadow: "0 0 60px rgba(255, 122, 48, 0.6)",
          }
        }
        className={`${dynamicSize} bg-gradient-to-r from-[#EAEAEA] to-[#A6A6A8] bg-clip-text text-transparent`} //bg-gradient-to-r from-[#0A84FF] to-[#5865F2] bg-clip-text text-transparent
      >
        Octillion
      </p>
    </div>
  );
}
