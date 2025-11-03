interface LogoProps {
  dynamicSize: string;
}

export default function Logo({ dynamicSize }: LogoProps) {
  return (
    <div className="font-(family-name:--font-do_hyeon) flex justify-center items-center w-full select-none">
      <p
        className={`${dynamicSize} bg-gradient-to-r from-[#3A3A3C] to-[#8E8E93] dark:from-[#EAEAEA] dark:to-[#A6A6A8] bg-clip-text text-transparent`}
      >
        Octillion
      </p>
    </div>
  );
}
